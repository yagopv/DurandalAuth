using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;

using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.Repositories;

namespace DurandalAuth.Data.Repositories
{
    public class ArticleRepository : Repository<Article>, IArticleRepository
    {
        public ArticleRepository(DbContext context) : base(context) { }

        public override IQueryable<Article> All()
        {
            return this.Context.Set<Article>().Include("Category");
        }

    }
}
