using DotNetOpenAuth.AspNet;
using Microsoft.Web.WebPages.OAuth;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Web;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Security;
using WebMatrix.WebData;

using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Web.Filters;
using DurandalAuth.Web.Models;
using DurandalAuth.Web.Properties;

namespace DurandalAuth.Web.Controllers.Api
{
    [ModelValidation]
    public class AccountController : ApiController
    {

        IUnitOfWork UnitOfWork;

        /// <summary>
        /// This controller provide the authentication api for the entire application
        /// </summary>
        /// <param name="uow">Unit of work</param>
        public AccountController(IUnitOfWork uow)
        {
            this.UnitOfWork = uow;            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="credential"></param>
        /// <returns></returns>
        [HttpPost]
        [HttpOptions]
        [AllowAnonymous]
        public UserInfo Login(Credential credential)
        {
            if (WebSecurity.Login(credential.UserName, credential.Password, persistCookie: credential.RememberMe))
            {
                HttpContext.Current.User = new GenericPrincipal(new GenericIdentity(credential.UserName), null);
                return new UserInfo
                {
                    IsAuthenticated = true,
                    UserName = credential.UserName,
                    Roles = Roles.GetRolesForUser(credential.UserName)
                };
            }

            var errors = new Dictionary<string, IEnumerable<string>>();
            errors.Add("Authorization", new string[] { "The supplied credentials are not valid" });
            throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized, errors));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryToken]
        [HttpOptions]
        public UserInfo Logout()
        {
            try
            {
                WebSecurity.Logout();
            }
            catch (MembershipCreateUserException e)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, e.Message));
            }            
            return new UserInfo
            {
                IsAuthenticated = false,
                UserName = "",
                Roles = new string[] { }
            };    
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        [AntiForgeryToken]
        public UserInfo Register(RegisterModel model)
        {
            try
            {
                WebSecurity.CreateUserAndAccount(model.UserName, model.Password, new { Email = model.Email });
                WebSecurity.Login(model.UserName, model.Password);
                HttpContext.Current.User = new GenericPrincipal(new GenericIdentity(model.UserName), null);
                Roles.AddUsersToRole(new string[] { model.UserName } , Settings.Default.DefaultRole);
                return new UserInfo() {
                    IsAuthenticated = true,
                    UserName  = model.UserName,
                    Roles = new List<string> { Settings.Default.DefaultRole }
                };   
            }
            catch (MembershipCreateUserException e)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, e.Message));
            }            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public UserInfo UserInfo()
        {
            if (WebSecurity.IsAuthenticated)
            {
                return new UserInfo
                {
                    IsAuthenticated = true,
                    UserName = WebSecurity.CurrentUserName,
                    Roles = Roles.GetRolesForUser(WebSecurity.CurrentUserName)
                };
            }
            else
            {
                return new UserInfo
                {
                    IsAuthenticated = false
                };            
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]        
        public IEnumerable<ExternalLogin> ExternalLoginsList()
        {
            var externalLogins = new List<ExternalLogin>();
            foreach (var client in OAuthWebSecurity.RegisteredClientData)
            {
                externalLogins.Add(new ExternalLogin
                {
                     Provider = client.AuthenticationClient.ProviderName,
                     ProviderDisplayName = client.DisplayName
                });
            }
            return externalLogins;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="provider"></param>
        /// <param name="returnUrl"></param>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public HttpResponseMessage ExternalLogin(string provider, string returnUrl)
        {
            try
            {
                OAuthWebSecurity.RequestAuthentication(provider, "/api/account/ExternalLoginCallback?returnurl=" + returnUrl);
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.InnerException.Message));
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="returnUrl"></param>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public HttpResponseMessage ExternalLoginCallback(string returnUrl)
        {
            AuthenticationResult result = OAuthWebSecurity.VerifyAuthentication();
            if (!result.IsSuccessful)
            {
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri("http://" + Request.RequestUri.Authority + "/#/externalloginfailure");
                return response;
            }

            if (OAuthWebSecurity.Login(result.Provider, result.ProviderUserId, createPersistentCookie: false))
            {                
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri("http://" + Request.RequestUri.Authority + "/#/" + returnUrl);
                return response;
            }

            if (User.Identity.IsAuthenticated)
            {
                // If the current user is logged in add the new account
                OAuthWebSecurity.CreateOrUpdateAccount(result.Provider, result.ProviderUserId, User.Identity.Name);
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri("http://" + Request.RequestUri.Authority + "/#/" + returnUrl);
                return response;
            }
            else
            {
                // User is new, ask for their desired membership name
                string loginData = OAuthWebSecurity.SerializeProviderUserId(result.Provider, result.ProviderUserId);
                //ViewBag.ProviderDisplayName = OAuthWebSecurity.GetOAuthClientData(result.Provider).DisplayName;
                //ViewBag.ReturnUrl = returnUrl;
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri("http://" + Request.RequestUri.Authority + "/#/externalloginconfirmation?returnurl=" + returnUrl + "&username=" + result.UserName + "&provideruserid=" + result.ProviderUserId + "&provider=" + result.Provider);
                return response;
            } 
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="returnUrl"></param>
        /// <param name="username"></param>
        /// <param name="provideruserid"></param>
        /// <param name="provider"></param>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public RegisterExternalLoginModel ExternalLoginConfirmation(string returnUrl, string username, string provideruserid, string provider)
        {            
            RegisterExternalLoginModel model = new RegisterExternalLoginModel();
            if (!User.Identity.IsAuthenticated)
            {
                // User is new, ask for their desired membership name
                string loginData = OAuthWebSecurity.SerializeProviderUserId(provider, provideruserid);
                model.UserName = username;
                model.DisplayName = OAuthWebSecurity.GetOAuthClientData(provider).DisplayName;
                model.ReturnUrl = returnUrl;
                model.ExternalLoginData = loginData;
            }
            return model;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryToken]
        [AllowAnonymous]
        public UserInfo RegisterExternalLogin(RegisterExternalLoginModel model)
        {
            string provider = null;
            string providerUserId = null;

            if (User.Identity.IsAuthenticated || !OAuthWebSecurity.TryDeserializeProviderUserId(model.ExternalLoginData, out provider, out providerUserId))
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User is already authenticated"));
            }

            // Insert a new user into the database

            UserProfile user = UnitOfWork.UserProfileRepository.FirstOrDefault(u => u.UserName.ToLower() == model.UserName.ToLower());
            // Check if user already exists
            if (user == null)
            {
                // Insert name into the profile table
                UnitOfWork.UserProfileRepository.Add(new UserProfile { UserName = model.UserName, Email = model.UserName });                    
                UnitOfWork.Commit();
                OAuthWebSecurity.CreateOrUpdateAccount(provider, providerUserId, model.UserName);
                OAuthWebSecurity.Login(provider, providerUserId, createPersistentCookie: false);
                HttpContext.Current.User = new GenericPrincipal(new GenericIdentity(model.UserName), null);
                Roles.AddUsersToRole(new string[] { model.UserName }, Settings.Default.DefaultRole);

                return new UserInfo()
                {
                    IsAuthenticated = true,
                    Roles = new List<string> {  Settings.Default.DefaultRole },
                    UserName = model.UserName
                };
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User name already exists. Please enter a different user name"));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public bool HasLocalAccount()
        {
            return OAuthWebSecurity.HasLocalAccount(WebSecurity.GetUserId(User.Identity.Name));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryToken]
        public HttpResponseMessage ChangePassword(ChangePasswordModel model)
        {
            bool changePasswordSucceeded;
            try
            {
                changePasswordSucceeded = WebSecurity.ChangePassword(User.Identity.Name, model.OldPassword, model.NewPassword);                        
            }
            catch (Exception)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Unable to change the password"));
            }

            if (changePasswordSucceeded)
            {
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "The current password is incorrect or the new password is invalid."));
            }
                           
            throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Password and confirmation should match"));
        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryToken]
        public HttpResponseMessage CreateLocalAccount(CreateLocalAccountModel model)
        {
            try
            {
                WebSecurity.CreateAccount(User.Identity.Name, model.NewPassword);
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, e.Message));
            }            
            throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Password and confirmation should match"));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [AllowAnonymous]
        public string GetAntiForgeryTokens()
        {
            string cookieToken = "", formToken = "";
            AntiForgery.GetTokens(null, out cookieToken, out formToken);
            HttpContext.Current.Response.Cookies[AntiForgeryConfig.CookieName].Value = cookieToken;
            return formToken;
        }
    }
}
