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
    public class DurandalAuthDbContext : DbContext
    {
        public DurandalAuthDbContext()
                    : base("DurandalAuthConnection")
        {
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<DurandalAuthDbContext, Migrations.Configuration>());
        }

        public DbSet<Article> Articles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            Configuration.LazyLoadingEnabled = false;
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
        }
    }
}
