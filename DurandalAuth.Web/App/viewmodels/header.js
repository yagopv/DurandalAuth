define(['plugins/router', 'services/appsecurity', 'services/errorhandler', 'services/unitofwork'],
    function (router, appsecurity, errorhandler, unitofwork) {

        var respondent = ko.observable();

        var signupVisible = ko.computed(function () {
            return !router.activeInstruction().config.disableSignupHeader;
        });

        var ref = unitofwork.get();

        var unitOfWork = ref.value();

        var viewmodel = {

            router: router,

            appsecurity: appsecurity,

            logout: function () {
                var self = this;
                appsecurity.logout()
                    .done(function () {
                        appsecurity.clearAuthInfo();
                        if (router.activeInstruction().config.authorize) {
                            router.navigate("account/login");
                        }
                    })
                    .fail(self.handlevalidationerrors);
            },

            activate: function () {
                

                respondent(unitOfWork.respondents.create());

            }
            ,

            attached: function () {
                $('.toggler').on('click', function () {
                    $(".navbar-toggle").click();
                });
            },

            signup: function () {
                var self = this;
                
                unitOfWork.commit().then(
                    function () {
                        console.log(respondent());
                        console.log(respondent().id());
                        console.log(ref);
                        console.log(router.activeInstruction().config)
                        var contact = '#home/contact/' + respondent().id();
                        console.log(contact)
                        router.navigate(contact)
                        console.log(signupVisible());
                    }
                    ).fail(
                    self.handleError
                    );
                
            },

            //emailAddress: ko.observable(),

            respondent: respondent,

            signupVisible: signupVisible
      



        };

        errorhandler.includeIn(viewmodel);

        return viewmodel;
    });