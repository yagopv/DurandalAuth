﻿using System.Configuration;
using System.Globalization;
using Microsoft.AspNet.Identity;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Owin;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security.OAuth;
using DurandalAuth.Web.Providers;
using System;
using DurandalAuth.Domain.Model;
using DurandalAuth.Data;
using DurandalAuth.Web.Helpers;
using Microsoft.AspNet.Identity.Owin;

namespace DurandalAuth.Web
{
    public partial class Startup
    {
        //Enable OWIN Bearer Token Middleware	
        static Startup()
        {			
            PublicClientId = "self";

            UserManagerFactory = () => new ApplicationUserManager(new UserStore<UserProfile>(new DurandalAuthDbContext()));

            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                //Exposes Token endpoint
                TokenEndpointPath = new PathString("/Token"),
                //Use ApplicationOAuthProvider in order to authenticate
                Provider = new ApplicationOAuthProvider(PublicClientId, UserManagerFactory),
                AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(14), //Token expiration => The user will remain authenticated for 14 days
                AllowInsecureHttp = true                
            };
        }

        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }

        public static System.Func<ApplicationUserManager> UserManagerFactory { get; set; }

        public static string PublicClientId { get; private set; }

        public void ConfigureAuth(IAppBuilder app)
        {
            app.CreatePerOwinContext(() => new DurandalAuthDbContext());
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);

            //Enable Cors support in the Web API. Should go before the activation of Bearer tokens
            //http://aspnetwebstack.codeplex.com/discussions/467315
            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

            app.UseCookieAuthentication(new CookieAuthenticationOptions());

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Enable the application to use bearer tokens to authenticate users
            // Enabling 3 components:
            // 1. Authorization Server middleware. For creating the bearer tokens
            // 2. Application bearer token middleware. Will atuthenticate every request with Authorization : Bearer header
            // 3. External bearer token middleware. For external providers
            app.UseOAuthBearerTokens(OAuthOptions);

            app.UseMicrosoftAccountAuthentication(ConfigurationManager.AppSettings["MicrosoftKey"], ConfigurationManager.AppSettings["MicrosoftSecret"]);

            app.UseTwitterAuthentication(ConfigurationManager.AppSettings["TwitterKey"], ConfigurationManager.AppSettings["TwitterSecret"]);

            app.UseFacebookAuthentication(ConfigurationManager.AppSettings["FacebookKey"], ConfigurationManager.AppSettings["FacebookSecret"]);

            app.UseGoogleAuthentication();

            // The Client ID is used by the application to uniquely identify itself to Azure AD.
            // The Metadata Address is used by the application to retrieve the signing keys used by Azure AD.
            // The AAD Instance is the instance of Azure, for example public Azure or Azure China.
            // The Authority is the sign-in URL of the tenant.
            // The Post Logout Redirect Uri is the URL where the user will be redirected after they sign out.
            //
            string clientId = ConfigurationManager.AppSettings["ida:ClientId"];
            string aadInstance = ConfigurationManager.AppSettings["ida:AADInstance"];
            string tenant = ConfigurationManager.AppSettings["ida:Tenant"];
            string postLogoutRedirectUri = ConfigurationManager.AppSettings["ida:PostLogoutRedirectUri"];
            string authority = String.Format(CultureInfo.InvariantCulture, aadInstance, tenant);

            app.UseOpenIdConnectAuthentication(
                new OpenIdConnectAuthenticationOptions
                {
                    ClientId = clientId,
                    Authority = authority,
                    //PostLogoutRedirectUri = postLogoutRedirectUri
                });
        }

        private static bool IsAjaxRequest(IOwinRequest request)
        {
            IReadableStringCollection query = request.Query;
            if ((query != null) && (query["X-Requested-With"] == "XMLHttpRequest"))
            {
                return true;
            }
            IHeaderDictionary headers = request.Headers;
            return ((headers != null) && (headers["X-Requested-With"] == "XMLHttpRequest"));
        }
    }
}