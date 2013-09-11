define(['services/unitofwork', 'services/errorhandler', 'services/logger', 'services/utils'], function (unitofwork, errorhandler, logger, utils) {

    var unitofwork = unitofwork.create();

    var viewmodel = {

        categories: ko.observableArray(),

        selectedArticle: ko.observable(),

        articles: ko.observableArray(),

        updating: ko.observable(false),

        preview: ko.observable(false),

        activate: function () {
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        },

        attached : function(view) {
            var self = this;

            Stashy.FocalPoint("#dashboard img").on();

            $("#dashboard #edited-article").on("hide.bs.modal", function () {
                if (self.selectedArticle().entityAspect.hasValidationErrors) {
                    var validationErrors = ko.validation.group(self.selectedArticle());
                    self.selectedArticle().errors.showAllMessages();                    
                }
                self.selectedArticle().unsavedChanges(self.selectedArticle().entityAspect.entityState.isAddedModifiedOrDeleted());
            });

            Stashy.ShowMeMore("#dashboard-articles .row", {
                linkClass: "btn btn-primary",
                linkText: "Show more articles",
                howMany: 4
            }).on();

            $("#dashboard #edited-article").on("shown.bs.modal", function () {
                $("#dashboard #edited-article .zen-mode").zenForm({ trigger: '#dashboard #edited-article .go-zen' });                
                $("#dashboard #edited-article .zen-mode").keyup();
            });

            $("#dashboard #edited-article").on("zf-destroyed", function () {
                $("#dashboard #edited-article .zen-mode").trigger("change");
            });

            var articles = unitofwork.privatearticles.all()
                                .then(function (articles) {
                                    self.articles(articles);
                                }
            );

            var categories = unitofwork.categories.all()
                                .then(function (categories) {
                                    self.categories(categories)
                                }
            );

            Q.all([articles, categories]).fail(self.handleError);
        },

        newArticle: function () {
            var self = this,
                newarticle = unitofwork.privatearticles.create({ categoryId: this.categories()[0].categoryId() });
            this.articles.unshift(newarticle);
            this.selectedArticle(newarticle);            
            bindTags(self.selectedArticle);
            this.updating(false);
            $('#edited-article').modal("show");
        },

        editArticle: function (article, parent) {
            var self = this;
            this.selectedArticle(article);
            bindTags(self.selectedArticle);
            this.updating(true);
            $('#edited-article').modal("show");
        },

        saveArticles: function () {
            var self = this;

            if (!unitofwork.hasChanges()) {
                return true;
            }

            unitofwork.commit()
                .then(function () {
                    logger.logSuccess("Article saved succesfully", null, null, true);
                    ko.utils.arrayForEach(self.articles(), function (article) {
                        article.unsavedChanges(article.entityAspect.entityState.isAddedModifiedOrDeleted());
                    });
                })
                .fail(this.handleError);

            return true;
        },

        deleteArticle: function (article, parent, closemodal) {
            var self = this;

            ko.utils.arrayForEach(article.tags(), function () {
                article.deleteTag(article.tags()[0]); // Because deleteTag decrement by one
            });

            unitofwork.privatearticles.delete(article);

            unitofwork.commit()
                .then(function () {
                    parent.articles.remove(article);
                    logger.logSuccess("Article removed succesfully", null, null, true);
                    if (closemodal) {
                        $('#edited-article').modal("hide");
                    }
                })
                .fail(self.handleError);
        },

        closeModal: function (article) {
            $('#edited-article').modal("hide");
        },

        changePreview: function (article,parent) {
            parent.preview() ? parent.preview(false) : parent.preview(true)
        },

        convertMarkdown: function (article) {
            article.html(marked(article.markdown()));
        },

        utils : utils
    }

    errorhandler.includeIn(viewmodel);    

    return viewmodel;

    function findTag(tagname, tags) {
        for (var i = 0; i < tags().length; i++)
        {
            if (tagname == tags()[i].name())
            {
                return tags()[i];
            }
        }
    }

    function bindTags(article) {
        $("#tags").tagsInput({
            "onAddTag": function (tag) {
                article().addTag(tag);
            },
            "onRemoveTag": function (tag) {
                article().deleteTag(findTag(tag, article().tags));
            },
            "defaultText": "New tag"
        });
    }
});