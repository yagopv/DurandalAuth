using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Web.WebPages.OAuth;
using DurandalAuth.Web.Models;
using System.Configuration;

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
                consumerKey:  ConfigurationManager.AppSettings["TwitterKey"],
                consumerSecret: ConfigurationManager.AppSettings["TwitterSecret"]);

            OAuthWebSecurity.RegisterFacebookClient(
                appId: ConfigurationManager.AppSettings["FacebookKey"],
                appSecret: ConfigurationManager.AppSettings["FacebookSecret"]);

            OAuthWebSecurity.RegisterGoogleClient();
        }
    }
}
