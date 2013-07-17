define(function () {
    return {
        userProfiles: ko.observable(),
        activate: function () {
            var self = this;
            return $.get("api/userprofile").then(function (data) {
                self.userProfiles(data);
            });
        }
    }
});