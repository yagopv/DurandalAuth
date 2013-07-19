/** 
    * @module Get the list of external logins
    * @requires appsecurity
    * @requires errorhandler
*/

define(['services/appsecurity', 'services/errorhandler', 'services/utils'],
    function (appsecurity,errorhandler, utils) {

        var returnUrl = ko.observable();

        var viewmodel = {

            /** @property {appsecurity} appsecurity */
            appsecurity: appsecurity,

            /**
              * Activate view
              * @method
              * @return {promise} - Promise of getting external logins and showing them in the view
            */
            activate: function () {
                var redirect = utils.getURLParameter("redirectto");
                if (redirect != "null") {
                    this.isRedirect(true);
                }
                this.returnUrl(redirect != "null" ? redirect : "account");

                return appsecurity.getExternalLogins().then(function (data) {
                    appsecurity.externalLogins(data);
                });
            },

            /** @property {observable} returnUrl */
            returnUrl: returnUrl,

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

        viewmodel["errors"] = ko.validation.group(viewmodel);

        return viewmodel;
    });