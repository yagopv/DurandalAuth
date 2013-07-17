define(function () {
    return {
        articles: ko.observable(),
        viewAttached : function() {
            Stashy.Table("#articles", { idprefix : "art-", menuClass: "btn btn-primary" }).on();
        },
        activate: function () {
            var self = this;
            return $.get("api/article").then(function (data) {
                self.articles(data);
            });
        }
    }
});