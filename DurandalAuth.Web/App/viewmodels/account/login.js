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
            activate: function () {
                ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
                var redirect = utils.getURLParameter("redirectto");
                if (redirect != "null") {
                    this.isRedirect(true);
                }
                this.returnUrl(redirect != "null" ? redirect : "account");

                return appsecurity.getExternalLogins().then(function (data) {
                    appsecurity.externalLogins(data);
                });
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
            },

            /**
             * Start external Login
             * @method
             * @param {object} parent
             * @param {object} data
             * @param {object} event
            */
            externalLogin: function (parent, data, event) {
                appsecurity.externalLogin(data.Provider, this.returnUrl());
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

        viewmodel["errors"] = ko.validation.group(viewmodel);

        return viewmodel;
    });