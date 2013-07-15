using DurandalAuth.Domain.Contracts;
using DurandalAuth.Domain.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.UnitOfWork
{
    public interface IUnitOfWork
    {
        IRepository<Article> ArticleRepository { get; }
        IRepository<UserProfile> UserProfileRepository { get; }

        bool DatabaseExists();
        void DatabaseInitialize();

        void Commit();
    }
}
