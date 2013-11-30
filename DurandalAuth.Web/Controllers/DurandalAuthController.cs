using System.Linq;
using System.Web.Http;

using Breeze.WebApi2;
using Breeze.ContextProvider;
using Newtonsoft.Json.Linq;

using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Domain.Model;
using DurandalAuth.Web.Helpers;
using DurandalAuth.Web.Filters;
using Microsoft.AspNet.Identity;
using System.IdentityModel.Services;
using System.Collections.Generic;
using System;
using System.Threading;
using Breeze.ContextProvider.EF6;


namespace DurandalAuth.Web.Controllers
{
    /// <summary>
    /// Main controller retrieving information from the data store
    /// </summary>
    [BreezeController]
    public class DurandalAuthController : ApiController
    {
        IUnitOfWork UnitOfWork;

        private UserManager<UserProfile> UserManager { get; set; }

        public DurandalAuthController(IUnitOfWork uow, UserManager<UserProfile> usermanager)
        {
            UnitOfWork = uow;
            UserManager = usermanager;
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
        /// Get user profiles
        /// </summary>
        /// <returns>IQueryable user profiles</returns>
        [HttpGet]      
        [Authorize(Roles="Administrator")]        
        public IQueryable<UserProfile> UserProfiles()
        {
            return UnitOfWork.UserProfileRepository.All();
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
