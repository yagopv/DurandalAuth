/** 
 * @module Derived repository for the Article entity
*/

define(['services/repository'], function (repository) {

	/**
	 * Repository ctor
	 * @constructor
	*/
	var ArticleRepository = (function () {

		var publicarticlerepository = function (entityManagerProvider, entityTypeName, resourceName, fetchStrategy) {
			repository.getCtor.call(this, entityManagerProvider, entityTypeName, resourceName, fetchStrategy);

			/**
			 * Find Entity by predicate
			 * @method
			 * @param {string} predicate
			 * @return {promise}
			*/
			this.find = function (predicate, page, count) {
			    var query = breeze.EntityQuery
					.from(resourceName)
			        .where(predicate)
                    .orderBy("createdDate desc")
					.expand("Category,Tags")
					.skip(page * count)
					.take(count);

				return executeQuery(query);
			};

			function executeQuery(query) {
				return entityManagerProvider.manager()
					.executeQuery(query.using(fetchStrategy || breeze.FetchStrategy.FromServer))
					.then(function (data) { return data.results; });
			}

		};

		publicarticlerepository.prototype = repository.create();
		return publicarticlerepository;
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