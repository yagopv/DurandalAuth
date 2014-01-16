define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler', 'services/unitofwork','durandal/app'],
    function ($, system, logger, errorHandler, unitofwork, app) {

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
                //this.viewModel = {
                //fullName: ko.observable().extend({ required: true }),
                //organisation: ko.observable().extend({ required: true }),
                //emailAddress: ko.observable().extend({ email: true })
                //}
                errorHandler.includeIn(this);
                var self = this;
                this.respondent.errors = ko.validation.group(self.respondent);
                //this.canSave = ko.computed(function () { return self.viewModel.isValid(); })

                var ref = unitofwork.get();
                this.unitOfWork = ref.value();
            
            };

            var self = this;

            system.setModuleId(ctor, 'viewmodels/home/registerInterest');

            ctor.prototype.activate = function (settings) {
                this.respondent(this.unitOfWork.respondents.create());
                app.on('hasChanges').then(notify);
                //this.settings = settings;
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
                        
                        console.log(self.respondent().fullName())
                        console.log(self.respondent().emailAddress())
                        console.log(self.respondent().organisation())
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