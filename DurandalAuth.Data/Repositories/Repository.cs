using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DurandalAuth.Domain.Contracts;

namespace DurandalAuth.Data.Repositories
{
    /// <summary>
    /// Generic Repository
    /// </summary>
    /// <typeparam name="TEntity">The generic entity type</typeparam>
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected DbContext Context { get; private set; }

        /// <summary>
        /// ctor
        /// </summary>
        /// <param name="context">Context</param>
        public Repository(DbContext context)
        {
            Context = context;
        }

        /// <summary>
        /// Get all Entities for the concrete type
        /// </summary>
        /// <returns></returns>
        public IQueryable<TEntity> All()
        {
            return Context.Set<TEntity>();
        }

        /// <summary>
        /// Find Entities based on the required predicate
        /// </summary>
        /// <param name="predicate">The predicate</param>
        /// <returns></returns>
        public IQueryable<TEntity> Find(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return Context.Set<TEntity>().Where(predicate);
        }

        /// <summary>
        /// Find first or default Entity
        /// </summary>
        /// <param name="predicate">The search predicate</param>
        /// <returns>The Entity</returns>
        public TEntity FirstOrDefault(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return Context.Set<TEntity>().Where(predicate).FirstOrDefault();
        }

        /// <summary>
        /// Find first Entity matching predicate
        /// </summary>
        /// <param name="predicate"></param>
        /// <returns>The Entity</returns>
        public TEntity First(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return Context.Set<TEntity>().Where(predicate).First();
        }

        /// <summary>
        /// Get Entity by identity
        /// </summary>
        /// <param name="id">The identity</param>
        /// <returns>The Entity</returns>
        public TEntity GetById(int id)
        {
            return Context.Set<TEntity>().Find(id);
        }

        /// <summary>
        /// Add Entity to the working Context
        /// </summary>
        /// <param name="entity">The Entity</param>
        public void Add(TEntity entity)
        {
            Context.Set<TEntity>().Add(entity);
        }

        /// <summary>
        /// Remove Entity to the working Context
        /// </summary>
        /// <param name="entity">The Entity</param>
        public void Delete(TEntity entity)
        {
            Context.Set<TEntity>().Remove(entity);
        }

        /// <summary>
        /// Attach Entity to the working Context
        /// </summary>
        /// <param name="entity">The Entity</param>
        public void Attach(TEntity entity)
        {
            Context.Set<TEntity>().Attach(entity);
        }
    }
}
