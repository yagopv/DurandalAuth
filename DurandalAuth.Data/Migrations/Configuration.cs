namespace DurandalAuth.Data.Migrations
{
    using DurandalAuth.Domain.Model;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<DurandalAuth.Data.DurandalAuthDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(DurandalAuth.Data.DurandalAuthDbContext context)
        {
            UserManager<UserProfile> UserManager = new UserManager<UserProfile>(new UserStore<UserProfile>(context));
            RoleManager<IdentityRole> RoleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));

            if (!RoleManager.RoleExists("Administrator"))
            {
                RoleManager.Create(new IdentityRole("Administrator"));

            }

            if (!RoleManager.RoleExists("User"))
            {
                RoleManager.Create(new IdentityRole("User"));

            }

            if (UserManager.FindByName("admin") == null)
            {
                var user = new UserProfile() { UserName = "admin", Email = "admin@mydomain.com", EmailConfirmed = true };
                var result = UserManager.Create(user, "admin1234");
                if (result.Succeeded)
                {
                    UserManager.AddToRole(user.Id, "Administrator");
                }
            }

            DurandalAuthDbContext uow = new DurandalAuthDbContext();

            if (!uow.Categories.Any())
            {

                Category category1 = new Category()
                {
                    CategoryId = Guid.NewGuid(),
                    Name = "About DurandalAuth",
                };
                category1.SetUrlReference();
                uow.Categories.AddOrUpdate(category1);

                Category category2 = new Category()
                {
                    CategoryId = Guid.NewGuid(),
                    Name = "General",
                };
                category2.SetUrlReference();
                uow.Categories.AddOrUpdate(category2);

                Category category3 = new Category()
                {
                    CategoryId = Guid.NewGuid(),
                    Name = "Development",
                };
                category3.SetUrlReference();
                uow.Categories.AddOrUpdate(category3);

                Category category4 = new Category()
                {
                    CategoryId = Guid.NewGuid(),
                    Name = "Technology",
                };
                category4.SetUrlReference();
                uow.Categories.AddOrUpdate(category4);

                Category category5 = new Category()
                {
                    CategoryId = Guid.NewGuid(),
                    Name = "Security",
                };
                category5.SetUrlReference();
                uow.Categories.AddOrUpdate(category5);

                uow.SaveChanges();

            }
        }
    }
}