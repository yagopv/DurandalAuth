using System;
using System.Collections.Generic;

namespace DurandalAuth.Web.Models
{
    // AccountController view  models
    public class ExternalLoginViewModel
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public string State { get; set; }
    }

    public class ManageInfoViewModel
    {
        public string LocalLoginProvider { get; set; }

        public string UserName { get; set; }

        public IEnumerable<UserLoginInfoViewModel> Logins { get; set; }

        public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }
    }

    public class UserInfoViewModel
    {
        public string UserName { get; set; }

        public bool IsEmailConfirmed { get; set; }

        public bool HasRegistered { get; set; }

        public string LoginProvider { get; set; }

        public IEnumerable<string> Roles { get; set; }
    }

    public class UserLoginInfoViewModel
    {
        public string LoginProvider { get; set; }

        public string ProviderKey { get; set; }
    }

    public class UserProfileViewModel
    {
        public string UserName { get; set;}
    }

    public class AccountNotificationModel
    {
        public string UserId { get; set; }

        public string DisplayName { get; set; }

        public string Code { get; set; }

        public string Url { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }
    }
}
