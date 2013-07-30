using System.Linq;
using System.Web.Http;
using Breeze.WebApi;
using Newtonsoft.Json.Linq;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Domain.Model;
using DurandalAuth.Web.Helpers;

namespace DurandalAuth.Web.Controllers
{
    [BreezeController]
    public class DurandalAuthController : ApiController
    {
        IUnitOfWork UnitOfWork;

        public DurandalAuthController(IUnitOfWork uow)
        {
            UnitOfWork = uow;
        }

        // ~/breeze/durandalauth/Articles
        [HttpGet]
        [Authorize(Roles = "User")]
        public IQueryable<Article> Articles()
        {
            return UnitOfWork.ArticleRepository.All();
        }

        // ~/breeze/durandalauth/UserProfiles
        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public IQueryable<UserProfile> UserProfiles()
        {
            return UnitOfWork.UserProfileRepository.All();
        }

        [HttpPost]
        [AllowAnonymous]
        public SaveResult SaveChanges(JObject saveBundle)
        {             
            return UnitOfWork.Commit(saveBundle);
        }

        // ~/breeze/durandalauth/Lookups
        [HttpGet]
        [AllowAnonymous]
        public LookupBundle Lookups()
        {
            return new LookupBundle
            {
                Categories = UnitOfWork.CategoryRepository.All().ToList(),
                Tags = UnitOfWork.TagRepository.All().ToList()
            };
        }
    }
}
