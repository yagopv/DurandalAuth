using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Breeze.ContextProvider;
using Newtonsoft.Json.Linq;

using DurandalAuth.Domain.Repositories;
using DurandalAuth.Domain.Model;

namespace DurandalAuth.Domain.UnitOfWork
{
    /// <summary>
    /// Contract for the UnitOfWork
    /// </summary>
    public interface IUnitOfWork
    {
        IRepository<Article> ArticleRepository { get; }
        IRepository<Category> CategoryRepository { get; }
        IRepository<Tag> TagRepository { get; }
        IRepository<UserProfile> UserProfileRepository { get; }
        void Commit();

        //Breeze specific
        string Metadata();
        SaveResult Commit(JObject changeSet);
    }
}
