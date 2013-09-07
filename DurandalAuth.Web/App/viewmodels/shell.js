define(['plugins/router', 'durandal/app', 'services/appsecurity', 'services/errorhandler', 'services/entitymanagerprovider', 'model/modelBuilder'],
    function (router, app, appsecurity, errorhandler, entitymanagerprovider, modelBuilder) {

    entitymanagerprovider.modelBuilder = modelBuilder.extendMetadata;

    var viewmodel = {
        router: router,
        appsecurity: appsecurity,
        logout: function () {
            var self = this;
            appsecurity.logout().fail(self.handlevalidationerrors);
        },
        viewAttached : function() {
            $(document).find("footer").show();
        },
        activate: function () {
            var self = this;
            // Get current auth info

            return entitymanagerprovider
                    .prepare()
                    .then(function() {
                        appsecurity.getAuthInfo()
                            .then(function(authinfo) {
                                appsecurity.user(authinfo);
                                return router.navigate('home/index');
                            })
                            .fail(self.handlevalidationerrors);
                    })
                    .fail(self.handlevalidationerrors);
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;
});