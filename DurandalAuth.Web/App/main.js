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

		app.title = 'Durandal Auth';

		app.start().then(function () {

		    // Q shim
		    system.defer = function (action) {
		        var deferred = Q.defer();
		        action.call(deferred, deferred);
		        var promise = deferred.promise;
		        deferred.promise = function () {
		            return promise;
		        };

		        return deferred;
		    };

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
                // Nav urls
				{ url: 'home/index', moduleId: 'viewmodels/home/index', name: 'Home', visible: true },
				{ url: 'home/articles', moduleId: 'viewmodels/home/articles', name: 'Articles', visible: true },
				{ url: 'home/about', moduleId: 'viewmodels/home/about', name: 'About', visible: true },				

                // Admin panel url
                { url: 'admin/panel', moduleId: 'viewmodels/admin/panel', name: 'Admin Panel', settings: { authorize: ["Administrator"] }, visible: false },

                // Account Controller urls
                { url: 'account/login', moduleId: 'viewmodels/account/login', name: 'Login', visible: false },
				{ url: 'account/externalloginconfirmation', moduleId: 'viewmodels/account/externalloginconfirmation', name: 'External login confirmation', visible: false },
				{ url: 'account/externalloginfailure', moduleId: 'viewmodels/account/externalloginfailure', name: 'External login failure', visible: false },
				{ url: 'account/register', moduleId: 'viewmodels/account/register', name: 'Register', visible: false },
				{ url: 'account/manage', moduleId: 'viewmodels/account/manage', name: 'Manage account', visible: false, settings: { authorize: ["User", "Administrator"] } },

                // User articles urls
			    { url: 'user/dashboard', moduleId: 'viewmodels/user/dashboard', name: 'Dashboard', settings: { authorize: ["User"] }, visible: false },
                { url: ':createdby/:category/:urlcodereference', moduleId: 'viewmodels/user/article', name: 'Article', visible: false },
			]);

			// Add antiforgery => Validate on server
			appsecurity.addAntiForgeryTokenToAjaxRequests();

			// If the route has the authorize flag and the user is not logged in => navigate to login view
			router.guardRoute = function (routeInfo) {
				if (routeInfo.settings.authorize) {
					if (appsecurity.user().IsAuthenticated && appsecurity.isUserInRole(routeInfo.settings.authorize)) {
						return true
					} else {
						return "/#/account/login?redirectto=" + routeInfo.url;
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
			app.setRoot('viewmodels/shell', 'entrance');
		});
	});