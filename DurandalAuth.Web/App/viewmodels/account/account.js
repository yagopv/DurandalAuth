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
        confirmNewPassword = ko.observable().extend({ required: true, minLength: 6, equal: newPassword }),
        externalAccounts = ko.observableArray(),
        showRemoveButton = ko.observable();
    
    var viewmodel = {
        
        /** @property {observable} hasAccount - Has the authenticated user any account */         
        hasAccount: hasAccount,
        
        /** @property {observable} newPassword */
        newPassword: newPassword,
        
        /** @property {observable} oldPassword */
        oldPassword: oldPassword,
        
        /** @property {observable} confirmNewPassword */
        confirmNewPassword: confirmNewPassword,

        /** @property {observable} externalAccounts - Collection of external account for the authenticated user */
        externalAccounts: externalAccounts,

        /** @property {observable} showRemoveButton */
        showRemoveButton: showRemoveButton,

        /** @property {appsecurity} appsecurity */
        appsecurity: appsecurity,

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
                    logger.logSuccess("Password changed succesfully", null, null, true);
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
         * Remove a external associated account 
         * @method
         * @param {object} parent
         * @param {object} data
         * @param {object} event
        */
        removeExternalAccount: function (parent, data, event) {
            var self = this;
            appsecurity.dissasociate(data.Provider, data.ProviderUserId)
                   .then(function (message) {
                       logger.logSuccess(message, null, null, true);                       
                       appsecurity.externalAccounts()
                           .then(function (accounts) {
                                self.externalAccounts(accounts.ExternalLogins);
                                self.showRemoveButton(accounts.ShowRemoveButton);
                           })
                           .fail(self.handlevalidationerrors);
                   })
                   .fail(self.handlevalidationerrors);
        },

        /**
         * Activate view
         * @method
         * @return {promise} - Promise of user having an account
        */          
        activate: function () {            
            var self = this;
            return $.when(appsecurity.hasLocalAccount(), appsecurity.externalAccounts())
                .then(function (haslocal, accounts) {
                    self.hasAccount(haslocal[0]);
                    self.externalAccounts(accounts[0].ExternalLogins);
                    self.showRemoveButton(accounts[0].ShowRemoveButton);
                })
                .fail(self.handlevalidationerrors);
        }
    }
    
    errorhandler.includeIn(viewmodel);

    viewmodel["errors"] = ko.validation.group(viewmodel);
    
    return viewmodel;
        
});