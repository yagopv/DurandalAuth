/** 
    * @module Module for managing user accounts
    * @requires appsecurity
    * @requires errorHandler
    * @requires logger
*/

define(['services/appsecurity', 'services/errorhandler', 'services/logger'], function (appsecurity, errorhandler, logger) {

    var hasAccount = ko.observable(),
        newPassword = ko.observable().extend({ required: true, minLength: 6 }),
        oldPassword = ko.observable().extend({ required: true, minLength: 6 }),
        confirmNewPassword = ko.observable().extend({ required: true, minLength: 6, equal : newPassword });
    
    var viewmodel = {
        
        /** @property {observable} hasAccount - Has the authenticated user any account */         
        hasAccount: hasAccount,
        
        /** @property {observable} newPassword */
        newPassword: newPassword,
        
        /** @property {observable} oldPassword */
        oldPassword: oldPassword,
        
        /** @property {observable} confirmNewPassword */
        confirmNewPassword: confirmNewPassword,
        
        /**
         * Change the password of the current authenticated user
         * @method
        */
        changePassword: function () {
            var self = this;
            if (this.errors().length != 0) {
                this.errors.showAllMessages();
                return;
            }
            appsecurity.changePassword(this.oldPassword(), this.newPassword(), this.confirmNewPassword())
            .then(function () {
                    appsecurity.hasLocalAccount().then(function (data) {
                    self.hasAccount(data);
                    logger.logSuccess("Password changed succesfully", null, null, true, 'success');
                });
            }).fail(self.handlevalidationerrors);
        },
        
        /**
         * Create a local account
         * @method
        */        
        createLocalAccount: function () {
            var self = this;
            if (this.errors().length != 0) {
                this.errors.showAllMessages();
                return;
            }
            appsecurity.createLocalAccount(this.newPassword(), this.confirmNewPassword())
            .then(function () {
                appsecurity.hasLocalAccount().then(function (data) {
                    self.hasAccount(data);
                    self.oldPassword("");
                    self.confirmNewPassword("");
                });
            }).fail(self.handlevalidationerrors);
        },
        
        /**
         * Activate view
         * @method
         * @return {promise} - Promise of user having an account
        */          
        activate: function () {            
            var self = this;
            return appsecurity.hasLocalAccount()
                .then(function (data) {
                    self.hasAccount(data);
                }).fail(self.handlevalidationerrors);
        }
    }
    
    errorhandler.includeIn(viewmodel);

    viewmodel["errors"] = ko.validation.group(viewmodel);
    
    return viewmodel;
        
});