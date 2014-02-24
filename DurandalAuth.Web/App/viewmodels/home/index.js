define(['plugins/router', 'viewmodels/home/registerInterest', 'viewmodels/dialog', 'services/errorhandler'],
    function (router, registerInterest, dialog, errorHandler) {
        var myTimer = setInterval(function () { timerFn() }, 1000);
        function timerFn() {


            clearInterval(myTimer);
        }

        function setupRS() {
            $('.bannercontainer').revolution({
                delay: 1000,
                startwidth: 1200,
                startheight: 400,
                autoHeight: "on",
                fullScreenAlignForce: "off",

                onHoverStop: "on",

                thumbWidth: 0,
                thumbHeight: 0,
                thumbAmount: 0,

                hideThumbsOnMobile: "on",
                hideBulletsOnMobile: "on",
                hideArrowsOnMobile: "on",
                hideThumbsUnderResolution: 2000,

                hideThumbs: 1000,

                navigationType: "none",
                navigationArrows: "solo",
                navigationStyle: "round",

                navigationHAlign: "center",
                navigationVAlign: "bottom",
                navigationHOffset: 30,
                navigationVOffset: 30,

                soloArrowLeftHalign: "left",
                soloArrowLeftValign: "center",
                soloArrowLeftHOffset: 20,
                soloArrowLeftVOffset: 0,

                soloArrowRightHalign: "right",
                soloArrowRightValign: "center",
                soloArrowRightHOffset: 20,
                soloArrowRightVOffset: 0,


                touchenabled: "on",

                stopAtSlide: -1,
                stopAfterLoops: -1,
                hideCaptionAtLimit: 0,
                hideAllCaptionAtLilmit: 0,
                hideSliderAtLimit: 0,

                dottedOverlay: "none",

                fullWidth: "off",
                forceFullWidth: "off",
                fullScreen: "off",
                fullScreenOffsetContainer: "#topheader-to-offset",

                shadow: 0

            });
        }

    return {

        convertRouteToHash: router.convertRouteToHash,

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });                      
        },

        register: function(){
            var reg = registerInterest.create();
            dialog.show(reg, ['Submit', 'Cancel'],"Let's keep in touch")
            .then(function (response) {
                if (response === 'Submit') {
                }
            })
            .done();
        },

        attached: function () {
            setupRS();
        }
    };
});