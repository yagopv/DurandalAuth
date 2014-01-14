define(['durandal/composition', 'jquery'], function (composition, $) {
    var ctor = function () { };

    var self = this;

    ctor.prototype.activate = function (settings) {
        this.settings = settings;
    };

    ctor.prototype.attached = function () {
       // setInterval(flashTitle, 3000);
    }

    ctor.prototype.submit = function () {

        alert(self.emailAddress());

    }

    this.fullName = ko.observable();
    this.organisation = ko.observable();
    this.emailAddress = ko.observable();

    flashTitle = function () {
        if(self.name() || self.emailAddress() || self.organisation()){
           
        }
        else {
            $("#interestFrm").toggleClass("withBackground");
            console.log("changed")
        }
    }

    //ctor.prototype.getHeaderText = function (item) {
    //    if (this.settings.headerProperty) {
    //        return item[this.settings.headerProperty];
    //    }

    //    return item.toString();
    //};

    //ctor.prototype.afterRenderItem = function (elements, item) {
    //    var parts = composition.getParts(elements);
    //    var $itemContainer = $(parts.itemContainer);

    //    $itemContainer.hide();

    //    $(parts.headerContainer).bind('click', function () {
    //        $itemContainer.toggle('fast');
    //    });
    //};

    return ctor;
});