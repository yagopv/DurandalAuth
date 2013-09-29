using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

using DurandalAuth.Web.Helpers;

namespace DurandalAuth.Web.Controllers
{
    /// <summary>
    /// This Controller contains the Index action where all request will be redirected on this site
    /// </summary>
    public class HomeController : AsyncController
    {
        ISnapshot Snapshot;

        public HomeController(ISnapshot snapshot)
        {
            this.Snapshot = snapshot;
        }

        /// <summary>
        /// All routes in this site always return to the Index action and the control is passed to 
        /// the Durandal application
        /// If the route parameters include a _escaped_fragment_ parameter, then a snapshot of the resource is returned
        /// </summary>
        /// <returns></returns>
        public async Task<ActionResult> Index()
        {
            // If the request is not from a bot or the system is not ready or taking snapshots => control to Durandal app
            if (!Snapshot.IsBot(Request) || !Snapshot.Ready())
            {
                return View();
            }


            // If everything is ready for crawl => Take snapshot and return html

            var url = Request.Url.Scheme + "://" + Request.Url.Authority + Request.RawUrl;

            try
            {
                if (Snapshot.Exist(url))
                {
                    if (Snapshot.IsExpired(url))
                    {
                        if (await Snapshot.Create(url))
                        {
                            return Content(Snapshot.Get(url));
                        }
                    }
                    else
                    {
                        return Content(Snapshot.Get(url));
                    }
                }
                else
                {
                    if (await Snapshot.Create(url))
                    {
                        return Content(Snapshot.Get(url));
                    }
                }
            }
            catch (Exception ex)
            {
                return View();
            }
            return View();
        }

    }
}

