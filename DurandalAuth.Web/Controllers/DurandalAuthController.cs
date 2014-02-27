using System.Linq;
using System.Web.Http;

using Microsoft.AspNet.Identity;
using Breeze.WebApi2;
using Breeze.ContextProvider;
using Newtonsoft.Json.Linq;

using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Domain.Model;
using DurandalAuth.Web.Helpers;

namespace DurandalAuth.Web.Controllers
{
    /// <summary>
    /// Main controller retrieving information from the data store
    /// </summary>
    [BreezeController]
    public class DurandalAuthController : ApiController
    {
        IUnitOfWork UnitOfWork;

        public DurandalAuthController(IUnitOfWork uow)
        {
            UnitOfWork = uow;
        }

        /// <summary>
        /// Get private articles
        /// </summary>
        /// <returns>IQueryable articles</returns>		
        [HttpGet]
        [Authorize(Roles="User")]
        public IQueryable<Article> PrivateArticles()
        {
            if (User.IsInRole("User")) {
                return UnitOfWork.ArticleRepository.Find(a => a.CreatedBy == User.Identity.Name);
            }
            throw new HttpResponseException(System.Net.HttpStatusCode.Unauthorized);            
        }

        /// <summary>
        /// Get public articles
        /// </summary>
        /// <returns>IQueryable articles</returns>
        [HttpGet]
        [AllowAnonymous]
        public IQueryable<Article> PublicArticles()
        {
            return UnitOfWork.ArticleRepository.Find(a => a.IsPublished == true);
        }

        /// <summary>
        /// Save changes to data store
        /// </summary>
        /// <param name="saveBundle">The changes</param>
        /// <returns>Save result</returns>
        [HttpPost]
        [AllowAnonymous]
        public SaveResult SaveChanges(JObject saveBundle)
        {             
            return UnitOfWork.Commit(saveBundle);
        }

        /// <summary>
        /// Get the lookups on client first app load
        /// </summary>
        /// <returns>The bundles</returns>
        [HttpGet]
        [AllowAnonymous]
        public LookupBundle Lookups()
        {
            return new LookupBundle
            {
                Categories = UnitOfWork.CategoryRepository.All().ToList()
            };
        }
    }
}
