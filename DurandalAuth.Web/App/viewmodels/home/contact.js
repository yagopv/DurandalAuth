/// <reference path="../../../Scripts/jquery.pfold.js" />
define(['plugins/router', 'viewmodels/home/registerInterest', 'viewmodels/header','services/errorhandler', 'services/unitofwork', 'services/customBindings', 'durandal/app'],
    function (router, registerInterest, header, errorHandler, unitofwork, customBindings, app) {
        //var activeScreen = ko.observable();
        var respondent = ko.observable();
        var canSave = ko.observable();
        var messageEmail = ko.observable();
        var unitOfWork = '';
        var oldWidth = '';
        var oldHeight = '';
        var viewportWidth = ko.observable('');
        var optionCollectionVisible = ko.observable();
        var uaEvent = '';

        var self = this;

        errorHandler.includeIn(this);

        //var forceLower = function(strInput) {
        //    strInput.value = strInput.value.toLowerCase();
        //}

        function setUA() {
 
            var ua = navigator.userAgent;
            uaEvent = (ua.match(/iPad/i) || ua.match(/iPhone/i)) ? "touchstart" : "click";
            console.log(uaEvent);
        }

        function uow(refid) {
            if (!refid) {
                var ref = unitofwork.get();
            }
            else {
                var ref = unitofwork.get(refid);
            }
            console.log('get ref');
            console.log(ref.value());
            return ref.value();

        }

        function getRespondent(emailAddress) {
            if (!emailAddress) {

                respondent(unitOfWork.respondents.create());
                wireupValidation();
                canSave(false);

            }
            else {
                respondent(unitOfWork.respondents.create());
                respondent().emailAddress(emailAddress);
                wireupValidation();

                //unitOfWork.respondents.withId(resid).then(
                //    function (data) {
                //        console.log('data from query')
                //        console.log(data)
                //        respondent(data);
                //        messageEmail(data.emailAddress());
                //    }
                //    ).then(function () {
                //        console.log('wiring up');
                //        console.log(respondent())
                //        wireupValidation();
                //    }

                //    ).fail(
                //    function () {
                //        respondent(unitOfWork.respondents.create());
                //        wireupValidation();
                //    }
                //    );

                //console.log('hasfound')
            }
            console.log(respondent())
        }

        function wireupValidation() {

            console.log('ri respondent')
            console.log(respondent())
            app.on('hasChanges').then(notify);
            canSave(!respondent().entityAspect.hasValidationErrors);

            respondent().entityAspect.entityManager.validationErrorsChanged.subscribe(function (changeArgs) {

                console.log('vchanges');
                canSave(!respondent().entityAspect.hasValidationErrors);

                console.log(canSave());
            })
        }

        function notify() {
            if (respondents().emailAddress() && !respondents().entityAspect.hasValidationErrors) {
                optionCollectionVisible(true)
            }
            else {
                optionCollectionVisible(false)
            }
            console.log('hasChanges');

        }





        function activate(emailAddress) {

            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            //var reg = registerInterest.create(resid);
            //activeScreen(reg);
            console.log('get unitofwork')
            unitOfWork = uow();
            console.log('get respondent')

            if (!respondent()) {
                getRespondent(emailAddress);
            }
            else
            {
                if (respondent() && !respondent().emailAddress() && emailAddress) {
                    respondent().emailAddress(emailAddress);
                }
                else
                {
                    
                }

            }
            
            setUA();
           // respondent().emailAddress().extend({lowerCase: 'ace'})
            //respondent().emailAddress.subscribe(function (newValue) {
            //    console.log(newValue);
            //    respondent().emailAddress(newValue.toLowerCase());
            //    console.log(respondent().emailAddress());
            //    console.log(newValue.toLowerCase());
            //    respondent().emailAddress('bastard');
            //});


        }

        function checkResize() {

            viewportWidth($(window).width());
            $(window).resize(function () {
                viewportWidth($(window).width());
            });
        }



        function tileClick() {
           
            $('.tilect').on(uaEvent, function () {
                $('.tilect').removeClass('tilecthover');
                $(this).addClass('tilecthover');
                console.log('tilect' + uaEvent)
            })
        }

        function tileRefresh() {
            $('#contact').on(uaEvent, function (e) {
                //console.log($(e.target));
                //console.log($(e.target).hasClass('ti'));
                if (!$(e.target).hasClass('ti'))
                {
                    $('.tilect').removeClass('tilecthover');
                }
                else {

                }
                

            })
        }

        function signUp() {
            unitOfWork.commit().then(
                function () {
                    header.signupOff(true);
                })
            .fail(self.handleError).done(router.navigateBack)
        }

        function updateSelected() {
            $('.selectedButton').on('click', function (e) {
                console.log('selected');
                var el = this;
                var $el = $(el);

                ko.dataFor(el).selected(true);
                $el.closest('.tilect').removeClass('tilecthover');
                // event.stopImmediatePropagation
                e.stopImmediatePropagation();

            })
            $('.unselectedButton').on('click', function (e) {
                var el = this;
                var $el = $(el);
                console.log('unselected');
                ko.dataFor(el).selected(false);
                $el.closest('.tilect').removeClass('tilecthover');
                // 
                //console.log($el.closest('.tilect'));
                //console.log($el.closest('.tilect').attr("class"));
                e.stopImmediatePropagation();
            })
        }


        function attached() {

            //gets page width to ensure correct animation of tiles

            checkResize();
            //alert(uaEvent);
            //tileHover();
            tileClick();
            tileRefresh();
            updateSelected();

        }

        function canDeactivate() {
            unitOfWork.commit().then(
                function () {
                    console.log('saved')
                }
                )
            .fail(
                function () {
                    unitOfWork.respondents.delete(respondent());
                    respondent(null);
                    console.log('failed to save')
                    self.handleError;
                }

                )
            return true;
        }

        function deactivate() {

            

        }

        var optionArray = ko.observableArray([
            {
                option: 1,
                intro: 'Not sure, just curious',
                spiel: 'We’re glad to have you here! We’ll keep you informed about CueZero as the launch date approaches and you’ll be the first to get a sneak peek before its official release.',
                selected: ko.observable(false),
                comment: ko.observable()
            }, {
                option: 2,
                intro: 'Consider me for the private beta group',
                spiel: 'Welcome, CueHero! We’re glad to have you on board. We’re busy building at the moment, so we may be a little quiet, but when we’re ready to share CueZero you will be the FIRST to know about it. ',
                selected: ko.observable(false),
                comment: ko.observable()
            }, {
                option: 3,
                intro: 'I want to explore an alternative to our current staff survey',
                spiel: 'We’re on a mission to make this a reality. We’ll keep you informed about our progress along the way and you’ll be the first to know about CueZero as it nears its release. Your survey’s days are numbered.',
                selected: ko.observable(false),
                comment: ko.observable()
            }, {
                option: 4,
                intro: 'I’m interested in a tool that helps us continously improve through regular feedback',
                spiel: 'You’ve come to the right place. CueZero will be perfect for monitoring, organising and building on feedback for practical improvement.  We can’t wait to share more about CueZero with you as it nears its release.',
                selected: ko.observable(false),
                comment: ko.observable()
            }, {
                option: 5,
                intro: 'I’m interested in a continous feedback tool to support individual and team development',
                spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.',
                selected: ko.observable(false),
                comment: ko.observable()
            }
            , {
                option: 6,
                intro: 'I’m got something else I think CueZero could help with',
                spiel: 'Excellent! Please tell us how you\'d apply CueZero, and we\'ll look into it.  We may even have questions for you...',
                selected: ko.observable(false),
                comment: ko.observable()
            }
        ]);




        var vm = {
            convertRouteToHash: router.convertRouteToHash,
            //activeScreen: activeScreen,
            activate: activate,
            attached: attached,
            respondent: respondent,
            canSave: canSave,
            messageEmail: messageEmail,
            deactivate: deactivate,
            optionArray: optionArray,
            viewportWidth: viewportWidth,
            optionCollectionVisible: optionCollectionVisible,
            canDeactivate: canDeactivate,
            signUp: signUp
        }



        return vm;


    });