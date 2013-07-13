/** 
    * @module Logging errors to the console and showing toasts with toastr
    * @requires system
*/

define(['durandal/system'],
    function (system) {
        var logger = {
            log: log,
            logError: logError,
            logSuccess: logSuccess
        };

        return logger;

        /**
         * Log Info message
         * @method
         * @param {string} message
         * @param {object} data - The data object to log into console
         * @param {object} source - The source object to log into console
         * @param {bool} showToast - Show toast using toastr
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
         * @param {bool} showToast - Show toast using toastr
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
         * @param {bool} showToast - Show toast using toastr
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
         * @param {bool} showToast - Show toast using toastr
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
                    toastr.error(message,'Something failed',{ timeOut : 0, positionClass : "toast-bottom-full-width"});
                } else {
                    if (toastType === 'success') {
                        toastr.success(message, 'Success', { timeOut: 0, positionClass: "toast-bottom-full-width" });
                    } else {
                        toastr.info(message, 'Info', { timeOut: 0, positionClass: "toast-bottom-full-width" });
                    }                    
                }
            }
        }
    });