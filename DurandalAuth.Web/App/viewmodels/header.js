define(['plugins/router', 'services/appsecurity', 'services/errorhandler', 'services/utils'],
    function (router, appsecurity, errorhandler, utils) {        

        var viewmodel = {

            router: router,

            appsecurity: appsecurity,

            logout: function () {
                var self = this;
                appsecurity.logout()
                    .done(function () {
                        appsecurity.clearAuthInfo();
                        if (router.activeInstruction().config.authorize) {
                            router.navigate("account/login");
                        }
                        $(".navbar-toggle").click();
                    })
                    .fail(self.handlevalidationerrors);
            },

            closeMenu: function (data, event) {                
                if (["xs", "sm"].indexOf(utils.findBootstrapEnvironment()) != -1) {
                    $(".navbar-collapse").collapse("hide");
                }
            }
        };

        errorhandler.includeIn(viewmodel);

        return viewmodel;
    });