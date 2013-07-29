/** 
    * @module Module for managing user accounts
    * @requires appsecurity
    * @requires errorHandler
    * @requires logger
*/

define(['services/appsecurity', 'services/errorhandler', 'services/logger'], function (appsecurity, errorhandler, logger) {
    
    var viewmodel = {
        
        /** @property {observable} hasAccount - Has the authenticated user any account */         
        hasAccount: ko.observable(),
        
        /** @property {observable} returnUrl */
        returnUrl: ko.observable("account"),

        /** @property {object} withLocalForm */
        withLocalForm: {
            oldPassword: ko.observable().extend({ required: true, minLength: 6 }),
            newPassword: ko.observable().extend({ required: true, minLength: 6 }),
            confirmNewPassword: ko.observable().extend({ required: true, minLength: 6 })
        },
        
        /** @property {object} withoutLocalForm */
        withoutLocalForm: {
            newPassword: ko.observable().extend({ required: true, minLength: 6 }),
            confirmNewPassword: ko.observable().extend({required: true, minLength: 6 })
        },

        /** @property {observable} externalAccounts - Collection of external account for the authenticated user */
        externalAccounts: ko.observableArray(),

        /** @property {observable} showRemoveButton */
        showRemoveButton: ko.observable(),

        /** @property {appsecurity} appsecurity */
        appsecurity: appsecurity,

        /**
         * Change the password of the current authenticated user
         * @method
        */
        changePassword: function () {
            var self = this;
            if (!this.withLocalFormErrors.isValid()) {
                this.withLocalFormErrors.errors.showAllMessages();
                return;
            }
            appsecurity.changePassword(this.withLocalForm.oldPassword(), this.withLocalForm.newPassword(), this.withLocalForm.confirmNewPassword())
            .then(function () {
                appsecurity.hasLocalAccount().then(function (data) {
                    self.hasAccount(data);
                    self.withLocalForm.oldPassword("");
                    self.withLocalForm.newPassword("");
                    self.withLocalForm.confirmNewPassword("");
                    self.withLocalFormErrors.errors.showAllMessages(false);
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
            if (!this.withoutLocalFormErrors.isValid()) {
                this.withoutLocalFormErrors.errors.showAllMessages();
                return;
            }
            appsecurity.createLocalAccount(this.withoutLocalForm.newPassword(), this.withoutLocalForm.confirmNewPassword())
            .then(function () {
                appsecurity.hasLocalAccount().then(function (data) {
                    self.hasAccount(data);                    
                    self.withoutLocalForm.newPassword("");
                    self.withoutLocalForm.confirmNewPassword("");
                    logger.logSuccess("Local account created succesfully", null, null, true);
                    appsecurity.externalAccounts()
                        .then(function (accounts) {
                        self.externalAccounts(accounts.ExternalLogins);
                        self.showRemoveButton(accounts.ShowRemoveButton);
                    })
                    .fail(self.handlevalidationerrors);
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
            ga('send', 'pageview', { 'page': window.location.href, 'title' : document.title });
            return $.when(appsecurity.hasLocalAccount(), appsecurity.externalAccounts(),appsecurity.getExternalLogins())
                .then(function (haslocal, accounts, logins) {
                    self.hasAccount(haslocal[0]);
                    self.externalAccounts(accounts[0].ExternalLogins);
                    self.showRemoveButton(accounts[0].ShowRemoveButton);
                    appsecurity.externalLogins(logins[0]);
                })
                .fail(self.handlevalidationerrors);
        },

        /**
         * Start external Login
         * @method
         * @param {object} parent
         * @param {object} data
         * @param {object} event
        */
        externalLogin: function (parent, data, event) {
            appsecurity.externalLogin(data.Provider, this.returnUrl())
                .fail(self.log(data, true));
        },

        /**
         * Get the social icon class (Font-Awesome) for the social logins
         * @method
         * @param {object} data
         * @return {string} - Icon class
        */
        socialIcon: function (data) {
            var icon = "";
            switch (data.Provider.toLowerCase()) {
                case "facebook":
                    icon = "icon-facebook-sign"
                    break;
                case "twitter":
                    icon = "icon-twitter-sign"
                    break;
                case "google":
                    icon = "icon-google-plus-sign"
                    break;
                case "microsoft":
                    icon = "icon-envelope"
                    break;
                default:
                    icon = "icon-check-sign"
            }
            return icon;
        }
    }
    
    errorhandler.includeIn(viewmodel);

    viewmodel["withLocalFormErrors"] = ko.validatedObservable(viewmodel.withLocalForm);
    viewmodel["withoutLocalFormErrors"] = ko.validatedObservable(viewmodel.withoutLocalForm);

    return viewmodel;
        
});