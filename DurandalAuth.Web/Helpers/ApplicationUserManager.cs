using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Microsoft.Owin;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity.EntityFramework;

using DurandalAuth.Data;
using DurandalAuth.Domain.Model;

namespace DurandalAuth.Web.Helpers
{
    public class ApplicationUserManager : UserManager<UserProfile>
    {
        public ApplicationUserManager(IUserStore<UserProfile> store)
            : base(store)
        {
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            var manager = new ApplicationUserManager(new UserStore<UserProfile>(context.Get<DurandalAuthDbContext>()));
            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<UserProfile>(manager)
            {                
                AllowOnlyAlphanumericUserNames = true,
                RequireUniqueEmail = true                
            };
            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 6,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false                
            };

            manager.UserLockoutEnabledByDefault = true;

            manager.EmailService = new EmailService();

            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider = new DataProtectorTokenProvider<UserProfile>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            return manager;
        }
    }
}