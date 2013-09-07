define(function () {

    return {

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });

            // Resize #features
            setTimeout(function () {
                $(document).trigger("debouncedresize");
                $("#index #featured").animate({ opacity: 1 }, 100);
            }, 500);
            
        },

        attached: function () {
            Stashy.Slider("#index #featured", { showControls: false, showIndicators: false, enableTouch: true }).on();
            $("#index #featured").animate({ opacity: 1 }, 500);
        },

        deactivate: function () {
            $("#index #featured").animate({ opacity: 0 }, 100);
        }
    };
});