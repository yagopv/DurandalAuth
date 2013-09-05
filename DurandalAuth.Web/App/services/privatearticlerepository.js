/** 
	* @module Derived repository for the Article entity
*/

define(['services/repository'], function (repository) {

	/**
	 * Repository ctor
	 * @constructor
	*/
	var ArticleRepository = (function () {

		var privatearticlerepository = function (entityManagerProvider, entityTypeName, resourceName, fetchStrategy) {
			repository.getCtor.call(this, entityManagerProvider, entityTypeName, resourceName, fetchStrategy);

			/**
			 * Get all entities with its tags and ordered by date
			 * @method
			 * @return {promise}
			*/
			this.all = function () {
				var query = breeze.EntityQuery
					.from(resourceName)
					.orderBy("createdDate desc")
					.expand("Tags");

				return executeQuery(query);
			};

			function executeQuery(query) {
				return entityManagerProvider.manager()
					.executeQuery(query.using(fetchStrategy || breeze.FetchStrategy.FromServer))
					.then(function (data) { return data.results; });
			}

		};

		privatearticlerepository.prototype = repository.create();
		return privatearticlerepository;
	})();

	return {
		create: create
	};

	/**
	 * Create a new Repository
	 * @method
	 * @param {EntityManagerProvider} entityManagerProvider
	 * @param {string} entityTypeName
	 * @param {string} resourceName
	 * @param {FetchStrategy} fetchStrategy
	 * @return {Repository}
	*/
	function create(entityManagerProvider, entityTypeName, resourceName, fetchStrategy) {
		return new ArticleRepository(entityManagerProvider, entityTypeName, resourceName, fetchStrategy);
	}
});