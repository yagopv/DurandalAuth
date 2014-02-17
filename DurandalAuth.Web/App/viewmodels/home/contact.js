/// <reference path="../../../Scripts/jquery.pfold.js" />
define(['plugins/router', 'viewmodels/home/registerInterest', 'services/errorhandler'], function (router, registerInterest, errorHandler) {
    var activeScreen = ko.observable();
    

    return {
        convertRouteToHash: router.convertRouteToHash,
        activeScreen: activeScreen,
        activate: function (resid) {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            var reg = registerInterest.create(resid);
            activeScreen(reg);

        },
        attached: function () {

        }
    };





});