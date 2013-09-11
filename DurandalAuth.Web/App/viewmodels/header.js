define(['plugins/router', 'services/appsecurity', 'services/errorhandler'],
    function (router, appsecurity, errorhandler) {        

        var viewmodel = {

            router: router,

            appsecurity: appsecurity,

            logout: function () {
                var self = this;
                appsecurity.logout().fail(self.handlevalidationerrors);
            },

            activate: function () {
                var self = this;

                return appsecurity.getAuthInfo()
                        .then(function (authinfo) {
                            // Get current auth info
                            self.appsecurity.user(authinfo);
                        })
                        .fail(self.handlevalidationerrors);
            }
        };

        errorhandler.includeIn(viewmodel);

        return viewmodel;
    });