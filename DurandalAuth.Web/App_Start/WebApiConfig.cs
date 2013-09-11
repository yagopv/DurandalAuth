using DurandalAuth.Web.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
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

            config.Routes.MapHttpRoute(
                name: "BreezeDefault",
                routeTemplate: "breeze/{action}",
                defaults: new { Controller = "Metadata" }
            );

            config.Routes.MapHttpRoute(
                name: "BreezeModule",
                routeTemplate: "breeze/{controller}/{action}"
            );

            config.EnableQuerySupport();

            config.Filters.Add(new AuthorizeAttribute());

            if (!HttpContext.Current.IsDebuggingEnabled)
            {
                config.Filters.Add(new RequireHttpsAttribute());
            }
        }
    }
}