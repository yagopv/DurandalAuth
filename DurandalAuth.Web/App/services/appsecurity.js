/** 
	* @module Authentication module for the entire application 
	* @requires system
	* @requires app
	* @requires router
*/

define(function (require) {

	var system = require('durandal/system'),
		app = require('durandal/app'),
		router = require('durandal/plugins/router');
		
	var self = this;
	
	/** @property {string} baseAdress - Base address for the api calls */
	var baseAdress = "api/account";

	/**         
	 * @class
	 * @classdesc Helper class for building credentials 
	*/    
	var credential = function (username, password, rememberme) {
		this.userName = username;
		this.password = password;
		this.rememberMe = rememberme;
	},
	
	/** @property {observable} user - Remember always to check again in server because this info can be tampered easily */
	user = ko.observable({IsAuthenticated : false, UserName : "", Roles : [], AntiforgeryToken : null}),

	/** @property {observable} externalLogins - External Logins container */
	externalLogins = ko.observable(),    

	/**
	 * Add antiforgery to ajax requests with content 
	 * The server filter processing the requests with content is Filters/AntiForgeryTokenAttribute.cs
	 * @method
	*/
	addAntiForgeryTokenToAjaxRequests = function () {
		$.get(baseAdress + "/getantiforgerytokens").then(function (token) {
			user().AntiforgeryToken = token;
			$(document).ajaxSend(function (event, request, options) {
				if (options.hasContent) {	                
					request.setRequestHeader("__RequestVerificationToken", token);
				}
			});
		});
	}

	return {
		credential: credential,
		user: user,
		externalLogins: externalLogins,
		
		/**
		 * Check if an user is in a role
		 * @method
		 * @param {array} roles - Array of roles
		 * @return {bool}
		*/
		isUserInRole: function (roles) {
			var self = this,
				  isuserinrole = false;
			$.each(roles, function (key, value) {
				if (self.user().Roles.indexOf(value) != -1) {
					isuserinrole = true;
				}
			});
			return isuserinrole;
		},
		
		/**
		 * Sign in a user
		 * @method
		 * @param {Credential} credential - An object with the user credential
		 * @param {string} navigateToUrl - If informed and the login is correct
		 *                                 a navigation to the url will be performed
		 * @return {promise}
		*/
		login:  function (credential, navigateToUrl) {
			var self = this;
			var promise = $.post(baseAdress + "/login", credential)
				.done(function (data) {
					self.user(data);
					self.addAntiForgeryTokenToAjaxRequests();
					if (data.IsAuthenticated == true) {
						if (navigateToUrl) {
							router.navigateTo("#/" + navigateToUrl);
						} else {
							router.navigateTo("/#/account");
						}
					}
				})
				.fail(function (data) {
					self.user({ IsAuthenticated: false, UserName: "", Roles: [] });
				});

			return promise;
		},
		
		/**
		 * Sign out an user
		 * @method
		 * @return {promise}
		*/        
		logout: function () {
			var self = this;
			var promise = $.post(baseAdress + "/logout", credential)
				.done(function (data) {
					self.user(data);
					self.addAntiForgeryTokenToAjaxRequests();
					if (router.activeRoute().settings.authorize != null) {
						router.navigateTo("/#/home");
					}
				})
				.fail(function (data) {
					return data;
				});
			return promise;
		},
		
		/**
		 * Register a new user
		 * @method
		 * @param {username} username
		 * @param {string} email
		 * @param {string} password
		 * @param {string} confirmpassword
		 * @return {promise}
		*/        
		register: function (username, email, password, confirmpassword) {
			var self = this;
			var promise = $.post(baseAdress + "/register", { username: username, email: email, password: password, confirmpassword: confirmpassword })
				.done(function (data) {
					self.user(data);
					self.addAntiForgeryTokenToAjaxRequests();
					router.navigateTo("/#/account");
				});
			return promise;
		},

		/**
		 * Get the state of the authentication
		 * @method
		 * @return {promise}
		*/    
		getAuthInfo: function () {
			var self = this;
			var promise = $.get(baseAdress + "/userinfo");
			return promise;
		},
		
		/**
		 * Get all the external logins permitted
		 * Configured under App_Start
		 * @method
		 * @return {promise}
		*/           
		getExternalLogins : function () {
			var self = this;
			var promise = $.get(baseAdress + "/externalloginslist");
			return promise;
		},        
		addAntiForgeryTokenToAjaxRequests: addAntiForgeryTokenToAjaxRequests,

		/**
		 * Performs an external Login
		 * @method
		 * @param {string} provider - The provider
		 * @param {string} returnurl - Url to go when the oAuth request come back
		 * @return {promise}
		*/  
		externalLogin: function (provider, returnurl) {
			location.href = baseAdress + "/externallogin?provider=" + provider + "&returnurl=" + returnurl;			
		},
		
		/**
		 * Get the confirmation data from the procider
		 * @method
		 * @param {string} returnurl - Url to go when the oAuth request come back
		 * @param {string} username
		 * @param {string} provideruserid - User id with the provider
		 * @param {string} provider - The oAuth provider
		 * @return {promise}
		*/          
		getExternalLoginConfirmationData : function(returnurl, username, provideruserid, provider) {
			var promise = $.get(baseAdress + "/externalloginconfirmation?returnurl=" + returnurl + "&username=" + username + "&provideruserid=" + provideruserid + "&provider=" + provider);
			return promise;
		},
		
		/**
		 * Confirm an external account
		 * @method
		 * @param {string} displayname - The provider display name
		 * @param {string} username
		 * @param {string} externallogindata - External Login data returned by provider
		 * @return {promise}
		*/        
		confirmExternalAccount: function (displayname, username, email, externallogindata) {
			var self = this;
			var promise = $.post(baseAdress + "/registerexternallogin", { displayname: displayname, username: username, email : email, externallogindata: externallogindata })
				.done(function (data) {
					self.user(data);
					self.addAntiForgeryTokenToAjaxRequests();
				});
			return promise;
		},
		
		/**
		 * Check if the authenticated user has a local account
		 * @method
		 * @return {promise}
		*/          
		hasLocalAccount: function () {
			var promise = $.get(baseAdress + "/haslocalaccount");
			return promise;
		},
		
		/**
		 * Change the password of the authenticated user
		 * @method
		 * @param {string} oldpassword
		 * @param {string} newpassword
		 * @param {string} confirmnewpassword
		 * @return {promise}
		*/
		changePassword: function (oldpassword, newpassword, confirmnewpassword) {
			var promise = $.post(baseAdress + "/changepassword", { oldpassword: oldpassword, newpassword: newpassword, confirmpassword: confirmnewpassword });
			return promise;
		},
		
		/**
		 * Creates a local account for an oAuth authenticated user
		 * @method
		 * @param {string} password
		 * @param {string} confirmnewpassword
		 * @return {promise}
		*/
		createLocalAccount: function (password, confirmnewpassword) {
			var promise = $.post(baseAdress + "/createlocalaccount", { newpassword: password, confirmpassword: confirmnewpassword });
			return promise;
		},

		/**
		 * Get the external logins list
		 * @method
		 * @return {promise}
		*/
		externalAccounts: function () {
			var promise = $.get(baseAdress + "/externalaccounts");
			return promise;
		},

		/**
		 * Dissasociate an external account
		 * @method
		 * @param {string} provider
		 * @param {string} provideruserid
		 * @return {promise}
		*/
		dissasociate: function (provider, provideruserid) {
			var promise = $.post(baseAdress + "/disassociate", { provider: provider, provideruserid: provideruserid });
			return promise;
		}

	};
});