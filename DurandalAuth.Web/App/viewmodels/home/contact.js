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
        var signUpButtonMessage = ko.observable('Connect with CueZero');

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
            console.log('tileeventhandlerloaded')

            //$('.tilect').each(
            //    function (index) {
            //        console.log(index + ": " + $(this).text());
            //    })
            //$('.tilect').on(uaEvent, '.tilect', function () {
            //    $('.tilect').removeClass('tilecthover');
            //    $(this).addClass('tilecthover');
            //    console.log('tilect' + uaEvent)
            //})

            $('#optionTiles').on(uaEvent, '.tilect', function () {
                var el = this;
                var $allTiles = $('.tilect');
                var $el = $(el);
                var data = ko.dataFor(el);
                console.log('data');
                console.log(data);
                $allTiles.removeClass('tilecthoverleft');
                $allTiles.removeClass('tilecthoverright');
                $allTiles.removeClass('tilecthover');
                $el.addClass('tilecthover');

                if (data.orient == 'left') {
                    $el.addClass('tilecthoverleft');
                }
                else {
                    $allTiles.removeClass('tilecthoverright');
                }
                
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
                    $('.tilect').removeClass('tilecthoverleft');
                    $('.tilect').removeClass('tilecthoverright');
                }
                else {

                }
                

            })
        }

        function clearOutRespondent() {
            if(unitOfWork && respondent())
            {
                unitOfWork.respondents.detach(respondent());
                respondent(null);
                clearOptions();
                signUpButtonMessage('Connect')
            }
        }

        function signUp() {
            unitOfWork.commit().then(
                function () {
                    header.signupOff(true);
                    signUpButtonMessage('Your connected, thanks');
                })
            .fail(
            function () {
                clearOutRespondent()
                //console.log('failed to save')
                self.handleError;
            }

            ).done(
            //router.navigate('#home/index')
            )
        }

        function updateSelected() {
            $('.selectedButton').on('click', function (e) {
                console.log('selected');
                var el = this;
                var $el = $(el);
                var $closest = $el.closest('.tilect')

                var elData = ko.dataFor(el)

                elData.selected(true);
                

                console.log(respondent().addRespondentComment(respondent(), elData.option, elData.comment()));

                unitOfWork.commit();

                $closest.removeClass('tilecthover');
                $closest.removeClass('tilecthoverleft');
                $closest.removeClass('tilecthoverright');
                // this stops the handler for ti-class objects from running
                e.stopImmediatePropagation();

            })
            $('.unselectedButton').on('click', function (e) {
                var el = this;
                var $el = $(el);
                var $closest = $el.closest('.tilect')
                console.log('unselected');
                ko.dataFor(el).selected(false);
                $closest.removeClass('tilecthover');
                $closest.removeClass('tilecthoverleft');
                $closest.removeClass('tilecthoverright');
                //at the moment the tiles aren't wired into breeze, so unselecting them does not update the entity.
                e.stopImmediatePropagation();
            })
        }

        function attached() {
           // console.log('contacts attached')
            //gets page width to ensure correct animation of tiles
            checkResize();
            //alert(uaEvent);
            //tileHover();
            

        }

        function compositionComplete() {
           // console.log('compcomplete')
            tileClick();
            tileRefresh();
            updateSelected();
        }

        function canDeactivate() {
            unitOfWork.commit().then(
                function () {
                    header.signupOff(true);
                    signUpButtonMessage('Your connected, thanks');
                    console.log('saved')
                }
                )
            .fail(
                function () {
                    clearOutRespondent()
                    //console.log('failed to save')
                    self.handleError;
                }

                )
            return true;
        }

        function clearOptions() {
            ko.utils.arrayForEach(optionArray(), function (item) {
                item.selected(false);
            });

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
                intro: 'Let me use it.  Consider me for the private beta',
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
                intro: 'I’m interested in a tool that helps us drive productivity or innovation through continous improvement',
                spiel: 'You’ve come to the right place. CueZero will be perfect for monitoring, organising and building on feedback for practical improvement.  We can’t wait to share more about CueZero with you as it nears its release.',
                selected: ko.observable(false),
                comment: ko.observable()
            }, {
                option: 5,
                intro: 'I’m interested in a tool that supports continuous individual and team development',
                spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.',
                selected: ko.observable(false),
                comment: ko.observable()
            }
            , {
                option: 6,
                intro: 'I’ve got something else I think CueZero could help with',
                spiel: 'Excellent! Please tell us how you\'d apply CueZero, and we\'ll look into it.  We may even have questions for you...',
                selected: ko.observable(false),
                comment: ko.observable(),
                //This flag signals for a different class to be pulled in for horizontals not to go to far right
                orient: 'left'
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
            optionArray: optionArray,
            viewportWidth: viewportWidth,
            optionCollectionVisible: optionCollectionVisible,
            canDeactivate: canDeactivate,
            signUp: signUp,
            compositionComplete: compositionComplete,
            signUpButtonMessage: signUpButtonMessage
        }

        return vm;

    });