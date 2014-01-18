define([], function () {

    //custom binding validation for breeze entities 
    //From http://stackoverflow.com/questions/13662446/knockout-validation-using-breeze-utility. answer from @RockResolve
    //Highlight field in red & show first validation message
    //
    //Outputs first validation message for 'propertyName' or if null: previous controls value binding
    //Needs ancestor with 'form-group' class to set class 'error' for Bootstrap error display
    //
    //Example:
    //<td class="form-group">
    //    <input class="input-block-level text-right" data-bind="value: id" />
    //    <span class="help-inline" data-bind="breezeValidation: null"></span>
    //</td>
    //
    //Does not and cannot validate keys that already exist in cache. knockout write calls breeze which throws uncaught error

    ko.bindingHandlers.breezeValidation = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here

            var $msgElement = $(element);
            var entity = viewModel;

            var propName = valueAccessor();
            if (propName === null) {
                //  $element.prev().data("bind") = "value: itemType"
                var prevBinds = $msgElement.prev().data("bind");
                //console.log($msgElement.prev());
                if (!prevBinds) {
                    $msgElement.text("Could not find prev elements binding value.");
                    return;
                }
                var bindPhrases = prevBinds.split(/,/);
                for (var i = 0, j = bindPhrases.length; i < j; i++) {
                    var bindPhrase = bindPhrases[i];
                    if (utility.stringStartsWith(bindPhrase, 'value: ')) {
                        propName = bindPhrase.substr(7);
                        break;
                    }
                }
            }

            var $prevElement = $(element).prevAll().first()
            //alert($prevElement)
            prevElement = $(element).prev()
            console.log($prevElement)

            // force validation of an item as it looses focus (to reflect the fact that the model is not validated on attachement

            $($prevElement).on("blur", function () {


                // Check whether a cancel button has reacted to a mouse down event, in which case the validation should not take place
                // See also code in dialog.js that attaches the mousedown/mouseup flags
                var $btCancel = $("button:contains('Cancel')")

               if ($btCancel.data("mouseDown") != true) {
                    entity.entityAspect.validateProperty(this.id)
            ty    }
                
            });

            if (!propName) {
                $msgElement.text("Could not find this or prev elements binding value.");
                return;
            }

            //var $groupElement = $msgElement.parent();      
            var $groupElement = $msgElement.closest(".form-group");
            if (!$groupElement.hasClass("form-group")) {
                $msgElement.text("Could not find parent with 'form-group' class.");
                return;
            }


            onValidationChange();               //fire immediately (especially for added)
            //... and anytime validationErrors are changed fire onValidationChnange
            entity.entityAspect.validationErrorsChanged.subscribe(onValidationChange);

            element.onchange = function () {
                //Should never have updates pushed from validation msgElement
                $msgElement.text("readonly error");
            };


            function onValidationChange() {
                var errors = entity.entityAspect.getValidationErrors(propName);
                var message = "";
                if (errors.length > 0) {
                    message = errors[0].errorMessage;
                }

                if (message) {
                    $groupElement.addClass('has-warning');
                    $groupElement.removeClass('has-success');
                }
                else {
                    $groupElement.removeClass('has-warning');
                    $groupElement.addClass('has-success');
                }

                $msgElement.text(message);
            }


        }
        //Not interested in changes to valueAccessor - it is only the fieldName.
        //update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    };

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {};
            $(element).datepicker(options);
            //$(element).datepicker("option",$.datepicker.regional[ "fr" ]);
            //handle the field changing
            ko.utils.registerEventHandler(element, "change", function () {
                var observable = valueAccessor();
                observable($(element).datepicker("getDate"));
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).datepicker("destroy");
            });

        },
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                current = $(element).datepicker("getDate");

            if (value - current !== 0) {
                $(element).datepicker("setDate", value);
            }
        }
    };

    ko.bindingHandlers.dateString = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            if (valueUnwrapped) {
                $(element).text(moment(valueUnwrapped).format('MMM YYYY'));
            }
        }
    }

    ko.bindingHandlers.accordion = {
        init: function (element, valueAccessor) {
            var options = valueAccessor() || {};
            setTimeout(function () {
                $(element).accordion(options);
            }, 0);

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).accordion("destroy");
            });
        },
        update: function (element, valueAccessor) {
            var options = valueAccessor() || {};
            $(element).accordion("destroy").accordion(options);
        }
    }

    ko.bindingHandlers.currencyK = {
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                precision = ko.utils.unwrapObservable(allBindingsAccessor().precision)
                || ko.bindingHandlers.currencyK.defaultPrecision,
                formattedValue = '$' + addCommas((value / 1000).toFixed(precision)) + 'k';

            ko.bindingHandlers.text.update(element, function () { return formattedValue; });
        },
        defaultPrecision: 0
    };

    ko.bindingHandlers.currency = {
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                precision = ko.utils.unwrapObservable(allBindingsAccessor().precision)
                || ko.bindingHandlers.currency.defaultPrecision,
                formattedValue = '$' + addCommas(value.toFixed(precision));

            ko.bindingHandlers.text.update(element, function () { return formattedValue; });
        },
        defaultPrecision: 0
    };

    ko.bindingHandlers.percentage = {
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                precision = ko.utils.unwrapObservable(allBindingsAccessor().precision)
                || ko.bindingHandlers.percentage.defaultPrecision,
                formattedValue = (value * 100).toFixed(precision) + '%';

            ko.bindingHandlers.text.update(element, function () { return formattedValue; });
        },
        defaultPrecision: 1
    };

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    ko.utils.stringStartsWith = function (string, startsWith) {
        string = string || "";
        if (startsWith.length > string.length) return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

    ko.utils.stringContains = function (string, contains) {
        string = string || "";
        //if (!contains) return false;
        if (contains.length > string.length) return false;
        return string.indexOf(contains) !== -1;
    };
});