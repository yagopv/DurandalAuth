require.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions'
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'services/appsecurity'],
	function (app, viewLocator, system, router, appsecurity) {

	    system.debug(true);

	    app.title = 'Durandal Auth';

	    app.configurePlugins({
	        router: true
	    });

	    app.start().then(function () {

	        //// Q shim
	        //system.defer = function (action) {
	        //    var deferred = Q.defer();
	        //    action.call(deferred, deferred);
	        //    var promise = deferred.promise;
	        //    deferred.promise = function () {
	        //        return promise;
	        //    };

	        //    return deferred;
	        //};

	        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
	        //Look for partial views in a 'views' folder in the root.
	        viewLocator.useConvention();

	        // Config Routes
	        // Routes with authorize flag will be forbidden and will redirect to login page
	        // As this is javascript and is controlled by the user and his browser, the flag is only a UI guidance. You should always check again on 
	        // server in order to ensure the resources travelling back on the wire are really allowed

	        var routes = [
                // Nav urls
				{ route: 'home/index', moduleId: 'home/index', title: 'Home', nav: true },
				{ route: 'home/articles', moduleId: 'home/articles', title: 'Articles', nav: true },
				{ route: 'home/about', moduleId: 'home/about', title: 'About', nav: true },

                // Admin panel url
                { route: 'admin/panel', moduleId: 'admin/panel', title: 'Admin Panel', params: { authorize: ["Administrator"] }, nav: false },

                // Account Controller urls
                { route: 'account/login', moduleId: 'account/login', title: 'Login', nav: false },
				{ route: 'account/externalloginconfirmation', moduleId: 'account/externalloginconfirmation', title: 'External login confirmation', nav: false },
				{ route: 'account/externalloginfailure', moduleId: 'account/externalloginfailure', title: 'External login failure', nav: false },
				{ route: 'account/register', moduleId: 'account/register', title: 'Register', nav: false },
				{ route: 'account/manage', moduleId: 'account/manage', title: 'Manage account', nav: false, params: { authorize: ["User", "Administrator"] } },

                // User articles urls
			    { route: 'user/dashboard', moduleId: 'user/dashboard', title: 'Dashboard', params: { authorize: ["User"] }, nav: false },
                { route: ':createdby/:categorycode/:articlecode', moduleId: 'user/article', title: 'Article', nav: false },
	        ];

	        router.makeRelative({ moduleId: 'viewmodels' })
                .map(routes)
                .buildNavigationModel() // Finds all nav routes and readies them
                .activate();            // Activate the router

	        // Add antiforgery => Validate on server
	        appsecurity.addAntiForgeryTokenToAjaxRequests();

	        // If the route has the authorize flag and the user is not logged in => navigate to login view
	        router.guardRoute = function (instance, instruction) {
	            if (instruction.params.authorize) {
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
	            breaks: true
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