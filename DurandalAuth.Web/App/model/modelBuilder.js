define(['services/appsecurity','services/utils'],
    function (appsecurity,utils) {
        var foreignKeyInvalidValue = 0;

        var self = {
            extendMetadata: extendMetadata
        };

        return self;

        function extendMetadata(metadataStore) {
            extendArticle(metadataStore);
            extendCategory(metadataStore);
            extendTag(metadataStore);
        };

        function extendArticle(metadataStore) {
            var articleCtor = function () {
                this.articleId = ko.observable(breeze.core.getUuid());
                this.imageUrl = ko.observable("/Content/icons/no_photo.png");
                this.createdBy = ko.observable(typeof (appsecurity.userInfo()) !== 'undefined' ? appsecurity.userInfo().userName : "");
                this.updatedBy = ko.observable(typeof (appsecurity.userInfo()) !== 'undefined' ? appsecurity.userInfo().userName : "");
                this.isPublished = ko.observable(false);
                var date = utils.getCurrentDate();
                this.createdDate = ko.observable(date);
                this.updatedDate = ko.observable(date);
            };

            articleCtor.prototype.addTag = function (tagname) {
                var tag = this.entityAspect.entityManager.createEntity('Tag', { name: tagname, articleId: this.articleId() });
                this.tags.push(tag);
                return tag;
            };

            articleCtor.prototype.deleteTag = function (tag) {
                ensureEntityType(tag, 'Tag');
                this.throwIfNotOwnerOf(tag);

                tag.entityAspect.setDeleted();
            };

            articleCtor.prototype.throwIfNotOwnerOf = function (obj) {
                if (!obj.articleId || obj.articleId() !== this.articleId()) {
                    throw new Error('Object is not associated with current Article');
                }
            };

            var articleInitializer = function (article) {
                addValidationRules(article);
                addhasValidationErrorsProperty(article);
                article.splitTags = ko.computed(function () {
                    var computedtags = [];
                    ko.utils.arrayForEach(article.tags(), function (tag) {
                        computedtags.push(tag.name());
                    });
                    return computedtags.join(",");
                });
                article.formattedCreatedDate = ko.computed(function () {
                    return moment(article.createdDate()).format('MMM Do YY');
                });
                article.unsavedChanges = ko.observable(article.entityAspect.entityState.isAddedModifiedOrDeleted());
            };

            metadataStore.registerEntityTypeCtor('Article', articleCtor, articleInitializer);
        };
        
        function extendCategory(metadataStore) {
            var categoryCtor = function () {
                this.categoryId = ko.observable(breeze.core.getUuid());
            };
            metadataStore.registerEntityTypeCtor('Category', categoryCtor);
        };

        function extendTag(metadataStore) {
            var tagCtor = function () {
                this.tagId = ko.observable(breeze.core.getUuid());
            };
            metadataStore.registerEntityTypeCtor('Tag', tagCtor);
        };

        function ensureEntityType(obj, entityTypeName) {
            if (!obj.entityType || obj.entityType.shortName !== entityTypeName) {
                throw new Error('Object must be an entity of type ' + entityTypeName);
            }
        };

        function addValidationRules(entity) {
            var entityType = entity.entityType,
                i,
                property,
                propertyName,
                propertyObject,
                validators,
                u,
                validator,
                nValidator;

            if (entityType) {
                for (i = 0; i < entityType.dataProperties.length; i += 1) {
                    property = entityType.dataProperties[i];
                    propertyName = property.name;
                    propertyObject = entity[propertyName];
                    validators = [];

                    for (u = 0; u < property.validators.length; u += 1) {
                        validator = property.validators[u];
                        nValidator = {
                            propertyName: propertyName,
                            validator: function (val) {
                                var error = this.innerValidator.validate(val, { displayName: this.propertyName });
                                this.message = error ? error.errorMessage : "";
                                return error === null;
                            },
                            message: "",
                            innerValidator: validator
                        };
                        validators.push(nValidator);
                    }
                    propertyObject.extend({
                        validation: validators
                    });
                }

                for (i = 0; i < entityType.foreignKeyProperties.length; i += 1) {
                    property = entityType.foreignKeyProperties[i];
                    propertyName = property.name;
                    propertyObject = entity[propertyName];

                    validators = [];
                    for (u = 0; u < property.validators.length; u += 1) {
                        validator = property.validators[u];
                        nValidator = {
                            propertyName: propertyName,
                            validator: function (val) {
                                var error = this.innerValidator.validate(val, { displayName: this.propertyName });
                                this.message = error ? error.errorMessage : "";
                                return error === null;
                            },
                            message: "",
                            innerValidator: validator
                        };
                        validators.push(nValidator);
                    }
                    propertyObject.extend({
                        validation: validators
                    });
                    if (!property.isNullable) {
                        //Bussiness Rule: 0 is not allowed for required foreign keys
                        propertyObject.extend({ notEqual: foreignKeyInvalidValue });
                    }
                }
            }
        };

        function addhasValidationErrorsProperty(entity) {

            var prop = ko.observable(false);

            var onChange = function () {
                var hasError = entity.entityAspect.getValidationErrors().length > 0;
                if (prop() === hasError) {
                    // collection changed even though entity net error state is unchanged
                    prop.valueHasMutated(); // force notification
                } else {
                    prop(hasError); // change the value and notify
                }
            };

            onChange();             // check now ...
            entity.entityAspect // ... and when errors collection changes
                .validationErrorsChanged.subscribe(onChange);

            // observable property is wired up; now add it to the entity
            entity.hasValidationErrors = prop;
        };
    });