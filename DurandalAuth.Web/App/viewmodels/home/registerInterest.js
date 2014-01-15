define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler'],
    function ($, system, logger, errorHandler) {

        var RegisterInterest = (function () {

            ko.validation.configure({
                registerExtenders: true,
                messagesOnModified: true,
                insertMessages: true,
                parseInputAttributes: true,
                messageTemplate: null
            });

            var ctor = function () {

                this.viewModel = {
                fullName: ko.observable().extend({ required: true }),
                organisation: ko.observable().extend({ required: true }),
                emailAddress: ko.observable().extend({ email: true })
                }
                errorHandler.includeIn(this);
                var self = this;
                this.viewModel.errors = ko.validation.group(self.viewModel);
                this.canSave = ko.computed(function () { return self.viewModel.isValid();})
            
            };

            var self = this;

            system.setModuleId(ctor, 'viewmodels/home/registerInterest');

            ctor.prototype.activate = function (settings) {
                this.settings = settings;
            };

            ctor.prototype.attached = function () {
                // setInterval(flashTitle, 3000);
            }


            ctor.prototype.canDeactivate = function (close) {
                console.log(this.viewModel.errors().length)
                if (this.dialogResult === 'Cancel' || this.viewModel.errors().length==0) {
                    return true;
                }
                else {
                    return false;
                }
                //if  return true;
                //if (close) {
                //   return this.fullName() !== '' && this.emailAddress() !== '';
                //}

                //return true;
            };



            return ctor;

        })();

        return {
            create: create
        }

        function create() {
            return new RegisterInterest();
        }
});