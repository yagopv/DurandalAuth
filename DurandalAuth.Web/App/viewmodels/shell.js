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
            return router.activate('home');
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;
});