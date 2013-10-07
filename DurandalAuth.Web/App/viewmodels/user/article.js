define(['services/unitofwork','plugins/router'], function (unitofwork, router) {

    var reference;

    var viewmodel = {

        article: ko.observable(),

        activate: function (createdby, categorycode, articlecode) {
            var self = this;

            reference = createdby + "/" + categorycode + "/" + articlecode;

            var ref = unitofwork.get(reference);

            var uow = ref.value();

            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });

            return uow.publicarticles
                .find(breeze.Predicate.create("urlCodeReference", "==", articlecode)
                                        .and("category.urlCodeReference", "==", categorycode)
                                        .and("createdBy", "==", createdby), 0, 1)
                .then(function (article) {
                    article[0] != undefined ? self.article(article[0]) : router.navigate("notfound");
                }
            );
        },

        deactivate: function () {
            unitofwork.get(reference).release();
        }
    };

    return viewmodel;
});