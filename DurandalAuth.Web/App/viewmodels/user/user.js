define(function () {

    return {
        articles: ko.observable(),
        viewAttached: function () {
            var self = this;
            $.get("api/article").then(function (data) {
                self.articles(data);
                Stashy.Table("#articles", { idprefix: "art-", menuClass: "btn btn-primary" }).on();
            });            
        },
        activate: function () {
            ga('send', 'pageview');
        }
    }
});