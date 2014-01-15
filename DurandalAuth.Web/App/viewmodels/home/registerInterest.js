define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler'],
    function ($, system, logger, errorHandler) {

        var RegisterInterest = (function () {

            var ctor = function () {
                this.fullName = ko.observable();
                this.organisation = ko.observable();
                this.emailAddress = ko.observable();
                errorHandler.includeIn(this);

            };

            var self = this;

            system.setModuleId(ctor, 'viewmodels/home/registerInterest');

            ctor.prototype.activate = function (settings) {
                this.settings = settings;
            };

            ctor.prototype.attached = function () {
                // setInterval(flashTitle, 3000);
            }

            ctor.prototype.submit = function () {

                alert(self.emailAddress());

            }

            ctor.prototype.canDeactivate = function (close) {
                if (self.dialogResult === 'Cancel') return true;
                if (close) {
                   return this.fullName() !== '' && this.emailAddress() !== '';
                }

                return true;
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