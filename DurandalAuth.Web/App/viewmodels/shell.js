define(['durandal/plugins/router', 'durandal/app','services/appsecurity'], function (router, app, appsecurity) {

    var logout = function () {
        appsecurity.logout();
    },

    activate = function () {
        return router.activate('home');
    }

    return {
        router: router,
        appsecurity : appsecurity,
        logout : logout,
        activate: activate
    };
});