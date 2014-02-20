define(['plugins/router', 'viewmodels/home/registerInterest', 'viewmodels/dialog', 'services/errorhandler'],
    function (router, registerInterest, dialog, errorHandler) {
        var myTimer = setInterval(function () { timerFn() }, 1000);
        function timerFn() {


            clearInterval(myTimer);
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
    }
    };
});