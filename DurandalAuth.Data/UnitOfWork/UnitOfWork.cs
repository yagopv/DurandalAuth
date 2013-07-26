using Breeze.WebApi;
using DurandalAuth.Data.Repositories;
using DurandalAuth.Domain.Contracts;
using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public UnitOfWork()
        {
            contextProvider = new EFContextProvider<DurandalAuthDbContext>();

            ArticleRepository = new Repository<Article>(contextProvider.Context);
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
        /// Check if Database exists. 
        /// Being used in Global.asax
        /// </summary>
        /// <returns></returns>
        public bool DatabaseExists()
        {
            return contextProvider.Context.Database.Exists();
        }

        /// <summary>
        /// Initialize Database
        /// Being used in Global.asax
        /// </summary>
        public void DatabaseInitialize()
        {
            contextProvider.Context.Database.Initialize(true);
        }

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
