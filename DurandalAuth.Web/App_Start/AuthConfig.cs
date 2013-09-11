using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Web.WebPages.OAuth;
using DurandalAuth.Web.Models;
using System.Configuration;
using DurandalAuth.Web.Helpers;
using System.Web.Mvc;
using System.Web;
using System.Web.Http;

namespace DurandalAuth.Web
{
    public static class AuthConfig
    {
        public static void RegisterOAuth()
        {
            // To let users of this site log in using their accounts from other sites such as Microsoft, Facebook, and Twitter,
            // you must update this site. For more information visit http://go.microsoft.com/fwlink/?LinkID=252166

            OAuthWebSecurity.RegisterTwitterClient(
                consumerKey:  ConfigurationManager.AppSettings["TwitterKey"],
                consumerSecret: ConfigurationManager.AppSettings["TwitterSecret"]);

            OAuthWebSecurity.RegisterFacebookClient(
                appId: ConfigurationManager.AppSettings["FacebookKey"],
                appSecret: ConfigurationManager.AppSettings["FacebookSecret"]);

            OAuthWebSecurity.RegisterGoogleClient();

            Dictionary<string, object> MicrosoftsocialData = new Dictionary<string, object>();
            MicrosoftsocialData.Add("Icon", "../Content/icons/microsoft.png");
            OAuthWebSecurity.RegisterClient(new MicrosoftScopedClient(ConfigurationManager.AppSettings["MicrosoftKey"], 
                                                                      ConfigurationManager.AppSettings["MicrosoftSecret"],
                                                                      "wl.basic wl.emails"), "Microsoft", MicrosoftsocialData);
        }

        public static void RegisterMVCAuth(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            if (!HttpContext.Current.IsDebuggingEnabled)
            {
                filters.Add(new RequireHttpsAttribute());
            }
        }

        public static void RegisterWebApiAuth(HttpConfiguration config)
        {
            config.Filters.Add(new System.Web.Http.AuthorizeAttribute());

            if (!HttpContext.Current.IsDebuggingEnabled)
            {
                config.Filters.Add(new DurandalAuth.Web.Filters.RequireHttpsAttribute());
            }
        }
    }
}
