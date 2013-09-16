define(['plugins/router'], function (router) {

    return {

        convertRouteToHash: router.convertRouteToHash,

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            animateFeatured();
            
        },

        attached: function () {
            Stashy.Slider("#index #featured", { showControls: false, showIndicators: false, enableTouch: true }).on();
            animateFeatured();
        },

        deactivate: function () {
            $("#index #featured").animate({ opacity: 0 }, 100);
        }
    };

    function animateFeatured() {
        $("#index #featured").animate({ opacity: 0 }, 100);
        setTimeout(function () {
            $(document).trigger("debouncedresize");
            $("#index #featured").animate({ opacity: 1 }, 100);
        }, 500);
    }
});