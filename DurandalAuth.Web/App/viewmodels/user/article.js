define(['services/unitofwork'], function (unitofwork) {

    var viewmodel = {
        article: ko.observable(),

        activate: function (splat) {
            var self = this,
                ref = unitofwork.get(splat.urlcodereference);

            var uow = ref.value();

            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });

            return uow.publicarticles
                .find(breeze.Predicate.create("urlCodeReference", "==", splat.urlcodereference)
                                        .and("category.name", "==", splat.category)
                                        .and("createdBy", "==", splat.createdby), 0, 1)
                .then(function (article) {
                    self.article(article[0]);
                }
            );
        },

        deactivate: function () {
            unitofwork.get(this.article().urlCodeReference()).release();
        }
    };

    return viewmodel;
});