/** 
    * @module Confirm an external login
    * @requires appsecurity
    * @requires router
    * @requires utils
    * @requires errorHandler
*/

define(['services/appsecurity', 'durandal/plugins/router', 'services/utils', 'services/errorhandler'],
function (appsecurity,router,utils,errorhandler) {

    var DisplayName = ko.observable(),
        UserName = ko.observable().extend({ required: true }),
        Email = ko.observable().extend({ required: true, email:true }),
        ExternalLoginData = ko.observable(),
        ReturnUrl = ko.observable()
    
    var viewmodel =  {
        /** @property {observable} DisplayName */
        DisplayName : DisplayName,
        
        /** @property {observable} UserName */         
        UserName: UserName,
        
        /** @property {observable} Email - Email for the new user */
        Email: Email,

        /** @property {observable} ExternalLoginData - External login data from the provider */
        ExternalLoginData: ExternalLoginData,
        
        /** @property {observable} ReturnUrl - Return url for the success external login */
        ReturnUrl: ReturnUrl,

        /**
         * Activate view
         * @method
        */  
        activate: function () {
            var self = this;
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            return appsecurity.getExternalLoginConfirmationData
                (utils.getURLParameter("returnurl"),
                 utils.getURLParameter("username"),
                 utils.getURLParameter("provideruserid"),
                 utils.getURLParameter("provider"))
                    .then(function (data) {
                        self.DisplayName(data.DisplayName);
                        self.UserName(data.UserName.split("@")[0]);
                        self.Email(data.UserName);
                        self.ExternalLoginData(data.ExternalLoginData);
                        self.ReturnUrl(data.ReturnUrl);
               }).fail(self.handlevalidationerrors);
        },
        
        /**
         * Confirm an exernal account
         * @method
        */
        confirmexternalaccount: function () {
            var self = this;
            if (this.errors().length != 0) {
                this.errors.showAllMessages();
                return;
            }
            appsecurity.confirmExternalAccount(self.DisplayName(), self.UserName(), self.Email(), self.ExternalLoginData())
                .then(function (data) {                    
                    router.navigateTo("/#/" + self.ReturnUrl());
                }).fail(self.handlevalidationerrors);
            }
    }
    
    errorhandler.includeIn(viewmodel);
    
    viewmodel["errors"] = ko.validation.group(viewmodel);
    
    return viewmodel
    
});