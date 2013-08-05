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
using System.Threading;
using WebMatrix.WebData;

using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Web.Filters;
using DurandalAuth.Web.Models;
using DurandalAuth.Web.Properties;
using System.Transactions;

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
        /// Sign in user
        /// </summary>
        /// <param name="credential">User credentials</param>
        /// <returns>Authenticathion object containing the result of this operation</returns>
        [HttpPost]
        [HttpOptions]
        [AllowAnonymous]
        public UserInfo Login(Credential credential)
        {
            var token = WebSecurity.GeneratePasswordResetToken("admin");
            WebSecurity.ResetPassword(token, "admin1234");

            // try to sign in
            if (WebSecurity.Login(credential.UserName, credential.Password, persistCookie: credential.RememberMe))
            {
                // Create a new Principal and return authenticated                
                IPrincipal principal = new GenericPrincipal(new GenericIdentity(credential.UserName), Roles.GetRolesForUser(credential.UserName));
                Thread.CurrentPrincipal = principal;
                HttpContext.Current.User = principal;                
                return new UserInfo
                {
                    IsAuthenticated = true,
                    UserName = credential.UserName,
                    Roles = Roles.GetRolesForUser(credential.UserName)
                };
            }
            // if you get here => return 401 Unauthorized
            var errors = new Dictionary<string, IEnumerable<string>>();
            errors.Add("Authorization", new string[] { "The supplied credentials are not valid" });
            throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized, errors));
        }

        /// <summary>
        /// Sign out the authenticated user
        /// </summary>
        /// <returns>Authenticathion object containing the result of the sign out operation</returns>
        [HttpPost]
        [AntiForgeryToken]
        [HttpOptions]
        public UserInfo Logout()
        {
            // Try to sign out
            try
            {
                WebSecurity.Logout();
                Thread.CurrentPrincipal = null;
                HttpContext.Current.User = null;
            }
            catch (MembershipCreateUserException e)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, e.Message));
            }  
            // return user not already authenticated
            return new UserInfo
            {
                IsAuthenticated = false,
                UserName = "",
                Roles = new string[] { }
            };    
        }

        /// <summary>
        /// Register a new account using the Membership system
        /// </summary>
        /// <param name="model">Register model</param>
        /// <returns>Authenticathion object containing the result of the register operation</returns>
        [HttpPost]
        [AllowAnonymous]
        [AntiForgeryToken]
        public UserInfo Register(RegisterModel model)
        {
            try
            {
                WebSecurity.CreateUserAndAccount(model.UserName, model.Password, new { Email = model.Email });
                WebSecurity.Login(model.UserName, model.Password);
                Roles.AddUsersToRole(new string[] { model.UserName } , Settings.Default.DefaultRole);
                IPrincipal principal = new GenericPrincipal(new GenericIdentity(model.UserName), Roles.GetRolesForUser(model.UserName));
                Thread.CurrentPrincipal = principal;
                HttpContext.Current.User = principal;                                
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
        /// Get the actual authentication status
        /// </summary>
        /// <returns>User authentication object</returns>
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
        /// Get the list of external logins
        /// Configured in App_Start
        /// </summary>
        /// <returns>A list with the admitted providers</returns>
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
        /// Start a external login operation with the configured oAuth providers
        /// </summary>
        /// <param name="provider">User selected provider</param>
        /// <param name="returnUrl">The return url to this domain</param>
        /// <returns>http response code</returns>
        [HttpGet]
        [AllowAnonymous]
        public HttpResponseMessage ExternalLogin(string provider, string returnUrl)
        {
            try
            {
                // Start oAuth authentication and call the ExternalLoginCallback when returning to this domain
                OAuthWebSecurity.RequestAuthentication(provider, "/api/account/ExternalLoginCallback?returnurl=" + returnUrl);
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.InnerException.Message));
            }

        }

        /// <summary>
        /// This method will be called when returning from the provider oAuth 
        /// system to get the authentication result data
        /// </summary>
        /// <param name="returnUrl">The return url (Set up in ExternalLogin start method)</param>
        /// <returns>http response</returns>
        [HttpGet]
        [AllowAnonymous]
        public HttpResponseMessage ExternalLoginCallback(string returnUrl)
        {
            try
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
                    IPrincipal principal = new GenericPrincipal(new GenericIdentity(result.ProviderUserId), null);
                    Thread.CurrentPrincipal = principal;
                    HttpContext.Current.User = principal;
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
            catch (Exception ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri("http://" + Request.RequestUri.Authority + "/#/externalloginfailure");
                return response;                
            }
        }

        /// <summary>
        /// Get data to confirm the external login account
        /// </summary>
        /// <param name="returnUrl">url to return</param>
        /// <param name="username">username</param>
        /// <param name="provideruserid">the provider user id</param>
        /// <param name="provider">The oAuth provider</param>
        /// <returns>Data to register the external account</returns>
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
                model.Email = username;
                model.DisplayName = OAuthWebSecurity.GetOAuthClientData(provider).DisplayName;
                model.ReturnUrl = returnUrl;
                model.ExternalLoginData = loginData;
            }
            return model;
        }

        /// <summary>
        /// End external registration
        /// </summary>
        /// <param name="model">External model object</param>
        /// <returns>Authentication object with the result</returns>
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
                UnitOfWork.UserProfileRepository.Add(new UserProfile { UserName = model.UserName, Email = model.Email });                    
                UnitOfWork.Commit();
                OAuthWebSecurity.CreateOrUpdateAccount(provider, providerUserId, model.UserName);
                OAuthWebSecurity.Login(provider, providerUserId, createPersistentCookie: false);
                Roles.AddUsersToRole(new string[] { model.UserName }, Settings.Default.DefaultRole);

                IPrincipal principal = new GenericPrincipal(new GenericIdentity(model.UserName), null);
                Thread.CurrentPrincipal = principal;
                HttpContext.Current.User = principal;                                                

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
        /// Check if the oAuth user has already a local account
        /// </summary>
        /// <returns>bool</returns>
        [HttpGet]
        public bool HasLocalAccount()
        {
            return OAuthWebSecurity.HasLocalAccount(WebSecurity.GetUserId(User.Identity.Name));
        }

        /// <summary>
        /// Change the password of the authenticated user
        /// </summary>
        /// <param name="model">The change password model</param>
        /// <returns>http response</returns>
        [HttpPost]
        [AntiForgeryToken]
        public HttpResponseMessage ChangePassword(ChangePasswordModel model)
        {            
            // Cannot change admin password in this test application
            // Remove this for real usage
            if (Roles.IsUserInRole("Admin")) {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Cannot change admin password in this demo app. Remove lines in ChangePassword (AccountController) action for real usage"));
            }

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
        /// Creates a new local account for a user authenticated with any external provider
        /// </summary>
        /// <param name="model">The model</param>
        /// <returns>http response</returns>
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
        /// Get antiforgery tokens
        /// </summary>
        /// <returns>the anti forgery token</returns>
        [HttpGet]
        [AllowAnonymous]
        public string GetAntiForgeryTokens()
        {
            string cookieToken = "", formToken = "";
            AntiForgery.GetTokens(null, out cookieToken, out formToken);
            HttpContext.Current.Response.Cookies[AntiForgeryConfig.CookieName].Value = cookieToken;
            return formToken;
        }

        /// <summary>
        /// Get the registered external logins list
        /// </summary>
        /// <returns>External Login List</returns>
        [HttpGet]
        public ExternalAccounts ExternalAccounts()
        {
            ICollection<OAuthAccount> accounts = OAuthWebSecurity.GetAccountsFromUserName(User.Identity.Name);
            List<ExternalLogin> externalLogins = new List<ExternalLogin>();
            foreach (OAuthAccount account in accounts)
            {
                AuthenticationClientData clientData = OAuthWebSecurity.GetOAuthClientData(account.Provider);

                externalLogins.Add(new ExternalLogin
                {
                    Provider = account.Provider,
                    ProviderDisplayName = clientData.DisplayName,
                    ProviderUserId = account.ProviderUserId,
                });
            }
            ExternalAccounts externalLoginList = new ExternalAccounts();
            externalLoginList.ExternalLogins = externalLogins;
            externalLoginList.ShowRemoveButton = externalLogins.Count > 1 || OAuthWebSecurity.HasLocalAccount(WebSecurity.GetUserId(User.Identity.Name));
            return externalLoginList;
        }

        /// <summary>
        /// Dissasociate an external account
        /// </summary>
        /// <param name="provider">The registered provider</param>
        /// <param name="providerUserId">The Id in the provider</param>
        /// <returns>http response</returns>
        [HttpPost]
        [AntiForgeryToken]
        public HttpResponseMessage Disassociate(DissasociateModel model)
        {
            string ownerAccount = OAuthWebSecurity.GetUserName(model.Provider, model.ProviderUserId);

            // Dissasociate account if authenticated user is the owner
            if (ownerAccount == User.Identity.Name)
            {
                // Using transaction to avoid dissasociation of the last linked account
                using (var scope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.Serializable }))
                {
                    bool hasLocalAccount = OAuthWebSecurity.HasLocalAccount(WebSecurity.GetUserId(User.Identity.Name));
                    if (hasLocalAccount || OAuthWebSecurity.GetAccountsFromUserName(User.Identity.Name).Count > 1)
                    {
                        OAuthWebSecurity.DeleteAccount(model.Provider, model.ProviderUserId);
                        scope.Complete();                                                
                    }
                }
                return Request.CreateResponse(HttpStatusCode.OK, "Account succesfully dissasociated");
            }

            throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, "You are not the account owner"));
        }
    }
}
