using System.Collections.Generic;
using System.Web.Http;

using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;

namespace DurandalAuth.Web.Controllers.Api
{
    [Authorize(Roles = "Administrator")]
    public class UserProfileController : ApiController
    {
        private IUnitOfWork UnitOfWork;

        public UserProfileController(IUnitOfWork uow)
        {
            this.UnitOfWork = uow;
        }

        public IEnumerable<UserProfile> Get()
        {
            return UnitOfWork.UserProfileRepository.GetAll();
        }
    }
}