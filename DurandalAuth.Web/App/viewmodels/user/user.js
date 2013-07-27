define('[services/unitofwork]',function (unitofwork) {

    return {
        articles: ko.observable(),
        viewAttached: function () {
            var self = this,
                uow = unitofwork.create();

            uow.articles.all().then(function (data) {
                self.articles(data);
                Stashy.Table("#articles", { idprefix: "art-", menuClass: "btn btn-primary" }).on();
            });            
        },
        activate: function () {
            ga('send', 'pageview');
        }
    }
});