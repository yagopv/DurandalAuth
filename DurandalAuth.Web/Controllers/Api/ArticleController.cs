using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;

namespace DurandalAuth.Web.Controllers.Api
{
    [Authorize(Roles="User")]
    public class ArticleController : ApiController
    {
        IUnitOfWork UnitOfWork;

        public ArticleController(IUnitOfWork uow)
        {
            this.UnitOfWork = uow;
        }

        public IEnumerable<Article> Get()
        {
            return UnitOfWork.ArticleRepository.GetAll();
        }
    }
}