/** 
 * @module Manage Account
 * @requires appsecurity
 * @requires router
 * @requires errorHandler
 */

define(['services/appsecurity', 'plugins/router', 'services/errorhandler'],
    function (appsecurity, router, errorhandler) {

        var username = ko.observable().extend({ required: true }),
            password = ko.observable().extend({ required: true, minLength: 6 }),
            rememberMe = ko.observable(),
            returnUrl = ko.observable(),
            isRedirect = ko.observable(false),
            isAuthenticated = ko.observable(false);

        function ExternalLoginProviderViewModel(data) {
            var self = this;

            // Data
            self.name = ko.observable(data.name);
            
            // Operations
            self.login = function () {
                sessionStorage["state"] = data.state;
                sessionStorage["loginUrl"] = data.url;
                // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage temporarily
                // to localStorage to work around this problem.
                appsecurity.archiveSessionStorageToLocalStorage();
                
                window.location = data.url;
            };

            /**
             * Get the social icon class (Font-Awesome) for the social logins
             * @method
             * @param {object} data
             * @return {string} - Icon class
            */
            self.socialIcon = function (data) {
                var icon = "";
                switch (data.name.toLowerCase()) {
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

        var viewmodel =  {
            
            /** @property {function} convertRouteToHash */
            convertRouteToHash: router.convertRouteToHash,

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

            /** @property {observableArray} externalLoginProviders */
            externalLoginProviders: ko.observableArray(),

            /**
              * Activate view
              * @method
              * @return {promise} - Promise of getting external logins and showing them in the view
            */   
            activate: function (splat) {
                var self = this,
                    redirect = splat ? splat.redirectto : null;

                ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });

                if (redirect != "null") {
                    this.isRedirect(true);
                }
                this.returnUrl(redirect);

                return appsecurity.getExternalLogins(appsecurity.returnUrl, true)
                    .then(function (data) {
                        if (typeof (data) === "object") {
                            for (var i = 0; i < data.length; i++) {
                                self.externalLoginProviders.push(new ExternalLoginProviderViewModel(data[i]));
                            }
                        }
                    }).fail(self.handleauthenticationerrors);
            },

            /**
             * Login the user using forms auth
             * @method
            */
            login: function () {
                var self = this;

                if (this.errors().length != 0) {
                    this.errors.showAllMessages();
                    return;
                }

                appsecurity.login({
                    grant_type: "password",
                    username: self.username(),
                    password: self.password()
                }).done(function (data) {
                    if (data.userName && data.access_token) {
                        appsecurity.setAuthInfo(data.userName, data.roles, data.access_token, self.rememberMe);
                    }
                }).fail(self.handleauthenticationerrors);
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