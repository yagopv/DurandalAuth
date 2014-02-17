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

    function foldInit() {

        var opened = false;

        $('#foldrow > div > div.uc-container').each(function (i) {

            var $item = $(this), direction;

            switch (i) {
                case 0: direction = ['right', 'bottom']; break;
                case 1: direction = ['left', 'bottom']; break;
                case 2: direction = ['right', 'top']; break;
                case 3: direction = ['left', 'top']; break;
            }


            var pfold = $item.pfold({
                folddirection: direction,
                speed: 300,
                onEndFolding: function () {
                    opened = false;
                    $item.data('opened', false)
                },
            });


            $item.data('opened', false);

            $item.find('.unfold').on('click', function () {
                console.log('monkey')
                if (!$item.data('opened')) {
                    //if (!opened) {
                    console.log('unfold')

                    //$item.siblings().each(function (i) {
                    $('#foldrow > div > div.uc-container').each(function (i) {

                        var $newitem = $(this), direction;

                        switch (i) {
                            case 0: direction = ['right', 'bottom']; break;
                            case 1: direction = ['left', 'bottom']; break;
                            case 2: direction = ['right', 'top']; break;
                            case 3: direction = ['left', 'top']; break;
                        }

                        if ($(this).data('opened')) {
                            console.log(this);

                            var thispfold = $newitem.pfold({
                                folddirection: ['right', 'bottom'],
                                speed: 300,
                                onEndFolding: function () {
                                    opened = false;
                                    $newitem.data('opened', false)
                                },
                            })

                            thispfold.fold();
                        }
                    })


                    //opened = true;
                    pfold.unfold();
                    $item.data('opened', true);

                }
                else {
                    alert('fold')
                    pfold.fold();
                }


            }).end().find('.fold').on('click', function () {

                pfold.fold();

            });
        })

    };


    function activate(resid, refid) {
        
        ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
        //var reg = registerInterest.create(resid);
        //activeScreen(reg);
        console.log('get unitofwork')
        unitOfWork = uow(refid);
        console.log('get respondent')
        getRespondent(resid);

    }

    function attached() {
        //foldInit();
        //$('.kwicks').kwicks({
        //    maxSize: '50%',
        //    behavior: 'menu'
        //})
        $('.tilect').hover(function () {

            oldwidth = $(this).width();
            oldheight = $(this).height();
            $(this).animate({
                width: 300,
                height: 400,
                top: -80,
                left: -45
            }, 'fast');
            $(this).css({ zIndex: 1000 });
            console.log('hoveron')
        },
        function () {
            $(this).animate({
                width: oldwidth,
                height: oldheight,
                top: 0,
                left: 0
            }, 'fast');
            $(this).css({ zIndex: 1 });
            console.log('hoveroff')
        });

    }

    function deactivate() {

        unitOfWork.commit().fail(
            function () {
                unitOfWork.respondents.detach(respondent());
                respondent();
            })
        
    }

    var optionArray = [
        {option: 1,
        intro: 'Not sure, just curious',
        spiel: 'We’re glad to have you here! We’ll keep you informed about CueZero as the launch date approaches and you’ll be the first to get a sneak peek before its official release.'
        },{
            option: 2,
            intro: 'I’m interested in being part of the private beta group',
            spiel: 'Welcome, CueHero! We’re glad to have you on board. We’re busy building at the moment, so we may be a little quiet, but when we’re ready to share CueZero you will be the FIRST to know about it. '
        },{
            option: 3,
            intro: 'I’m interested in exploring an alternative to our current staff survey',
            spiel: 'We’re on a mission to make this a reality. We’ll keep you informed about our progress along the way and you’ll be the first to know about CueZero as it nears its release. Your survey’s days are numbered.'
        },{
            option: 4,
            intro: 'I’m interested in a tool that helps us continuously improve',
            spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.'
        },{
            option: 5,
            intro: 'I’m interested in a tool for tracking performance or leadership development',
            spiel: 'You’ve come to the right place. We can’t wait to share more about CueZero with you as it nears its release.'
        }
    ]




    var vm = {
        convertRouteToHash: router.convertRouteToHash,
        //activeScreen: activeScreen,
        activate: activate,
        attached: attached,
        respondent: respondent,
        canSave: canSave,
        messageEmail: messageEmail,
        deactivate: deactivate,
        optionArray: optionArray
    }



    return vm;


});