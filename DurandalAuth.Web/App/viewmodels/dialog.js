define(['durandal/app', 'durandal/activator', 'durandal/system', 'plugins/dialog'],
    function(app, activator, system, dialog) {

        var Dialog = (function () {

            var ctor = function (obj, options, title) {
                var self = this;

                this.content = activator.create(obj);
                this.commands = ko.observableArray(options);
                this.headerVisible = ko.observable(false);
                this.title = ko.observable('');

                this.invokeCommand = function (command) {
                    self.content().dialogResult = command;
                    dialog.close(self, command);
                };

                if (title) {
                    this.title(title);
                    this.headerVisible(true);
                }

                
                
            };

            system.setModuleId(ctor, 'viewmodels/dialog');

            ctor.prototype.activate = function() {
                return this.content.activate();
            };



            ctor.prototype.attached = function () {

                //This code taken from http://stackoverflow.com/questions/15196352/prevent-onblur-code-to-execute-if-clicked-on-submit-button
                //Provides a way to flag mousedown on a cancel button to override validation coming from blur event of fields stoping form deactivation
                //Used by breezeValidator custom binding
                var $btCancel = $("button:contains('Cancel')")

                if ($btCancel) {
                    $btCancel.on("mousedown", function (e) {
                        $btCancel.data("mouseDown", true);
                    });

                    $btCancel.on("mouseup", function (e) {
                        $btCancel.data("mouseDown", false);
                    });
                }
            }

            ctor.prototype.canDeactivate = function (close) {
                var self = this;
                return this.content.canDeactivate(close)
                    .done(function() { self.content().dialogResult = null; });
            };

            ctor.prototype.deactivate = function (close) {
                return this.content.deactivate(close);
            };

            return ctor;
        })();

        return {
            show: show
        };

        function show(obj, options, title) {
            var dlg = new Dialog(obj, options, title);
            return app.showDialog(dlg);
        }
});