define(['durandal/composition', 'jquery'], function (composition, $) {
    var ctor = function () { };

    var self = this;

    ctor.prototype.activate = function (settings) {
        this.settings = settings;
    };

    ctor.prototype.attached = function () {
        // setInterval(flashTitle, 3000);
    }

    return ctor;
});