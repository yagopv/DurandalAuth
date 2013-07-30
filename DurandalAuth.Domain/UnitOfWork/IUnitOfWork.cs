using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DurandalAuth.Domain.Contracts;
using DurandalAuth.Domain.Model;
using Newtonsoft.Json.Linq;
using Breeze.WebApi;

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

        bool DatabaseExists();
        void DatabaseInitialize();
        string Metadata();

        SaveResult Commit(JObject changeSet);
        void Commit();
    }
}
