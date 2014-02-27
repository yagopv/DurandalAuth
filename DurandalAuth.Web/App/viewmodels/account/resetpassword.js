/** 
  * @module Manage registering users
  * @requires appsecurity
  * @requires router
  * @requires errorHandler
*/

define(['services/appsecurity', 'plugins/router', 'services/errorhandler', 'services/logger'],
    function (appsecurity, router, errorhandler, logger) {

        var email = ko.observable().extend({ required: true, email: true }),
            password = ko.observable().extend({ required: true, minLength: 6 }),
            confirmpassword = ko.observable().extend({ required: true, minLength: 6, equal: password }),
            code= ko.observable().extend({ required: true });

        var viewmodel = {

            email: email,

            password: password,

            confirmpassword: confirmpassword,            

            code : code,

            activate: function (splat) {
                var self = this;

                self.email(decodeURIComponent(splat.email));
                self.code(decodeURIComponent(splat.code));
                ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            },

            resetPassword: function () {
                var self = this;
                if (this.errors().length != 0) {
                    this.errors.showAllMessages();
                    return;
                }

                appsecurity.resetPassword({
                    eMail: self.email(),
                    password: self.password(),
                    confirmPassword: self.confirmpassword(),
                    code : self.code()
                }).done(function (data) {
                        logger.logSuccess("Your password was changed succesfully. Try to log in to your account", data, null, true);    
                        router.navigate("account/login");
                }).fail(self.handlevalidationerrors);
            }
        }

        errorhandler.includeIn(viewmodel);

        viewmodel["errors"] = ko.validation.group(viewmodel);

        return viewmodel;
    });