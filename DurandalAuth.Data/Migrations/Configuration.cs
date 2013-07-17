namespace DurandalAuth.Data.Migrations
{
    using DurandalAuth.Domain.Model;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using System.Web.Security;
    using WebMatrix.WebData;

    internal sealed class Configuration : DbMigrationsConfiguration<DurandalAuth.Data.DurandalAuthUnitOfWork>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(DurandalAuth.Data.DurandalAuthUnitOfWork context)
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

            if (!Roles.RoleExists("Premium"))
            {
                Roles.CreateRole("Premium");
            }

            if (!WebSecurity.UserExists("admin"))
            {
                WebSecurity.CreateUserAndAccount("admin", "admin1234", new { Email = "admin@mydomain.com" }, false);
                Roles.AddUsersToRoles(new string[] { "admin" }, new string[] { "User", "Administrator" });
            }

            if (!WebSecurity.UserExists("user"))
            {
                WebSecurity.CreateUserAndAccount("user", "user1234", new { Email = "user1@mydomain.com" }, false);
                Roles.AddUsersToRoles(new string[] { "user" }, new string[] { "User" });
            }

            DurandalAuthUnitOfWork uow = new DurandalAuthUnitOfWork();

            UserProfile up = uow.UserProfileRepository.Find(u => u.UserName == "admin").FirstOrDefault();

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 1,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated =  up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up                  
            });

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 2,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated = up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up
            });

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 3,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated = up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up
            });

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 4,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated = up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up
            });

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 5,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated = up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up
            });

            uow.Articles.AddOrUpdate(new Domain.Model.Article()
            {
                ArticleId = 6,
                Title = "Lorem ipsum dolor sit amet",
                Description = "Nullam ipsum tortor, varius sit amet commodo vitae, condimentum sit amet tellus. Suspendisse eu tortor odio. In a massa id mi cursus malesuada sed vel ligula",
                Text = "Etiam dictum mi nulla, id ultrices tortor imperdiet eget. Nulla tortor tellus, pulvinar eu ultricies eget, feugiat posuere magna. Maecenas ut lectus sit amet libero vestibulum rhoncus. Nulla imperdiet lacus non scelerisque vestibulum. Praesent porta mauris a ipsum posuere sodales. Phasellus tincidunt arcu eu vestibulum egestas. Ut justo tortor, ornare non molestie vitae, consectetur sit amet turpis. Aenean et risus mattis, iaculis lorem ac, bibendum massa. Fusce urna urna, lobortis non arcu non, tristique commodo ligula. Maecenas volutpat augue nec diam accumsan viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae. Curabitur eget lacinia odio, vel suscipit est. Etiam id orci augue. Donec sodales sollicitudin orci, ac vehicula lorem adipiscing vitae. Etiam tempus urna mauris, vel pharetra ante euismod quis. Donec id nisl ornare lacus congue hendrerit. In eros lectus, eleifend a imperdiet at, bibendum at dolor. Praesent risus risus, pulvinar nec erat a, volutpat aliquam nunc. Mauris dapibus semper est, in volutpat magna. Nullam laoreet dolor et odio ultricies scelerisque. Ut porttitor urna massa, id rhoncus sem pellentesque ut. Etiam vel vestibulum diam. Maecenas blandit cursus vestibulum. Curabitur accumsan venenatis lectus ac scelerisque. Nullam eu lacus at mi porta ornare sit amet vitae eros",
                UserCreated = up,
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                UserUpdated = up
            });

            uow.SaveChanges();
        }
    }
}
