/** 
    * @module UnitOfWork containing all repositories
    * @requires app
    * @requires entitymanagerprovider
    * @requires repository 
*/

define(['services/entitymanagerprovider', 'services/repository', 'durandal/app', 'services/config'],
    function (entityManagerProvider, repository, app, config) {

        var refs = {};

        /**
        * UnitOfWork ctor
	    * @constructor
	    */
        var UnitOfWork = (function () {

            var unitofwork = function () {
                var provider = entityManagerProvider.create();

                /**
                * Has the current UnitOfWork changed?
		        * @method
		        * @return {bool}
		        */ 
                this.hasChanges = function () {
                    return provider.manager().hasChanges();
                };

                /**
                * Commit changeset
    	        * @method
		        * @return {promise}
		        */ 
                this.commit = function () {
                    var saveOptions = new breeze.SaveOptions({ resourceName: 'durandalauth/savechanges' });

                    return provider.manager().saveChanges(null, saveOptions)
                        .then(function (saveResult) {
                            app.trigger('saved', saveResult.entities);
                        });
                };

                /**
                * Rollback changes
                * @method
		        */ 
                this.rollback = function () {
                    provider.manager().rejectChanges();
                };

                // Repositories
                this.articles = repository.create(provider, "Article", config.articlesLocation);
                this.userprofiles = repository.create(provider, "UserProfile", config.profileLocation);
                this.categories = repository.create(provider, "Category", config.lookupLocation, breeze.FetchStrategy.FromLocalCache);
                this.tags = repository.create(provider, "Tag", config.lookupLocation, breeze.FetchStrategy.FromLocalCache);
            };

            return unitofwork;
        })();

        var SmartReference = (function () {

            var ctor = function () {
                var value = null;

                this.referenceCount = 0;

                this.value = function () {
                    if (value === null) {
                        value = new UnitOfWork();
                    }

                    this.referenceCount++;
                    return value;
                };

                this.clear = function () {
                    value = null;
                    this.referenceCount = 0;

                    clean();
                };
            };

            ctor.prototype.release = function () {
                this.referenceCount--;
                if (this.referenceCount === 0) {
                    this.clear();
                }
            };

            return ctor;
        })();

        return {
            create: create,
            get: get
        };

        /**
    	 * Get a new UnitOfWork instance
		 * @method
		 * @return {UnitOfWork}
		*/ 
        function create() {
            return new UnitOfWork();
        }

        /**
		 * Get a new UnitOfWork based on the provided key
		 * @method
         * @param {int/string} key - Key used in the reference store
		 * @return {promise}
		*/  
        function get(key) {
            if (!refs[key]) {
                refs[key] = new SmartReference();
            }

            return refs[key];
        }

        /**
    	 * Delete references
		 * @method         
		*/ 
        function clean() {
            for (key in refs) {
                if (refs[key].referenceCount == 0) {
                    delete refs[key];
                }
            }
        }
    });