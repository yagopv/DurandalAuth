define(function () {
    return {
        userProfiles: ko.observable(),
        activate: function () {
            var self = this;
            ga('send', 'pageview');
            return $.get("api/userprofile").then(function (data) {
                self.userProfiles(data);
            });
        }
    }
});