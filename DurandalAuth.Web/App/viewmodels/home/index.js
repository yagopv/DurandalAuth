define(['plugins/router', 'viewmodels/home/registerInterest', 'viewmodels/dialog', 'services/errorhandler'],
    function (router, registerInterest, dialog, errorHandler) {

    return {

        convertRouteToHash: router.convertRouteToHash,

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });                      
        },

        register: function(){
            var reg = registerInterest.create();
            dialog.show(reg, ['Submit', 'Cancel'])
            .then(function (response) {
                if (response === 'Submit') {
                    alert('submitted');
                }
            })
            .done();
    }
    };
});