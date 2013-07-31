define(['durandal/plugins/router', 'durandal/app', 'services/appsecurity', 'services/errorhandler','services/entitymanagerprovider'],
    function (router, app, appsecurity, errorhandler, entitymanagerprovider) {

    var viewmodel = {
        router: router,
        appsecurity : appsecurity,
        logout: function () {
            var self = this;
            appsecurity.logout().fail(self.handlevalidationerrors);
        },
        viewAttached : function() {
            $(document).find("footer").show();
        },
        activate: function () {
            // Get current auth info
            $.when(appsecurity.getAuthInfo(), entitymanagerprovider.prepare())
                .then(function (authinfo, entitymanagerinfo) {
                    appsecurity.user(authinfo[0]);
                    return router.activate('home');
                })
                .fail(self.handlevalidationerrors);
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;
});