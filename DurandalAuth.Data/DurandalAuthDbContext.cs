using DurandalAuth.Domain.Model;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace DurandalAuth.Data
{
    public class DurandalAuthDbContext : IdentityDbContext<UserProfile>
    {
        public DurandalAuthDbContext()
                    : base("DurandalAuthConnection")
        {            
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<DurandalAuthDbContext, Migrations.Configuration>());
        }

        public DbSet<Article> Articles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            Configuration.LazyLoadingEnabled = false;
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

            // Very bad idea not doing this :)
            //http://stackoverflow.com/questions/19474662/map-tables-using-fluent-api-in-asp-net-mvc5-ef6
            base.OnModelCreating(modelBuilder);
        }
    }

}
