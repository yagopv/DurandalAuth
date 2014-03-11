/** 
 * @module Logging errors to the console and showing toasts with Stashy.Notify
 * @requires system
*/

define(['durandal/system'],
    function (system) {
        var logger = {
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            showAccountWarning: showAccountWarning
        };

        return logger;

        /**
         * Log Info message
         * @method
         * @param {string} message
         * @param {object} data - The data object to log into console
         * @param {object} source - The source object to log into console
         * @param {bool} showToast - Show toast using Stashy.Notify
        */
        function log(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'info');
        }

        /**
         * Log Error message
         * @method
         * @param {string} message
         * @param {object} data - The data object to log into console
         * @param {object} source - The source object to log into console
         * @param {bool} showToast - Show toast using Stashy.Notify
        */
        function logError(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'error');
        }

        /**
         * Log Success message
         * @method
         * @param {string} message
         * @param {object} data - The data object to log into console
         * @param {object} source - The source object to log into console
         * @param {bool} showToast - Show toast using Stashy.Notify
        */
        function logSuccess(message, data, source, showToast) {
            logIt(message, data, source, showToast, 'success');
        }

        /**
         * Logs the message from the public methods
         * @method
         * @private
         * @param {string} message
         * @param {object} data - The data object to log into console
         * @param {object} source - The source object to log into console
         * @param {bool} showToast - Show toast using Stashy.Notify
        */
        function logIt(message, data, source, showToast, toastType) {
            source = source ? '[' + source + '] ' : '';
            if (data) {
                system.log(source, message, data);
            } else {
                system.log(source, message);
            }
            if (showToast) {
                if (toastType === 'error') {
                    Stashy.Notify({
                        title: "<i class='fa fa-warning'></i>   Something failed",
                        content:  message,
                        titleSize: 4,
                        style: "error",
                        contentType: "inline",
                        animDuration: "fast",
                        closeArea: "element",
                        activeDuration: 5000
                    }).toast("right", "bottom", true);
                } else {
                    if (toastType === 'success') {
                        Stashy.Notify({
                            title: "<i class='fa fa-smile-o'></i>   Success !!",
                            content: message,
                            titleSize: 4,
                            style: "success",
                            contentType: "inline",
                            animDuration: "fast",
                            closeArea: "element",
                            activeDuration: 5000
                        }).toast("right", "bottom", true);
                    } else {
                        Stashy.Notify({
                            title: "<i class='fa fa-info'></i>   Info message",
                            content: message,
                            titleSize: 4,
                            style: "info",
                            contentType: "inline",
                            animDuration: "fast",
                            closeArea: "element",
                            activeDuration: 5000
                        }).toast("right", "bottom", true);
                    }
                }
            }
        }

        /**
         * If the account is not confirmed shows the account warning
         * @method
         * @private
         * @param {string} message
        */
        function showAccountWarning(restrictedRoute) {
            var text1 = "We sent you a message for confirm your account. If you didn't receive it check your spam folder or <a id='sendConfirmationMail' class='btn btn-danger'>click here</a> in order to resend it",
                text2 = "The route you are trying to access is restricted to confirmed accounts. Check you email account to find a mail we sent you and confirm it. If you didn't receive it check your spam folder or <a id='sendConfirmationMail' class='btn btn-danger'>click here</a> in order to resend it"

            Stashy.Notify({
                title: "<i class='fa fa-warning'></i>   Your account is not confirmed",
                content: restrictedRoute ? text2 : text1,
                titleSize: 4,
                style: "error",
                contentType: "inline",
                animDuration: "fast",
                closeArea: "element"
            }).bar("bottom");
        }
    });