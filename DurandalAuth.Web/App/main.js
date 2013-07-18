requirejs.config({
	paths: {
		'text': 'durandal/amd/text'
	}
});

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'durandal/plugins/router','services/appsecurity'],
	function (app, viewLocator, system, router, appsecurity) {

		//>>excludeStart("build", true);
		system.debug(true);
		//>>excludeEnd("build");

		app.title = 'Durandal Starter Kit';

		app.start().then(function () {

			//Replace 'viewmodels' in the moduleId with 'views' to locate the view.
			//Look for partial views in a 'views' folder in the root.
			viewLocator.useConvention();

			//configure routing
			router.useConvention();

			// Config Routes
			// Routes with authorize flag will be forbidden and will redirect to login page
			// As this is javascript and is controlled by the user and his browser, the flag is only a UI guidance. You should always check again on 
			// server in order to ensure the resources travelling back on the wire are really allowed
			router.map([
				{ url: 'home', moduleId: 'viewmodels/home/home',  name: 'Home', visible: true  },
				{ url: 'login', moduleId: 'viewmodels/account/login', name: 'Login', visible: false },
				{ url: 'admin', moduleId: 'viewmodels/admin/admin', name: 'Admin', settings: { authorize: ["Administrator"] }, visible: true },
                { url: 'user', moduleId: 'viewmodels/user/user', name: 'User', settings: { authorize: ["User"] }, visible: true },
				{ url: 'externalloginconfirmation', moduleId: 'viewmodels/account/externalloginconfirmation', name: 'External login confirmation', visible: false },
				{ url: 'externalloginfailure', moduleId: 'viewmodels/account/externalloginfailure', name: 'External login failure', visible: false },
				{ url: 'register', moduleId: 'viewmodels/account/register', name: 'Register', visible: false },
				{ url: 'account', moduleId: 'viewmodels/account/account', name: 'Account', visible: false, settings: { authorize: ["User"] } }
			]);

			// Add antiforgery => Validate on server
			appsecurity.addAntiForgeryTokenToAjaxRequests();

			// If the route has the authorize flag and the user is not logged in => navigate to login view
			router.guardRoute = function (routeInfo) {
				if (routeInfo.settings.authorize) {
					if (appsecurity.user().IsAuthenticated && appsecurity.isUserInRole(routeInfo.settings.authorize)) {
						return true
					} else {
						return "/#/login?redirectto=" + routeInfo.url;
					}
				}
				return true;
			}

		    //Loading indicator

			var loader = new Stashy.Loader("body");

		    $(document).ajaxStart(function () {
		        loader.on("fixed", "4em", "#000", "prepend");
			}).ajaxComplete(function () {
			    loader.off();
			});

		    // Configure ko validation
			ko.validation.init({
			    decorateElement: true,
			    errorElementClass: "error",
			    registerExtenders: true,
			    messagesOnModified: true,
			    insertMessages: true,
			    parseInputAttributes: true,
			    messageTemplate: null
			});

			//Show the app by setting the root view model for our application with a transition.
			app.setRoot('viewmodels/shell', 'entrance');
		});
	});