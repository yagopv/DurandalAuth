using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Web.WebPages.OAuth;
using DurandalAuth.Web.Models;

namespace DurandalAuth.Web
{
    public static class AuthConfig
    {
        public static void RegisterAuth()
        {
            // To let users of this site log in using their accounts from other sites such as Microsoft, Facebook, and Twitter,
            // you must update this site. For more information visit http://go.microsoft.com/fwlink/?LinkID=252166

            //OAuthWebSecurity.RegisterMicrosoftClient(
            //    clientId: "",
            //    clientSecret: "");

            OAuthWebSecurity.RegisterTwitterClient(
                consumerKey: "ZWYoKJVentMOzeIoLC1ejg",
                consumerSecret: "ZQBghHVvEEV2jF4iLrXIzwithi9BnecAmQJgMucFFA");

            OAuthWebSecurity.RegisterFacebookClient(
                appId: "596697613695140",
                appSecret: "c74456ec7614d0aa550123d2c00450a2");

            OAuthWebSecurity.RegisterGoogleClient();
        }
    }
}
