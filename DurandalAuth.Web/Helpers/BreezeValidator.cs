using Breeze.ContextProvider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DurandalAuth.Domain.Validators;
using DurandalAuth.Domain.Model;
using Breeze.ContextProvider.EF6;
using Microsoft.AspNet.Identity;

namespace DurandalAuth.Web.Helpers
{
    public class BreezeValidator : IBreezeValidator
    {
        ApplicationUserManager UserManager { get; set; }

        public BreezeValidator(ApplicationUserManager usermanager)
        {
            this.UserManager = usermanager;
        }

        public bool BeforeSaveEntity(EntityInfo entityInfo)
        {

            // Add custom logic here in order to save entities
            // Return false if don´t want to  save the entity 

            // - Before saving articles we have to create the custom UrlCodeReference in order to access them from a url route
            // - Before saving articles we have to fill the Audit info

            if (entityInfo.Entity.GetType() == typeof(Article))
            {
                Article article = entityInfo.Entity as Article;

                if (entityInfo.EntityState == EntityState.Added)
                {
                    article.SetUrlReference();
                    article.CreatedBy = HttpContext.Current.User.Identity.GetUserName();
                    article.CreatedDate = DateTime.UtcNow;
                    article.UpdatedBy = HttpContext.Current.User.Identity.GetUserName();
                    article.UpdatedDate = DateTime.UtcNow;
                }
                if (entityInfo.EntityState == EntityState.Modified)
                {
                    article.UpdatedBy = HttpContext.Current.User.Identity.GetUserName();
                    article.UpdatedDate = DateTime.UtcNow;
                }
            }

            // - Before saving categories we have to create the custom UrlCodeReference in order to access them from a url route

            if (entityInfo.Entity.GetType() == typeof(Category))
            {
                Category category = entityInfo.Entity as Category;
                if (entityInfo.EntityState == EntityState.Added)
                {
                    category.SetUrlReference();
                }
            }

            return true;
        }

        public Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap)
        {

            // Add custom logic here in order to save entities

            List<EntityInfo> userprofiles;

            // - In order to save and manage accounts you need to use the AccountController and not Breeze

            if (saveMap.TryGetValue(typeof(UserProfile), out userprofiles))
            {
                var errors = userprofiles.Select(oi =>
                {
                    return new EFEntityError(oi, "Save Failed", "Cannot save Users using the Breeze api", "UserProfileId");
                });
                throw new EntityErrorsException(errors);
            }


            List<EntityInfo> articles;

            // - Only registered users can save articles
            // - Only article owner can save the article

            if (saveMap.TryGetValue(typeof(Article), out articles))
            {
                if (articles.Any())
                {
                    // Mandatory => Registered users saving articles

                    if (!UserManager.IsInRole(HttpContext.Current.User.Identity.GetUserId(), "User") || !HttpContext.Current.User.Identity.IsAuthenticated)
                    {
                        var errors = articles.Select(oi =>
                        {
                            return new EFEntityError(oi, "Save Failed", "Only registered and authenticated users can save articles", "ArticleId");
                        });
                        throw new EntityErrorsException(errors);
                    }

                    // Mandatory => Only article owner can save the article

                    articles.ForEach(a =>
                    {
                        Article article = a.Entity as Article;
                        if (
                            (a.EntityState == EntityState.Modified || a.EntityState == EntityState.Added || a.EntityState == EntityState.Deleted) &&
                             article.CreatedBy != HttpContext.Current.User.Identity.GetUserName()
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

            // - Only administrators can save categories

            if (saveMap.TryGetValue(typeof(Category), out categories))
            {
                if (categories.Any() && !UserManager.IsInRole(HttpContext.Current.User.Identity.GetUserId(), "Administrator"))
                {
                    var errors = categories.Select(oi =>
                    {
                        return new EFEntityError(oi, "Save Failed", "Only administrators can save categories", "CategoryId");
                    });
                    throw new EntityErrorsException(errors);
                }
            }

            List<EntityInfo> tags;

            // - Only authenticated user can save tags

            if (saveMap.TryGetValue(typeof(Tag), out tags))
            {
                if (tags.Any())
                {
                    if (!UserManager.IsInRole(HttpContext.Current.User.Identity.GetUserId(), "User") || !HttpContext.Current.User.Identity.IsAuthenticated)
                    {
                        var errors = userprofiles.Select(oi =>
                        {
                            return new EFEntityError(oi, "Save Failed", "Only registered users can save tags", "TagId");
                        });
                        throw new EntityErrorsException(errors);
                    }
                }
            }

            return saveMap;
        }
    }
}