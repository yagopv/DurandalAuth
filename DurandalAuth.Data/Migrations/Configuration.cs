namespace DurandalAuth.Data.Migrations
{
    using DurandalAuth.Domain.Model;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using System.Web.Security;
    using WebMatrix.WebData;

    internal sealed class Configuration : DbMigrationsConfiguration<DurandalAuth.Data.DurandalAuthDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(DurandalAuth.Data.DurandalAuthDbContext context)
        {
            if (!WebSecurity.Initialized)
            {
                WebSecurity.InitializeDatabaseConnection("DurandalAuthConnection", "DurandalAuth_UserProfiles", "UserProfileId", "UserName", autoCreateTables: true);
            }

            if (!Roles.RoleExists("Administrator"))
            {
                Roles.CreateRole("Administrator");

            }

            if (!Roles.RoleExists("User"))
            {
                Roles.CreateRole("User");
            }

            if (!WebSecurity.UserExists("admin"))
            {
                WebSecurity.CreateUserAndAccount("admin", "admin1234", new { Email = "admin@mydomain.com" }, false);
                Roles.AddUsersToRoles(new string[] { "admin" }, new string[] { "Administrator" });
            }

            DurandalAuthDbContext uow = new DurandalAuthDbContext();

            if (!uow.Categories.Any())
            {
                
                Category category1 =  new Category()
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
