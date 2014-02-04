define(['durandal/composition', 'jquery'], function (composition, $) {
    var ctor = function () { };

    ctor.prototype.activate = function (settings) {
        this.settings = settings;
    };

    return ctor;
});