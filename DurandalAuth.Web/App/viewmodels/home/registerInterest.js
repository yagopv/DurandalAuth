define(['jquery', 'durandal/system', 'services/logger', 'services/errorhandler', 'services/unitofwork','durandal/app', 'services/customBindings'],
    function ($, system, logger, errorHandler, unitofwork, app, customBindings) {

        var RegisterInterest = (function (resid, refid) {

            var ctor = function (resid, refid) {

                this.respondent = ko.observable();
                this.canSave = ko.observable();

                this.messageEmail = ko.observable();

                this.resid = resid;

                errorHandler.includeIn(this);
                var self = this;

                if (!refid) {
                    var ref = unitofwork.get();
                }
                else {
                    var ref = unitofwork.get(refid);
                }
                
                this.unitOfWork = ref.value();
            
            };

            var self = this;

            system.setModuleId(ctor, 'viewmodels/home/registerInterest');

            ctor.prototype.activate = function (settings) {

                var self = this;
                console.log('resid in ri')
                console.log(self.resid)


                
                if (!self.resid) {


                    self.unitOfWork.respondents.create().then(function (entity) {
                        self.respondent(entity);
                    }).then(wireupValidation());
                }
                else
                {
                    self.unitOfWork.respondents.withId(self.resid).then(
                        function (data) {
                            console.log('data from query')
                            console.log(data)
                            self.respondent(data);
                            self.messageEmail(data.emailAddress());
                        }
                        ).then(function () {
                            console.log('wiring up');
                            console.log(self.respondent())
                            wireupValidation();
                        }

                        ).fail(self.handleError);
                    
                    console.log('hasfound')
                }
                
                function wireupValidation() {

                    console.log('ri respondent')
                    console.log(self);
                    app.on('hasChanges').then(notify);

                    self.respondent().entityAspect.entityManager.validationErrorsChanged.subscribe(function (changeArgs) {

                        console.log('vchanges');
                        self.canSave(!self.respondent().entityAspect.hasValidationErrors);

                        console.log(self.canSave());
                    })
                }

                

                


            };

            

            function notify() {
                console.log('hasChanges');

            }

            ctor.prototype.attached = function () {
                foldInit();
                // setInterval(flashTitle, 3000);
            }

            ctor.prototype.canDeactivate = function (close) {
                
                if (this.dialogResult === 'Cancel') {

                    this.unitOfWork.respondents.detach(this.respondent())
                    return true;
                }
                else {
                    //when validateonattach is false, make sure breezeValidation and autofocus are on the first field to avoid an invalid entity remaining after the save fails
                    if (this.dialogResult === 'Submit' && !this.respondent().entityAspect.hasValidationErrors) {
                        
                        var self = this;
                        this.unitOfWork.commit().fail(
                            self.handleError);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
                //if  return true;
                //if (close) {
                //   return this.fullName() !== '' && this.emailAddress() !== '';
                //}

                //return true;

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

            return ctor;

        })();

        return {
            create: create
        }

        function create(resid, refid) {
            return new RegisterInterest(resid, refid);
        }
});