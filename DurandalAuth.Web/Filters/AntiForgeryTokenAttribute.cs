using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Helpers;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace DurandalAuth.Web.Filters
{

    /// <summary>
    /// Validates Anti-Forgery CSRF tokens for Web API
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class AntiForgeryTokenAttribute : System.Web.Http.Filters.ActionFilterAttribute
    {

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            // IE 8 shit, names are lower-cased 
            if (!actionContext.Request.Headers.Any(z => z.Key.Equals(AntiForgeryConfig.CookieName, StringComparison.OrdinalIgnoreCase)))
            {
                actionContext.Response =
                    actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                actionContext.Response.ReasonPhrase = "Missing token";
                return;
            }

            var headerToken = actionContext
                .Request
                .Headers
                .Where(z => z.Key.Equals(AntiForgeryConfig.CookieName, StringComparison.OrdinalIgnoreCase))
                .Select(z => z.Value)
                .SelectMany(z => z)
                .FirstOrDefault();

            var cookieToken = actionContext
                .Request
                .Headers
                .GetCookies()
                .Select(c => c[AntiForgeryConfig.CookieName])
                .FirstOrDefault();

            // check for missing cookie or header
            if (cookieToken == null || headerToken == null)
            {
                actionContext.Response =
                    actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                actionContext.Response.ReasonPhrase = "Missing token null";
                return;
            }

            // ensure that the cookie matches the header
            try
            {
                AntiForgery.Validate(cookieToken.Value, headerToken);
            }
            catch
            {
                actionContext.Response =
                    actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                actionContext.Response.ReasonPhrase = "Invalid token";
                return;
            }

            base.OnActionExecuting(actionContext);
        }
    }
}