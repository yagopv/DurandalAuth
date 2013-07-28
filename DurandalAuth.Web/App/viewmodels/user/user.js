define(['services/unitofwork'],function (unitofwork) {

    return {
        articles: ko.observableArray(),
        viewAttached: function () {
            var self = this,
                uow = unitofwork.create();

            uow.categories.all().then(function (data) {
                console.log(data);
            });
            uow.tags.all().then(function (data) {
                console.log(data);
            });
            uow.articles.all().then(function (data) {
                self.articles(data);
                Stashy.Table("#articles", { idprefix: "art-", menuClass: "btn btn-primary" }).on();
            });            
        },
        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        }
    }
});