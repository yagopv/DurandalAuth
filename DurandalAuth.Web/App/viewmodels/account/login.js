/** 
    * @module Manage Login for the entire app
    * @requires appsecurity
    * @requires router
    * @requires errorHandler
    * @requires utils
*/

define(['services/appsecurity', 'durandal/plugins/router', 'services/utils', 'services/errorhandler'],
    function (appsecurity, router, utils, errorhandler) {

        var username = ko.observable().extend({ required: true }),
            password = ko.observable().extend({ required: true, minLength: 6 }),
            rememberMe = ko.observable(),
            returnUrl = ko.observable(),
            isRedirect = ko.observable(false),
            isAuthenticated = ko.observable(false);

        var viewmodel =  {
            
            /** @property {observable} username */
            username : username,
            
            /** @property {observable} password */
            password : password,
            
            /** @property {observable} rememberMe - Remember the user for the following visits */
            rememberMe : rememberMe,
            
            /** @property {observable} returnUrl */
            returnUrl : returnUrl,
            
            /** @property {observable} isRedirect */
            isRedirect : isRedirect,
            
            /** @property {appsecurity} appsecurity */
            appsecurity: appsecurity,

            /**
              * Activate view
              * @method
              * @return {promise} - Promise of getting external logins and showing them in the view
            */   
            activate : function () {
                var redirect = utils.getURLParameter("redirectto");
                if (redirect != "null") {
                    this.isRedirect(true);
                }
                this.returnUrl(redirect != "null" ? redirect : "account");
            },

            /**
             * Login the user using forms auth
             * @method
            */
            login: function () {

                if (this.errors().length != 0) {
                    this.errors.showAllMessages();
                    return;
                }

                var credential = new appsecurity.credential(this.username(), this.password(), this.rememberMe() || false),
                    self = this;

                appsecurity.login(credential, self.returnUrl())
                    .fail(self.handlevalidationerrors);
            },

            /**
             * Logout user
             * @method
            */
            logout: function () {
                appsecurity.logout();
            }

        }

        errorhandler.includeIn(viewmodel);

        viewmodel["errors"] = ko.validation.group(viewmodel);

        return viewmodel;
    });