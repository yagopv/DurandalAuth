using DurandalAuth.Web.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Thinktecture.IdentityModel.Http.Cors.WebApi;
using Thinktecture.IdentityModel.Tokens.Http;
using WebMatrix.WebData;

namespace DurandalAuth.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "AccountApi",
                routeTemplate: "api/account/{action}/{id}",
                defaults: new { controller = "Account",  id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.EnableQuerySupport();

            config.Filters.Add(new AuthorizeAttribute());                        

            ConfigureAuth(config);

            ConfigureCors(config);


        }

        private static void ConfigureAuth(HttpConfiguration config)
        {
            var authConfig = new AuthenticationConfiguration
            {
                InheritHostClientIdentity = true,
                EnableSessionToken = true,
                RequireSsl = false
            };

            // setup authentication against membership
            authConfig.AddBasicAuthentication((userName, password) =>
               WebSecurity.Login(userName, password, false));

            config.MessageHandlers.Add(new AuthenticationHandler(authConfig));
        }

        private static void ConfigureCors(HttpConfiguration config)
        {
            var corsConfig = new WebApiCorsConfiguration();
            config.MessageHandlers.Add(new CorsMessageHandler(corsConfig, config));

            corsConfig
                .ForAllOrigins()
                .AllowAllMethods()
                .AllowAllRequestHeaders(); 
        }
    }
}