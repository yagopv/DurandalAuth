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
    [AllowAnonymous]
    public class DurandalAuthController : ApiController
    {
        IUnitOfWork UnitOfWork;

        public DurandalAuthController(IUnitOfWork uow)
        {
            UnitOfWork = uow;
        }

        // ~/breeze/resourcemgt/Articles
        [HttpGet]
        public IQueryable<Article> Articles()
        {
            return UnitOfWork.ArticleRepository.All();
        }

        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return UnitOfWork.Commit(saveBundle);
        }

        // ~/breeze/resourcemgt/Lookups
        [HttpGet]
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
