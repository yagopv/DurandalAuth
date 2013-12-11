using Microsoft.AspNet.Identity;

using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Newtonsoft.Json.Linq;

using DurandalAuth.Data.Repositories;
using DurandalAuth.Domain.Repositories;
using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Domain.Validators;

namespace DurandalAuth.Data.UnitOfWork
{
    /// <summary>
    /// Implementation for the UnitOfWork in the current app
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly EFContextProvider<DurandalAuthDbContext> contextProvider;
        /// <summary>
        /// ctor
        /// </summary>
        public UnitOfWork(IBreezeValidator breezevalidator)
        {
            contextProvider = new EFContextProvider<DurandalAuthDbContext>();
            contextProvider.BeforeSaveEntitiesDelegate = breezevalidator.BeforeSaveEntities;
            contextProvider.BeforeSaveEntityDelegate = breezevalidator.BeforeSaveEntity;

            ArticleRepository = new ArticleRepository(contextProvider.Context);
            CategoryRepository = new Repository<Category>(contextProvider.Context);
            TagRepository = new Repository<Tag>(contextProvider.Context);
            UserProfileRepository = new Repository<UserProfile>(contextProvider.Context);
        }

        /// <summary>
        /// Reporitories
        /// </summary>
        public IRepository<Article> ArticleRepository {get; private set;}        
        public IRepository<Category> CategoryRepository { get; private set; }
        public IRepository<Tag> TagRepository { get; private set; }
        public IRepository<UserProfile> UserProfileRepository { get; private set; }

        /// <summary>
        /// Get breeze Metadata
        /// </summary>
        /// <returns>String containing Breeze metadata</returns>
        public string Metadata()
        {
            return contextProvider.Metadata();
        }

        /// <summary>
        /// Save a changeset using Breeze
        /// </summary>
        /// <param name="changeSet"></param>
        /// <returns></returns>
        public SaveResult Commit(JObject changeSet)
        {
            return contextProvider.SaveChanges(changeSet);
        }

        /// <summary>
        /// Save Context using traditional Entity Framework operation
        /// </summary>
        public void Commit()
        {
            contextProvider.Context.SaveChanges();
        }
    }
}
