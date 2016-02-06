// Override $.fn.addClass and $.fn.removeClass to trigger the cssClassChanged custom event
(function($) {
	// Overriding the addClass function to trigger a custom event
    var oldAddClass = $.fn.addClass;
    $.fn.addClass = function() {
        var ret = oldAddClass.apply(this, arguments);
        $(this).trigger("cssClassChanged");

        return ret;
    }
    
    // Overriding the removeClass function to trigger a custom event
    var oldRemoveClass = $.fn.removeClass;
    $.fn.removeClass = function() {
    	var ret = oldRemoveClass.apply(this, arguments);
        $(this).trigger("cssClassChanged");
        
        return ret;
    }
})(jQuery);

$(document).ready(function() 
{
    $("#container").mousedown(function(event) {
        switch (event.which) {
            case 1: // Left mouse button
                scrollToNext();
                break;
            case 2: // Middle mouse button
                scrollToPrev();
                break;
        }
    }).on("mousewheel", function (event) {
        if (event.originalEvent.deltaY < 0)
            scrollToPrev();
        else
            scrollToNext();
    });
    
    $(document).keydown(function (event) {
        switch (event.which)
        {
            case 38:
                scrollToPrev();
                break;
            case 40:
                scrollToNext();
                break;
        }
    });
    
    $("#scrollTop").click(scrollToFirst)
        .on("cssClassChanged", toggleScrollTopDisplay);
        
    // Automatically showing or hiding the scrollTop pane when changed sections CSS classes
    $("section").on("cssClassChanged", function () {
        updateScrollTopActiveState();
        updateMenuActiveElement();
    });
    
    // Initialize navigation to the currently active section or the first one
    if ($("section.active").length != 0)
        scrollToSection($("section.active"));
    else
        $("section:first").addClass("active");
    
    populateMenu("#sections-menu");
});

function scrollToNext () 
{
    var target = $("section.active").next("section");

    if (target.length != 0) {
        $("#container").stop(true).animate({
            scrollTop: calcSectionOffset(target)
        }, "slow");

        $("section.active").removeClass("active");
        $(target).addClass("active");
    }
}

function scrollToPrev () 
{
    var target = $("section.active:not(:first-child)").prev("section");

    if (target.length != 0) {
        $("#container").stop(true).animate({
            scrollTop: calcSectionOffset(target)
        }, "slow");

        $("section.active").removeClass("active");
        $(target).addClass("active");
    }
}

function scrollToFirst () 
{
    $("#container").animate({
        scrollTop: 0
    }, "slow");

    $("section:first").addClass("active");
    $("#scrollTop").removeClass("active");
}

function scrollToSection (section)
{
    $("#container").stop(true).animate({
        scrollTop: calcSectionOffset(section)
    }, "slow");

    $("section.active").removeClass("active");
    $(section).addClass("active");
}

function toggleScrollTopDisplay () 
{
    if ($("#scrollTop").hasClass("active")) {
        $("#scrollTop").stop(true).animate({
            "bottom": "0%"
        }, "slow");
    } else {
        $("#scrollTop").stop(true).animate({
            "bottom": "-10%"
        }, "slow");
    }
}

function updateScrollTopActiveState ()
{
    if ($("section.active")[0] === $("section:last")[0])
        $("#scrollTop").addClass("active");
    else
        $("#scrollTop").removeClass("active");
}

function calcSectionOffset (target) 
{
    var offset = 0;
    
    var sections = $("section");
    for (var i = 0; i < sections.length; i++)
    {
        if (sections[i] !== $(target)[0]) {
            offset += $(sections[i]).height();
        } else {
            return offset;
        }
    }
}

function populateMenu (menu)
{
    function createCallback (target)
    {
        return function ()
        {
            scrollToSection("section#" + $(target).attr("id"));
        }
    }
    
    $(menu).append("<ul></ul>");
    $("section").each(function () 
    {
        var name = ($(this).attr("data-menu-label") !== undefined) ? $(this).attr("data-menu-label") : $(this).attr("id");
        var li = $("<li id='" + $(this).attr("id") + "'>" + name + "</li>");
        
        li.click(createCallback(this)).appendTo("ul", menu);
    });
    
    updateMenuActiveElement();
}

function updateMenuActiveElement ()
{
    $("#sections-menu li.active").removeClass("active");
    $("#sections-menu li[id='" + $("section.active").attr("id") + "']").addClass("active");
}