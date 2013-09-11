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
        attached : function() {
            $(document).find("footer").show();
        },
        activate: function () {
            var self = this;            

            return entitymanagerprovider
                    .prepare()
                    .then(function() {
                        appsecurity.getAuthInfo()
                            .then(function (authinfo) {

                                // Get current auth info
                                appsecurity.user(authinfo);

                                //configure routing
                                router.makeRelative({ moduleId: 'viewmodels' });

                                // If the route has the authorize flag and the user is not logged in => navigate to login view                                
                                router.guardRoute = function (instance, instruction) {
                                    if (instruction.config.authorize) {
                                        if (appsecurity.user().IsAuthenticated && appsecurity.isUserInRole(instruction.config.authorize)) {
                                            return true
                                        } else {
                                            return "/account/login?redirectto=" + instruction.fragment;
                                        }
                                    }
                                    return true;
                                }

                                // Config Routes
                                // Routes with authorize flag will be forbidden and will redirect to login page
                                // As this is javascript and is controlled by the user and his browser, the flag is only a UI guidance. You should always check again on 
                                // server in order to ensure the resources travelling back on the wire are really allowed

                                return router.map([
                                    // Nav urls
                                    { route: '',                                      moduleId: 'home/index',                        title: 'Home',                        nav: true },
                                    { route: 'home/articles',                         moduleId: 'home/articles',                     title: 'Articles',                    nav: true },
                                    { route: 'home/about',                            moduleId: 'home/about',                        title: 'About',                       nav: true },
                                    { route: 'notfound',                              moduleId: 'notfound',                          title: 'Not found',                   nav: false },

                                    // Admin panel url
                                    { route: 'admin/panel',                           moduleId: 'admin/panel',                       title: 'Admin Panel',                 nav: false,  authorize: ["Administrator"] } ,

                                    // Account Controller urls
                                    { route: 'account/login',                         moduleId: 'account/login',                     title: 'Login',                       nav: false },
                                    { route: 'account/externalloginconfirmation',     moduleId: 'account/externalloginconfirmation', title: 'External login confirmation', nav: false },
                                    { route: 'account/externalloginfailure',          moduleId: 'account/externalloginfailure',      title: 'External login failure',      nav: false },
                                    { route: 'account/register',                      moduleId: 'account/register',                  title: 'Register',                    nav: false },
                                    { route: 'account/manage',                        moduleId: 'account/manage',                    title: 'Manage account',              nav: false,  authorize: ["User", "Administrator"] },

                                    // User articles urls
                                    { route: 'user/dashboard',                        moduleId: 'user/dashboard',                    title: 'Dashboard',                   nav: false,  authorize: ["User"]  },
                                    { route: ':createdby/:categorycode/:articlecode', moduleId: 'user/article',                      title: 'Article',                     nav: false },
                                ])
                                .buildNavigationModel()
                                .mapUnknownRoutes('notfound', 'not-found')
                                .activate({ pushState : true });

                            })
                            .fail(self.handlevalidationerrors);
                    })
                    .fail(self.handlevalidationerrors);
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;
});