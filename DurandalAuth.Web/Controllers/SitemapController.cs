using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using DurandalAuth.Web.Results;
using DurandalAuth.Web.SEO;
using System.IO;
using DurandalAuth.Domain.UnitOfWork;

namespace DurandalAuth.Web.Controllers
{
    public class SitemapController : Controller
    {
        private IUnitOfWork UnitOfWork;

        public SitemapController(IUnitOfWork unitofwork)
        {
            this.UnitOfWork = unitofwork;
        }

        //
        // GET: /Sitemap/
        public ActionResult Sitemap()
        {
            var url = System.Web.HttpContext.Current.Request.Url;
            var leftpart = url.Scheme + "://" + url.Authority;

            // Static Urls
            var sitemapItems = new List<SitemapItem>
            {                
                new SitemapItem(leftpart + "/home/index", changeFrequency: SitemapChangeFrequency.Weekly, priority: 1.0),
                new SitemapItem(leftpart + "/home/articles", changeFrequency: SitemapChangeFrequency.Daily, priority: 1.0),
                new SitemapItem(leftpart + "/home/help", changeFrequency: SitemapChangeFrequency.Weekly, priority: 1.0),
                new SitemapItem(leftpart + "/home/about", changeFrequency: SitemapChangeFrequency.Monthly, priority: 1.0),
                new SitemapItem(leftpart + "/account/login", changeFrequency: SitemapChangeFrequency.Monthly, priority: 0.5),
                new SitemapItem(leftpart + "/account/register", changeFrequency: SitemapChangeFrequency.Monthly, priority: 0.5)
            };

            var articles = UnitOfWork.ArticleRepository.All().Where(a => a.IsPublished);

            foreach (var article in articles)
            {
                sitemapItems.Add(new SitemapItem(leftpart + "/" + article.CreatedBy + "/" + article.Category.Name + "/" + article.UrlCodeReference, changeFrequency: SitemapChangeFrequency.Weekly, priority: 0.8));
            }

            return new SitemapResult(sitemapItems);
        }
	}
}