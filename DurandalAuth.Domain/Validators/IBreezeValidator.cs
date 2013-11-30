using Breeze.ContextProvider;
using System;
using System.Collections.Generic;

namespace DurandalAuth.Domain.Validators
{
    public interface IBreezeValidator
    {
        bool BeforeSaveEntity(EntityInfo entityInfo);
        Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap);
    }
}
