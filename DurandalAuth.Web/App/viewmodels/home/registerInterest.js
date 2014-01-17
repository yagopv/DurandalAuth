define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler', 'services/unitofwork','durandal/app', 'services/customBindings'],
    function ($, system, logger, errorHandler, unitofwork, app, customBindings) {

        var RegisterInterest = (function () {

            //ko.validation.configure({
            //    registerExtenders: true,
            //    messagesOnModified: true,
            //    insertMessages: true,
            //    parseInputAttributes: true,
            //    messageTemplate: null
            //});

            var ctor = function () {


                this.respondent = ko.observable();
                this.canSave = ko.observable();
                //this.viewModel = {
                //fullName: ko.observable().extend({ required: true }),
                //organisation: ko.observable().extend({ required: true }),
                //emailAddress: ko.observable().extend({ email: true })
                //}
                errorHandler.includeIn(this);
                var self = this;
                //this.respondent.errors = ko.validation.group(self.respondent);

                
                //this.canSave = ko.computed(function () { return self.viewModel.isValid(); })

                var ref = unitofwork.get();
                this.unitOfWork = ref.value();
            
            };

            var self = this;

            system.setModuleId(ctor, 'viewmodels/home/registerInterest');

            ctor.prototype.activate = function (settings) {

                var self = this;

                self.respondent(self.unitOfWork.respondents.create());
                app.on('hasChanges').then(notify);
                console.log(self.respondent);
                
                self.respondent().entityAspect.entityManager.validationErrorsChanged.subscribe(function (changeArgs) {
                    
                    console.log('vchanges');
                    self.canSave(!self.respondent().entityAspect.hasValidationErrors);

                    console.log(self.canSave());
                })

                //var self = this;
                //this.canSave = ko.computed(function () {
                //    alert(self.respondent().entityAspect.hasValidationErrors)
                //    return self.respondent().entityAspect.hasValidationErrors
                //})

            };

            function notify() {
                console.log('hasChanges');

            }

            ctor.prototype.attached = function () {
                // setInterval(flashTitle, 3000);
            }


               


            ctor.prototype.canDeactivate = function (close) {
                
                if (this.dialogResult === 'Cancel') {
                    this.unitOfWork.respondents.detach(this.respondent())
                    return true;
                }
                else {
                    console.log(this.respondent().entityAspect.hasValidationErrors)
                    if (this.dialogResult === 'Submit' && !this.respondent().entityAspect.hasValidationErrors) {
                        
                        var self = this;
                        
                        console.log(self.respondent)
                        console.log(self.respondent().emailAddress)
                        console.log(self.respondent().organisation)
                        this.unitOfWork.commit().fail(
                            self.handleError);
                        return true;
                    }
                    else {
                        
                        return false;
                    }
                }
            }
                //if  return true;
                //if (close) {
                //   return this.fullName() !== '' && this.emailAddress() !== '';
                //}

                //return true;



            return ctor;

        })();

        return {
            create: create
        }

        function create() {
            return new RegisterInterest();
        }
});