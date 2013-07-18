define(['durandal/plugins/router', 'durandal/app', 'services/appsecurity', 'services/errorhandler'],
    function (router, app, appsecurity, errorhandler) {

    var viewmodel = {
        router: router,
        appsecurity : appsecurity,
        logout: function () {
            var self = this;
            appsecurity.logout().fail(self.handlevalidationerrors);
        },
        activate: function () {
            // Get current auth info
            appsecurity.getAuthInfo().then(function (data) {
                appsecurity.user(data);
                return router.activate('home');
            });
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;
});