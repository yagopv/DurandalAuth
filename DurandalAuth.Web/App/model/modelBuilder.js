/** 
 * @module This module has the responsability of creating breeze entities
 *         Add here all your initializers, constructors, ...etc
 * @requires appsecurity
 * @requires utils
 */
define(['services/appsecurity', 'services/utils'],
    function (appsecurity, utils) {

        var foreignKeyInvalidValue = 0;

        var lcEmailValidator;

        var self = {
            extendMetadata: extendMetadata
        };

        return self;


        //Change stock validation messages

        //function customiseValidationMessages() {
        //    breeze.Validator.messageTemplates["required"] = "Dude! The '%displayName%' is really required ... seriously ... as in mandatory";
        //    console.log(breeze.Validator.messageTemplates);
        //}

        /**
         * Extend entities
         * param {BreezeManagerMetadataStore} metadataStore - The breeze metadata store
         */
        function extendMetadata(metadataStore) {
            setupCVFunctions();
            setupCustomValidation();
            extendArticle(metadataStore);
            extendCategory(metadataStore);
            extendTag(metadataStore);
            extendRespondent(metadataStore);
            extendRespondentComment(metadataStore);

        };


        function setupCustomValidation() {
            lcEmailValidator =  breeze.Validator.makeRegExpValidator('lcEmailVal',
                    ///^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    'Not quite a valid email address...')
            
                // Register it with the breeze Validator class. This is only needed for exporting/importing entityManager
                breeze.Validator.register(lcEmailValidator);
        }
        
       // // full function version of the custom validator
       // function setupCVFunctions() {
       //     var emailIsFineValidator = new breeze.Validator(
       //"emailIsFine",              // validator name
       //emailIsFineValidationFn,    // validation function
       //{                           // validator context
       //    displayName: "email address",
       //    messageTemplate: "Your '%displayName%' is nearly OK..."
       //});

       //     var emailIsFineValidationFn = function (value) {

       //         var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
       //         if (value == null) return true; // '== null' matches null and empty string
       //         return (re.test(value));
       //     };
       // }

        function extendRespondentComment(metadataStore) {
            var respondentCommentCtor = function () {

            }
            respondentCommentCtor.prototype.addRespondentComment = function (iRespondentId, iOption, iComment) {
                var respondentComment = this.entityAspect.entityManager.createEntity('Respondent',
                    { option: iOption, comment: iComment, respondentId: iRespondentId });
                return respondentComment;
            }

            respondentCommentCtor.prototype.deleteRespondentComment = function (respondentComment) {
                ensureEntityType(respondentComment, 'RespondentComment');
                this.throwIfNotOwnerOf(respondentComment);

                respondentComment.entityAspect.setDeleted();
            };

            metadataStore.registerEntityTypeCtor('RespondentComment', respondentCommentCtor, null);
        }
        


        function extendRespondent(metadataStore) {
            var respondentCtor = function () {

            }
            respondentCtor.prototype.addRespondent = function (ifullName, iemailAddress, iorganisation) {
                var respondent = this.entityAspect.entityManager.createEntity('Respondent', { fullName: ifullName, emailAddress: iemailAddress, organisation: iOrganisation });
                return respondent;
            }

            respondentCtor.prototype.addRespondentComment = function (iRespondent, iOption, iComment) {
                var respondentComment = this.entityAspect.entityManager.createEntity('RespondentComment',
                    { option: iOption, comment: iComment, respondent: iRespondent });
                return respondentComment;
            }

            respondentCtor.prototype.deleteRespondent = function (respondent) {
                ensureEntityType(respondent, 'Respondent');
                this.throwIfNotOwnerOf(respondent);

                respondent.entityAspect.setDeleted();
            };

            var respondentInitializer = function (respondent) {

                // Add Url validator to the blog property of a Person entity
                // Assume em is a preexisting EntityManager.
                var personType = metadataStore.getEntityType('Respondent'); //get the Respondent type
                var emailProperty = personType.getProperty("emailAddress"); //get the property definition to validate
                
                var validators = emailProperty.validators; // get the property's validator collection
                //validators.push(Validator.required()); // add a new required validator instance
               //validators.push(breeze.Validator.emailAddress({ displayName: "email address", message: 'Your email address is nearly valid...' })); // add a new email validator instance
                validators.push(lcEmailValidator)
                //console.log('validator added')
                //console.log(lcEmailValidator);
                //addValidationRules(respondent);
                //addhasValidationErrorsProperty(respondent);

                respondent.unsavedChanges = ko.observable(respondent.entityAspect.entityState.isAddedModifiedOrDeleted());
            };

            

            metadataStore.registerEntityTypeCtor('Respondent', respondentCtor, respondentInitializer);
        }
        /**
         * Extend articles
         * param {BreezeManagerMetadataStore} metadataStore - The breeze metadata store
         */
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
        
        /**
         * Extend categories
         * param {BreezeManagerMetadataStore} metadataStore - The breeze metadata store
         */
        function extendCategory(metadataStore) {
            var categoryCtor = function () {
                this.categoryId = ko.observable(breeze.core.getUuid());
            };
            metadataStore.registerEntityTypeCtor('Category', categoryCtor);
        };

        /**
         * Extend tags
         * param {BreezeManagerMetadataStore} metadataStore - The breeze metadata store
         */
        function extendTag(metadataStore) {
            var tagCtor = function () {
                this.tagId = ko.observable(breeze.core.getUuid());
            };
            metadataStore.registerEntityTypeCtor('Tag', tagCtor);
        };

        /**
         * Helper function for ensure the type of an entity is the requested
         * param {object} obj - The entity
         * param {string} entityTypeName - The type name
         */
        function ensureEntityType(obj, entityTypeName) {
            if (!obj.entityType || obj.entityType.shortName !== entityTypeName) {
                throw new Error('Object must be an entity of type ' + entityTypeName);
            }
        };


        

        /**
         * Add Knockout.Validation rules from the entities metadata
         */
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
                    //alert(propertyName)

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
                        //console.log(nValidator);
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
                console.log(propertyObject)
            }
        };

        /**
         * Extend the entity with a has errors property
         * param {object} entity - The entity
         */
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