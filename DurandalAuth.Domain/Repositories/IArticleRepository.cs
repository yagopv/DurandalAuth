using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DurandalAuth.Domain.Model;

namespace DurandalAuth.Domain.Repositories
{
    public interface IArticleRepository : IRepository<Article>
    {
        IQueryable<Article> All();
    }
}
