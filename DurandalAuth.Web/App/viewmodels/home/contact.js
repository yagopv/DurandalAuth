/// <reference path="../../../Scripts/jquery.pfold.js" />
define(['plugins/router', 'viewmodels/home/registerInterest', 'services/errorhandler', 'services/unitofwork', 'services/customBindings', 'durandal/app'],
    function (router, registerInterest, errorHandler, unitofwork, customBindings, app) {
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

        var forceLower = function(strInput) {
            strInput.value = strInput.value.toLowerCase();
        }

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

        function getRespondent(resid) {
            if (!resid) {

                respondent(unitOfWork.respondents.create());
                wireupValidation();

            }
            else {
                unitOfWork.respondents.withId(resid).then(
                    function (data) {
                        console.log('data from query')
                        console.log(data)
                        respondent(data);
                        messageEmail(data.emailAddress());
                    }
                    ).then(function () {
                        console.log('wiring up');
                        console.log(respondent())
                        wireupValidation();
                    }

                    ).fail(
                    function () {
                        respondent(unitOfWork.respondents.create());
                        wireupValidation();
                    }
                    );

                console.log('hasfound')
            }
        }

        function wireupValidation() {

            console.log('ri respondent')
            console.log(respondent())
            app.on('hasChanges').then(notify);

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





        function activate(resid, refid) {

            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            //var reg = registerInterest.create(resid);
            //activeScreen(reg);
            console.log('get unitofwork')
            unitOfWork = uow(refid);
            console.log('get respondent')
            getRespondent(resid);
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
            console.log('tilect' + uaEvent)
            $('.tilect').on(uaEvent, function () {
                $('.tilect').removeClass('tilecthover');
                $(this).addClass('tilecthover');

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

        function tileHover() {
            $('.tilect').hover(function () {
                ko.dataFor(this).oldWidth = $(this).width();
                ko.dataFor(this).oldheight = $(this).height();
                if (viewportWidth() < 12) {

                }
                else {
                    $(this).toggleClass('tilecthover');

                }


            },
            function () {
                if (viewportWidth() < 12) {

                }
                else {
                    $(this).toggleClass('tilecthover');
                }
            });
        }

        function updateSelected() {
            $('.selectedButton').on('click', function () {
                console.log('selected');
                ko.dataFor(this).selected(true);
                $(this).closest('.tilect').removeClass('tilecthover');
                // event.stopImmediatePropagation();
                //console.log(ko.dataFor(this));
            })
        }


        function attached() {
            //foldInit();
            //$('.kwicks').kwicks({
            //    maxSize: '50%',
            //    behavior: 'menu'
            //})

            //gets page width to ensure correct animation of tiles

            checkResize();
            //alert(uaEvent);
            //tileHover();
            tileClick();
            tileRefresh();
            updateSelected();

        }

        function deactivate() {

            unitOfWork.commit().then(
                function () {
                    console.log('saved')
                }
                )
            .fail(
                function () {
                    unitOfWork.respondents.detach(respondent());
                    respondent();
                    self.handleError;
                }

                )

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
            optionCollectionVisible: optionCollectionVisible
        }



        return vm;


    });