using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Breeze.WebApi;

using DurandalAuth.Domain.Model;

namespace DurandalAuth.Data
{
    public class DurandalAuthDbContextProvider : EFContextProvider<DurandalAuthDbContext> 
    {
        public DurandalAuthDbContextProvider() : base() { }
 
        protected override bool BeforeSaveEntity(EntityInfo entityInfo) {
          // Add custom logic here in order to save entities
          // For exmple ... Deny any additions of entities of type 'UserProfile' because they will be saved using the AccountController
          if (entityInfo.Entity.GetType() == typeof(UserProfile) && entityInfo.EntityState == EntityState.Added) {
            return false;
          } else {
            return true;
          }
       }
 
        protected override Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap) {
          // Add custom logic here in order to save entities
          return saveMap;
        }        
    }
}
