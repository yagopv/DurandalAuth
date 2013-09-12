define(['plugins/router'], function (router) {
    return {
        router: router,

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        }
    };
});