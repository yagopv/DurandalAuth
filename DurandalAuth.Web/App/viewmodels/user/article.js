define(['services/unitofwork'], function (unitofwork) {

    var viewmodel = {
        article: ko.observable(),

        activate: function (createdby, categorycode, articlecode) {
            var self = this,
                ref = unitofwork.get(createdby + "/" + categorycode + "/" + articlecode);

            var uow = ref.value();

            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });

            return uow.publicarticles
                .find(breeze.Predicate.create("urlCodeReference", "==", articlecode)
                                        .and("category.urlCodeReference", "==", categorycode)
                                        .and("createdBy", "==", createdby), 0, 1)
                .then(function (article) {
                    self.article(article[0]);
                }
            );
        },

        deactivate: function () {
            unitofwork.get(this.article().createdBy() + "/" +
                           this.article().category().urlCodeReference() + "/" +
                           this.article().urlCodeReference()).release();
        }
    };

    return viewmodel;
});