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

    var self = this;

    errorHandler.includeIn(this);

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
        app.on('hasChanges').then(notify);

        respondent().entityAspect.entityManager.validationErrorsChanged.subscribe(function (changeArgs) {

            console.log('vchanges');
            canSave(!respondent().entityAspect.hasValidationErrors);

            console.log(canSave());
        })
    }

    function notify() {
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

    }

    function checkResize() {

        viewportWidth($(window).width());
        $(window).resize(function () {
            viewportWidth($(window).width());
        });
    }

    function tileHover() {
        $('.tilect').hover(function () {
            ko.dataFor(this).oldWidth = $(this).width();
            ko.dataFor(this).oldheight = $(this).height();
            if (viewportWidth() < 3760) {

            }
            else {
                $(this).stop(false,true).animate({
                    width: 300,
                    //height: 400,
                    top: -40,
                    left: -15
                }, 25);
                $(this).css({ zIndex: 1000 });
                console.log('hover');

            }


        },
        function () {
            if (viewportWidth() < 3760) {

            }
            else {
                $(this).stop(false,true).animate({
                    width: ko.dataFor(this).oldWidth,
                    height: ko.dataFor(this).oldheight,
                    top: 0,
                    left: 0
                }, 25);
                $(this).css({ zIndex: 1 });
                console.log('unhover')
                console.log($(this).width())
                console.log($(this).height())
            }
        });
    }

    function updateSelected(){
        $('.selectedButton').on('click', function () {
            ko.dataFor(this).selected(true);
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

        tileHover();

        updateSelected();

    }

    function deactivate() {

        unitOfWork.commit().fail(
            function () {
                unitOfWork.respondents.detach(respondent());
                respondent();
            })
        
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
            intro: 'I’m interested in being part of the private beta group',
            spiel: 'Welcome, CueHero! We’re glad to have you on board. We’re busy building at the moment, so we may be a little quiet, but when we’re ready to share CueZero you will be the FIRST to know about it. ',
            selected: ko.observable(false),
            comment: ko.observable()
        }, {
            option: 3,
            intro: 'I’m interested in exploring an alternative to our current staff survey',
            spiel: 'We’re on a mission to make this a reality. We’ll keep you informed about our progress along the way and you’ll be the first to know about CueZero as it nears its release. Your survey’s days are numbered.',
            selected: ko.observable(false),
            comment: ko.observable()
        }, {
            option: 4,
            intro: 'I’m interested in a tool that helps us continuously improve',
            spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.',
            selected: ko.observable(false),
            comment: ko.observable()
        }, {
            option: 5,
            intro: 'I’m interested in a tool for tracking performance or leadership development',
            spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.',
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
        viewportWidth: viewportWidth
    }



    return vm;


});