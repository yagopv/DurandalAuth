using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DurandalAuth.Domain.Model;
using System.Data.Entity.ModelConfiguration.Conventions;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Data.Repositories;
using DurandalAuth.Domain.Contracts;

namespace DurandalAuth.Data
{
    public class DurandalAuthUnitOfWork : DbContext, IUnitOfWork
    {
        private readonly Repository<Article> articleRepository;
        private readonly Repository<UserProfile> userProfileRepository;

        public DurandalAuthUnitOfWork()
                    : base("DurandalAuthConnection")
        {
            this.articleRepository = new Repository<Article>(Articles);
            this.userProfileRepository = new Repository<UserProfile>(UserProfiles);
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<DurandalAuthUnitOfWork, Migrations.Configuration>());
        }

        public DbSet<Article> Articles { get; set; }        
        public DbSet<UserProfile> UserProfiles { get; set; }

        public IRepository<Article> ArticleRepository
        {
            get { return articleRepository; }
        }

        public IRepository<UserProfile> UserProfileRepository
        {
            get { return userProfileRepository; }
        }

        public void Commit()
        {
            this.SaveChanges();                
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            Configuration.LazyLoadingEnabled = false;
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
        }
    }
}
