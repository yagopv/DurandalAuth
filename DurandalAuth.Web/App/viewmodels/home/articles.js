define(['services/unitofwork', 'services/errorhandler', 'plugins/router'], function (unitofwork, errorhandler, router) {

    var unitofwork = unitofwork.create();

    var viewmodel = {

        convertRouteToHash: router.convertRouteToHash,

        search : ko.observable(""),

        selectedCategory: ko.observable(""),

        page: ko.observable(0),

        count: ko.observable(10),

        categories: ko.observableArray(),        

        articles: ko.observableArray(),

        activate: function () {           
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        },

        attached: function () {
            var self = this;

            Stashy.OffCanvas("#articles .st-offcanvas", {
                closeOnClickOutside : false
            }).layout();

            $("#articles .st-offcanvas").animate({ opacity: 1 }, 500);

            var articles = unitofwork.publicarticles.find(getPredicate(self.search(), self.selectedCategory()), self.page(), self.count())
                                .then(function (articles) {
                                    self.articles(articles);
                                }
            );

            var categories = unitofwork.categories.all()
                                .then(function (categories) {
                                    self.categories(categories)
                                }
            );

            return Q.all([articles, categories]).fail(self.handleError);
        },

        evaluateKey : function () {
            if (event.type == "keypress" && event.keyCode == 13) {
                this.searchArticles(false);
            }
            return true;
        },

        changeSelectedCategory: function (category, parent) {
            parent.selectedCategory(category.categoryId());
            parent.searchArticles(false);
        },

        removeSelectedCategory : function() {
            this.selectedCategory("");
            this.searchArticles(false);
        },

        loadMoreArticles: function () {
            this.page(this.page() + 1);
            this.searchArticles(true);
        },

        searchArticles: function (add) {
            var self = this;
            if (!add) {
                self.page(0);
            }
            unitofwork.publicarticles.find(getPredicate(self.search(), self.selectedCategory()), self.page(), self.count())
                .then(function (articles) {                  
                    if (add) {
                        ko.utils.arrayForEach(articles, function (article) {
                            self.articles.push(article);
                        });                        
                    } else {
                        self.articles(articles);                        
                    }
                    if (articles.length < self.count()) {
                        $("#btn-loadmore").addClass("disabled");
                    } else {
                        $("#btn-loadmore").removeClass("disabled");
                    }
            });
        }
    };

    errorhandler.includeIn(viewmodel);

    return viewmodel;

    function getPredicate(search, category) {
        var predicate = breeze.Predicate.create("isPublished", "==", true);

        if (search) {
            var searchfilter =  breeze.Predicate.create("title", breeze.FilterQueryOp.Contains, search)
                            .or(breeze.Predicate.create("description", breeze.FilterQueryOp.Contains, search))
            predicate = predicate.and(searchfilter);
        }

        if (category) {

            predicate = predicate.and(breeze.Predicate.create("categoryId", "==", category));
        }        

        return predicate;
    }
});