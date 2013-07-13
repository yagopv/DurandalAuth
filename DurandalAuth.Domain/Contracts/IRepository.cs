using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.Contracts
{
        /// <summary>
        /// Contract with the  generic methods for all the Entities
        /// </summary>
        public interface IRepository<T> where T : class
        {
            IQueryable<T> AsQueryable();

            IEnumerable<T> GetAll();
            IEnumerable<T> Find(Expression<Func<T, bool>> predicate);
            T FirstOrDefault(Expression<Func<T, bool>> predicate);
            T First(Expression<Func<T, bool>> predicate);
            T GetById(int id);

            void Add(T entity);
            void Delete(T entity);
            void Attach(T entity);                    
        }
}
