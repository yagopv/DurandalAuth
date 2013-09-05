using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Breeze.WebApi;

using DurandalAuth.Domain.Model;
using System.Web.Security;
using WebMatrix.WebData;

namespace DurandalAuth.Data
{
    public class DurandalAuthDbContextProvider : EFContextProvider<DurandalAuthDbContext> 
    {
        public DurandalAuthDbContextProvider() : base() { }
 
        protected override bool BeforeSaveEntity(EntityInfo entityInfo) {
            if (entityInfo.Entity.GetType() == typeof(Article))
            {
                Article article = entityInfo.Entity as Article;

                var regulartitle = System.Text.RegularExpressions.Regex.Replace(article.Title , @"\s+", " ");
                article.UrlCodeReference = regulartitle.Trim().ToLower().Replace(" ", "-");

                if (entityInfo.EntityState == EntityState.Added)
                {
                    article.CreatedBy = WebSecurity.CurrentUserName;
                    article.CreatedDate = DateTime.UtcNow;                    
                }
                if (entityInfo.EntityState == EntityState.Modified)
                {
                    article.UpdatedBy = WebSecurity.CurrentUserName;
                    article.UpdatedDate = DateTime.UtcNow;                    
                }                                               
            }
            // Add custom logic here in order to save entities
            // Return false if don´t want to  save the entity            
            return true;
       }
 
        protected override Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap) {
            // Add custom logic here in order to save entities
            List<EntityInfo> userprofiles;
            if (saveMap.TryGetValue(typeof(UserProfile), out userprofiles))
            {                
                // AccountController in order to manage users
                var errors = userprofiles.Select(oi =>
                {
                    return new EFEntityError(oi, "Save Failed", "Cannot save Users using the Breeze api", "UserProfileId");
                });
                throw new EntityErrorsException(errors);
            }

            List<EntityInfo> articles;
            if (saveMap.TryGetValue(typeof(Article), out articles))
            {               
                if (articles.Any())
                {                    
                    // Mandatory => Registered users saving articles
                    if (!Roles.IsUserInRole("User") || !WebSecurity.IsAuthenticated)
                    {
                        var errors = articles.Select(oi =>
                        {
                            return new EFEntityError(oi, "Save Failed", "Only registered and authenticated users can save articles", "ArticleId");
                        });
                        throw new EntityErrorsException(errors);
                    }
                                        
                    articles.ForEach(a =>  {
                        Article article = a.Entity as Article;
                        if (
                            (a.EntityState == EntityState.Modified || a.EntityState == EntityState.Added || a.EntityState == EntityState.Deleted) && 
                             article.CreatedBy != WebSecurity.CurrentUserName
                           )
                        {
                            throw new EntityErrorsException(new List<EFEntityError>() { 
                                new EFEntityError(a, "Save Failed", "You don´t have permissions for save this article", "ArticleId") 
                            });                    
                        }
                    });
                }
            }

            List<EntityInfo> categories;
            if (saveMap.TryGetValue(typeof(Category), out categories))
            {
                if (categories.Any() && !Roles.IsUserInRole("Administrator"))
                {
                    var errors = categories.Select(oi =>
                    {
                        return new EFEntityError(oi, "Save Failed", "Only administrators can save categories", "CategoryId");
                    });
                    throw new EntityErrorsException(errors);
                }
            }

            List<EntityInfo> tags;
            if (saveMap.TryGetValue(typeof(Tag), out tags))
            {
                if (tags.Any() && !(Roles.IsUserInRole("User") && WebSecurity.IsAuthenticated))
                {
                    var errors = userprofiles.Select(oi =>
                    {
                        return new EFEntityError(oi, "Save Failed", "Only registered users can save tags", "TagId");
                    });
                    throw new EntityErrorsException(errors);
                }
            }
            return saveMap;
        }
    }
}
