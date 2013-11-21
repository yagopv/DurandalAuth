define(['services/unitofwork'], function (unitofwork) {
    var viewmodel = {
        userprofiles: ko.observableArray(),

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        },

        attached: function () {
            var self = this,
                uow = unitofwork.create();

            uow.userprofiles.all().then(function (data) {
                self.userprofiles(data);
            });
        }
    }

    return viewmodel;
});