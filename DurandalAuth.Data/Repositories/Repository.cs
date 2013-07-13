using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DurandalAuth.Domain.Contracts;

namespace DurandalAuth.Data.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {

        private readonly DbSet<TEntity> dbSet;

        public Repository(DbSet<TEntity> dbSet)
        {
            this.dbSet = dbSet;
        }

        public IQueryable<TEntity> AsQueryable()
        {
            return this.dbSet.AsQueryable();
        }

        public IEnumerable<TEntity> GetAll()
        {
            return this.dbSet;
        }

        public IEnumerable<TEntity> Find(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return this.dbSet.Where(predicate);
        }

        public TEntity FirstOrDefault(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return this.dbSet.Where(predicate).FirstOrDefault();
        }

        public TEntity First(System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate)
        {
            return this.dbSet.Where(predicate).First();
        }

        public TEntity GetById(int id)
        {
            return this.dbSet.Find(id);
        }

        public void Add(TEntity entity)
        {
            this.dbSet.Add(entity);
        }

        public void Delete(TEntity entity)
        {
            this.dbSet.Remove(entity);
        }

        public void Attach(TEntity entity)
        {
            this.dbSet.Attach(entity);
        }
    }
}
