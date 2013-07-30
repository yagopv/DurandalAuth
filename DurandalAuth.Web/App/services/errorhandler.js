/** 
    * @module Manage errors in the app
    * @requires logger
    * @requires system
    * @requires utils
*/

define(['services/logger', 'durandal/system', 'services/utils'],
    function (logger, system, util) {

        var ErrorHandler = (function () {
            /**
             * @constructor
            */
            var ctor = function (targetObject) {

                /** 
                 * Handle Breeze validation errors
                 * @method
                 * @param {object} error - The error object
                */
                this.handleError = function (error) {
                    if (error.entityErrors) {
                        error.message = util.getSaveValidationErrorMessage(error);
                    }

                    logger.logError(error.message, null, system.getModuleId(targetObject), true);
                    throw error;
                };

                /**
                 * Log the error
                 * @method
                 * @param {string} message
                 * @param {bool} showToast - Show a toast using toastr.js
                */
                this.log = function (message, showToast) {
                    logger.log(message, null, system.getModuleId(targetObject), showToast);                    
                };

                /**
                 * Handle validation errors without Breeze. It´s neccesary to return a ModelState object from server
                 * Default validation errors provided by Filters/ModelValidationAttribute.cs
                 * @method
                 * @param {object} errors
                */
                this.handlevalidationerrors = function (errors) {
                    if (errors.responseText != "") {
                        $.each($.parseJSON(errors.responseText), function (key, value) {
                            logger.logError(value, null, errors, true);
                        });
                    } else {
                        logger.logError(errors.statusText, null, errors, true);
                    }
                };
            };

            return ctor;
        })();

        return {
            includeIn: includeIn
        };

        /**
         * Include the error handler class in any viewmodel
         * @method
         * @param {object} targetObject
         * @return {object} - The extended object
        */
        function includeIn(targetObject) {
            return $.extend(targetObject, new ErrorHandler(targetObject));
        }
    });