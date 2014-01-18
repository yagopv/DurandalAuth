define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler', 'services/unitofwork','durandal/app', 'services/customBindings'],
    function ($, system, logger, errorHandler, unitofwork, app, customBindings) {

        var RegisterInterest = (function () {

            var ctor = function () {

                this.respondent = ko.observable();
                this.canSave = ko.observable();

                errorHandler.includeIn(this);
                var self = this;

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


            };

            function notify() {
                console.log('hasChanges');

            }

            ctor.prototype.attached = function () {
                // setInterval(flashTitle, 3000);
            }

            ctor.prototype.canDeactivate = function (close) {
                
                if (this.dialogResult === 'Cancel') {
                    alert('allow cancel')
                    this.unitOfWork.respondents.detach(this.respondent())
                    return true;
                }
                else {
                    //when validateonattach is false, make sure breezeValidation and autofocus are on the first field to avoid an invalid entity remaining after the save fails
                    if (this.dialogResult === 'Submit' && !this.respondent().entityAspect.hasValidationErrors) {
                        
                        var self = this;
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