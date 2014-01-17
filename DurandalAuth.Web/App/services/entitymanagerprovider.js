/// <reference path="errorhandler.js" />
/// <reference path="../views/account/login.html" />
/// <reference path="../views/account/register.html" />
/** 
 * @module Provides the Breeze Entity Manager
 * @requires app
*/

define(['durandal/app', 'services/routeconfig', 'services/appsecurity'],
	function (app, routeconfig, appsecurity) {

		//Standard camelcasing
		breeze.NamingConvention.camelCase.setAsDefault();
	    //Change stock validation message
		breeze.Validator.messageTemplates["required"] = "We need your %displayName% please";
		breeze.Validator.messageTemplates["emailAddress"] = "The %displayName% %value% isn't a valid email address";

		//More sohpisticated version, from http://stackoverflow.com/questions/14406429/how-do-you-force-breeze-metadata-generated-properties-to-be-camelcase
		//var namingConv = new breeze.NamingConvention({
		//	serverPropertyNameToClient: function (serverPropertyName, prop) {
		//		if (prop && prop.isDataProperty && prop.dataType === DataType.Boolean) {
		//			return "is" + serverPropertyName;
		//		} else {
		//			return serverPropertyName.substr(0, 1).toLowerCase() + serverPropertyName.substr(1);
		//		}
		//	},
		//	clientPropertyNameToServer: function (clientPropertyName, prop) {
		//		if (prop && prop.isDataProperty && prop.dataType === DataType.Boolean) {
		//			return clientPropertyName.substr(2);
		//		} else {
		//			return clientPropertyName.substr(0, 1).toUpperCase() + clientPropertyName.substr(1);
		//		}
		//	}
		//});
		//namingConv.setAsDefault();

		// get the current default Breeze AJAX adapter
		var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
		// set fixed headers
		ajaxAdapter.defaultSettings = {
			headers: appsecurity.getSecurityHeaders()
		};

		var serviceName = '/breeze';
		var masterManager = new breeze.EntityManager(serviceName);

		/**
		 * Entity Manager ctor
		 * @constructor
		 */
		var EntityManagerProvider = (function () {

			var entityManagerProvider = function () {
				var manager;

				this.manager = function () {
					if (!manager) {
						manager = masterManager.createEmptyCopy();

						// Populate with lookup data
						manager.importEntities(masterManager.exportEntities());

						// Subscribe to events
						manager.hasChangesChanged.subscribe(function (args) {
							app.trigger('hasChanges');
						});

					    // copy options, changing only "validateOnAttach"
						var valOpts = masterManager.validationOptions.using({ validateOnAttach: false });
						console.log(valOpts);
					    // reset manager's options
						manager.setProperties({ validationOptions: valOpts });


					}

					return manager;
				};
			};

			return entityManagerProvider;
		})();

		var self = {
			prepare: prepare,
			create: create
		};

		return self;

		/**
		 * Get a new Entity Manager instance
		 * @method
		 * @return {EntityManagerProvider}
		*/  
		function create() {
			return new EntityManagerProvider();
		}

		/**
		 * Prepare Entity Manager
		 *  - Fetch Metadata from server
		 *  - Get lookup data
		 * @method
		 * @return {promise}
		*/        
		function prepare() {
			return masterManager.fetchMetadata()
				.then(function (md) {

					console.log(md);
					var mdet = md.schema.entityType
					for (et in mdet)
					{
						console.log(mdet[et])
						console.log(mdet[et].name)
						var etype = masterManager.metadataStore.getEntityType(mdet[et].name);
						console.log(etype);
						//alert(' here we go')
						var etp = mdet[et].property
						if (Array.isArray(etp)){
							for (p in etp) {
								propertyName = etp[p].name.substr(0, 1).toLowerCase() + etp[p].name.substr(1)
								console.log(propertyName)
							console.log(etp[p].displayName)
							//propertyName = substring(etp[p].name)
							var prop = etype.getProperty(propertyName);
							
							if(etp[p].displayName){
								prop.displayName = etp[p].displayName
							}

							console.log(prop)
							//prop.displayName = etp[p].displayName
						
						}
						}
						
					}
					

				   console.log(md);

					if (self.modelBuilder) {
						self.modelBuilder(masterManager.metadataStore);
					}

					var query = breeze.EntityQuery
						.from(routeconfig.lookupUrl);

					return masterManager.executeQuery(query);
				})
				.fail(function (error) {
					console.log(error);
				});
		}
	});