requirejs.config({
	baseUrl : "/App",
	paths: {
		'text': '../Scripts/text',
		'durandal': '../Scripts/durandal',
		'plugins': '../Scripts/durandal/plugins',
		'transitions': '../Scripts/durandal/transitions'
	}
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'services/appsecurity'],
	function (app, viewLocator, system, appsecurity) {

		//>>excludeStart("build", true);
		system.debug(true);
		//>>excludeEnd("build");

		app.title = 'Durandal Auth';

		//specify which plugins to install and their configuration
		app.configurePlugins({
			router: true,
			dialog: true,
			widget: {
				kinds: ['expander']
			}
		});

		app.start().then(function () {

			//Replace 'viewmodels' in the moduleId with 'views' to locate the view.
			//Look for partial views in a 'views' folder in the root.
			viewLocator.useConvention();

			//Loading indicator

			var loader = new Stashy.Loader("body");

			$(document).ajaxStart(function () {
				loader.on("fixed", "-5px", "#FFF", "prepend");
			}).ajaxComplete(function () {
				loader.off();
			});

			// Configure ko validation
			ko.validation.init({
				decorateElement: true,
				errorElementClass: "has-error",
				registerExtenders: true,
				messagesOnModified: true,
				insertMessages: true,
				parseInputAttributes: true,
				messageTemplate: null
			});

			//hightlight.js configuration
			marked.setOptions({
				highlight: function (code) {
					return hljs.highlightAuto(code).value;
				},
				sanitize: true,
				breaks : true
			});

			// Automatic resizing for textareas
			// auto adjust the height of
			$(document).on('keyup', '.auto-height-textarea', function (e) {
				$(this).css('height', 'auto');
				$(this).height(this.scrollHeight);
			});	

		    //Show the app by setting the root view model for our application with a transition.
			appsecurity.initializeAuth()
                .then(function (data) {
                    app.setRoot('viewmodels/shell');
                });
		});
	});