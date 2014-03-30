using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;

using DurandalAuth.Web.Models;
using DurandalAuth.Web.Results;
using DurandalAuth.Web.Providers;
using DurandalAuth.Domain.Model;
using DurandalAuth.Domain.UnitOfWork;
using DurandalAuth.Web.Helpers;
using System.Net;

namespace DurandalAuth.Web.Controllers
{
	/// <summary>
	/// Authentication controller implementing two oAuth flows
	/// 1. Resource owner password grant for users with local accounts
	/// 2. Implicit grant for authenticating with social providers
	/// </summary>
	[RoutePrefix("api/Account")]
	public class AccountController : ApiController
	{
		private const string LocalLoginProvider = "Local";

		private ApplicationUserManager usermanager;
		public ApplicationUserManager UserManager
		{
			get
			{
				return usermanager ?? HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
			}
			private set
			{
				usermanager = value;
			}
		}
		IUnitOfWork UnitOfwork { get; set; }
		ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; set; }

		/// <summary>
		/// ctor
		/// </summary>
		public AccountController(IUnitOfWork unitofwork,                                  
								 ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
		{
			this.UnitOfwork = unitofwork;
			this.AccessTokenFormat = accessTokenFormat;
		}

		/// <summary>
		/// Get user info
		/// 401 if not authenticated
		/// </summary>
		/// <returns>The user info</returns>
		[HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
		[Route("UserInfo")]
		public async Task<UserInfoViewModel> GetUserInfo()
		{
			ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

			ClaimsIdentity userIdentity = User.Identity as ClaimsIdentity;

			// Get roles from the user claims
			// We are setting the claims in the AuthenticationOAuthProvider properties
			List<string> roles = new List<string>();
			userIdentity.Claims.Where(c => c.Type == ClaimTypes.Role).ForEach(claim => roles.Add(claim.Value));
			
			//Check for Email confirmed
			var emailConfirmed = externalLogin != null ? true : await UserManager.IsEmailConfirmedAsync(User.Identity.GetUserId());
		   
			return new UserInfoViewModel
			{
				UserName = User.Identity.GetUserName(),
				IsEmailConfirmed = emailConfirmed,
				HasRegistered = externalLogin == null,
				LoginProvider = externalLogin != null ? externalLogin.LoginProvider : null,
				Roles = roles
			};
		}

		[HttpGet]
		[AllowAnonymous]
		[Route("ConfirmEmail", Name="ConfirmEmail")]
		public async Task<IHttpActionResult> ConfirmEmail(string userId, string code)
		{
			if (userId == null || code == null)
			{
				ModelState.AddModelError("error", "You need to provide your user id and confirmation code");
				return BadRequest(ModelState);
			}

			IdentityResult result = await UserManager.ConfirmEmailAsync(userId, code);
			if (result.Succeeded)
			{
				return Redirect(Url.Content("~/account/registrationcomplete"));
			}

			IHttpActionResult errorResult = GetErrorResult(result);
			return errorResult;
		}

		[HttpPost]
		[Route("ResendConfirmationEmail", Name = "ResendConfirmationEmail")]
		public async Task<IHttpActionResult> ResendConfirmationEmail()
		{
			UserProfile user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
			string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
			var callbackUrl = Url.Link("ConfirmEmail", new { userId = user.Id, code = code });

			var notification = new AccountNotificationModel
			{
				Code = code,
				Url = callbackUrl,
				UserId = user.Id,
				Email = user.Email,
				DisplayName = user.UserName
			};

			string body = ViewRenderer.RenderView("~/Views/Mailer/NewAccount.cshtml", notification);
			await UserManager.SendEmailAsync(user.Id, "DurandalAuth account confirmation", body);
			
			return Ok();
		}

		[HttpPost]
		[Route("DeleteAccount")]
		public async Task<IHttpActionResult> DeleteAccount()
		{
			UserProfile user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

			if (user == null)
			{
				return BadRequest();
			}

			IdentityResult result = await UserManager.DeleteAsync(user);

			if (result.Succeeded)
			{
				return Ok();
			}

			IHttpActionResult errorResult = GetErrorResult(result);

			if (errorResult != null)
			{
				return errorResult;
			}

			return Ok();
		}

		/// <summary>
		/// If the user forget the password this action will send him a reset password mail
		/// </summary>
		/// <param name="model">The forgot password model</param>
		/// <returns>IHttpActionResult</returns>
		[HttpPost]
		[AllowAnonymous]
		[Route("ForgotPassword")]
		public async Task<IHttpActionResult> ForgotPassword(ForgotPasswordBindingModel model)
		{
			if (ModelState.IsValid)
			{
				var user = await UserManager.FindByEmailAsync(model.Email);
				if (user == null || !(await UserManager.IsEmailConfirmedAsync(user.Id)))
				{
					ModelState.AddModelError("", "The user either does not exist or is not confirmed.");
					return BadRequest(ModelState);
				}

				string code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
				var callbackUrl = Url.Content("~/account/resetpassword?email=") + HttpUtility.UrlEncode(model.Email) + "&code=" + HttpUtility.UrlEncode(code);

				var notification = new AccountNotificationModel
				{
					Url = callbackUrl,
					DisplayName = user.UserName
				};

				string body = ViewRenderer.RenderView("~/Views/Mailer/PasswordReset.cshtml", notification);
				await UserManager.SendEmailAsync(user.Id, "DurandalAuth reset password", body);
				
				return Ok();
			}

			// If we got this far, something failed
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Reset the user password
		/// </summary>
		/// <param name="code">The code</param>
		/// <returns></returns>
		[HttpPost]
		[AllowAnonymous]
		[Route("ResetPassword", Name="ResetPassword")]
		public async Task<IHttpActionResult> ResetPassword(ResetPasswordBindingModel model)
		{
			if (ModelState.IsValid)
			{
				var user = await UserManager.FindByEmailAsync(model.Email);
				if (user == null)
				{
					ModelState.AddModelError("", "No user found.");
					return BadRequest(ModelState);
				}
				IdentityResult result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
				if (result.Succeeded)
				{
					return Ok();
				}
				IHttpActionResult errorResult  = GetErrorResult(result);

				if (errorResult != null)
				{
					return errorResult;
				}
			}

			// If we got this far, something failed
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Logout
		/// </summary>
		/// <returns>Http 200 Result</returns>
		[Route("Logout")]
		public IHttpActionResult Logout()
		{
			Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
			return Ok();
		}

		/// <summary>
		/// Get the info for managing user accounts
		/// </summary>
		/// <param name="returnUrl">The return url</param>
		/// <param name="generateState">generate a random state for being stored and compared on the client and avoid CSRF attacks</param>
		/// <returns>The manage info</returns>
		[Route("ManageInfo")]
		public async Task<ManageInfoViewModel> GetManageInfo(string returnUrl, bool generateState = false)
		{
            if (!IsLocalUrl(returnUrl)) 
            {
                ModelState.AddModelError("returnUrl", "Can´t redirect to external urls");
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState));
            }

			IdentityUser user = await UserManager.FindByIdAsync(User.Identity.GetUserId());

			if (user == null)
			{
				return null;
			}

			List<UserLoginInfoViewModel> logins = new List<UserLoginInfoViewModel>();

			foreach (IdentityUserLogin linkedAccount in user.Logins)
			{
				logins.Add(new UserLoginInfoViewModel
				{
					LoginProvider = linkedAccount.LoginProvider,
					ProviderKey = linkedAccount.ProviderKey
				});
			}

			if (user.PasswordHash != null)
			{
				logins.Add(new UserLoginInfoViewModel
				{
					LoginProvider = LocalLoginProvider,
					ProviderKey = user.UserName,
				});
			}

			return new ManageInfoViewModel
			{
				LocalLoginProvider = LocalLoginProvider,
				UserName = user.UserName,
				Logins = logins,
				ExternalLoginProviders = GetExternalLogins(returnUrl, generateState)
			};
		}

		/// <summary>
		/// Change user password
		/// </summary>
		/// <param name="model">Change password model</param>
		/// <returns>Http 400 or 200</returns>
		[Route("ChangePassword")]
		public async Task<IHttpActionResult> ChangePassword(ChangePasswordBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			// Cannot change passwords for test users
			// Remove following lines for real usage
			if (User.IsInRole("Administrator") || User.Identity.GetUserName() == "user")
			{
				ModelState.AddModelError("Unable to change the password", "Cannot change the admin password in this demo app. Remove lines in ChangePassword (AccountController) action for real usage");
				return BadRequest(ModelState);
			}

			IdentityResult result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword,
				model.NewPassword);
			IHttpActionResult errorResult = GetErrorResult(result);

			if (errorResult != null)
			{
				return errorResult;
			}

			return Ok();
		}

		/// <summary>
		/// Set user password
		/// </summary>
		/// <param name="model">Set user password model</param>
		/// <returns>Http 400 or 200</returns>
		[Route("SetPassword")]
		public async Task<IHttpActionResult> SetPassword(SetPasswordBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			IdentityResult result = await UserManager.AddPasswordAsync(User.Identity.GetUserId(), model.NewPassword);
			IHttpActionResult errorResult = GetErrorResult(result);

			if (errorResult != null)
			{
				return errorResult;
			}

			return Ok();
		}

		/// <summary>
		/// Add a new external login to the user account
		/// </summary>
		/// <param name="model">External login model</param>
		/// <returns>Http 400 or 200</returns>
		[Route("AddExternalLogin")]
		public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

			AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

			if (ticket == null || ticket.Identity == null || (ticket.Properties != null
				&& ticket.Properties.ExpiresUtc.HasValue
				&& ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
			{
				return BadRequest("Failed to login to the external provider.");
			}

			ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

			if (externalData == null)
			{
				return BadRequest("This external login is already associated with an account.");
			}

			IdentityResult result = await UserManager.AddLoginAsync(User.Identity.GetUserId(),
				new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

			IHttpActionResult errorResult = GetErrorResult(result);

			if (errorResult != null)
			{
				return errorResult;
			}

			return Ok();
		}

		/// <summary>
		/// Remove login from user account
		/// </summary>
		/// <param name="model">Remove login model</param>
		/// <returns>Http 400 or 200</returns>
		[Route("RemoveLogin")]
		public async Task<IHttpActionResult> RemoveLogin(RemoveLoginBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			IdentityResult result;

			if (model.LoginProvider == LocalLoginProvider)
			{
				result = await UserManager.RemovePasswordAsync(User.Identity.GetUserId());
			}
			else
			{
				result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(),
					new UserLoginInfo(model.LoginProvider, model.ProviderKey));
			}

			IHttpActionResult errorResult = GetErrorResult(result);

			if (errorResult != null)
			{
				return errorResult;
			}

			return Ok();
		}

		/// <summary>
		/// Try to create a new external login
		/// This is the external login endpoint and will be reached when the oAuth provider system return control to this app
		/// </summary>
		/// <param name="provider">The external provider</param>
		/// <param name="error">If any error happened</param>
		/// <returns>Http 400 or 200</returns>
		[OverrideAuthentication] // Suppress Global authentication filters like bearer token host auth
		[HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
		[AllowAnonymous]
		[Route("ExternalLogin", Name = "ExternalLogin")]
		public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
		{
			if (error != null)
			{
				return Redirect(Url.Content("~/") + "#error=" + Uri.EscapeDataString(error));
			}

			if (!User.Identity.IsAuthenticated)
			{
				return new ChallengeResult(provider, this);
			}

			ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

			if (externalLogin == null)
			{
				return InternalServerError();
			}

			if (externalLogin.LoginProvider != provider)
			{
				Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
				return new ChallengeResult(provider, this);
			}

			UserProfile user = await UserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider,
				externalLogin.ProviderKey));

			bool hasRegistered = user != null;

			if (hasRegistered)
			{
				Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
				ClaimsIdentity oAuthIdentity = await UserManager.CreateIdentityAsync(user,
					OAuthDefaults.AuthenticationType);
				ClaimsIdentity cookieIdentity = await UserManager.CreateIdentityAsync(user,
					CookieAuthenticationDefaults.AuthenticationType);

				var justCreatedIdentity = await UserManager.FindByNameAsync(user.UserName);
				var roles = await UserManager.GetRolesAsync(justCreatedIdentity.Id);

				AuthenticationProperties properties = ApplicationOAuthProvider.CreateProperties(user.UserName, roles.ToArray(), true);
				Authentication.SignIn(properties, oAuthIdentity, cookieIdentity);                
			}
			else
			{
				IEnumerable<Claim> claims = externalLogin.GetClaims();
				ClaimsIdentity identity = new ClaimsIdentity(claims, OAuthDefaults.AuthenticationType);
				Authentication.SignIn(identity);
			}

			return Ok();
		}

		/// <summary>
		/// Get all external logins
		/// </summary>
		/// <param name="returnUrl">The return url</param>
		/// <param name="generateState">generate a random state for being stored and compared on the client and avoid CSRF attacks</param>
		/// <returns>External logins list</returns>
		[AllowAnonymous]
		[Route("ExternalLogins")]
		public IEnumerable<ExternalLoginViewModel> GetExternalLogins(string returnUrl, bool generateState = false)
		{
            if (!IsLocalUrl(returnUrl))
            {
                ModelState.AddModelError("returnUrl", "Can´t redirect to external urls");
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState));
            }

			IEnumerable<AuthenticationDescription> descriptions = Authentication.GetExternalAuthenticationTypes();
			List<ExternalLoginViewModel> logins = new List<ExternalLoginViewModel>();

			string state;

			if (generateState)
			{
				const int strengthInBits = 256;
				state = RandomOAuthStateGenerator.Generate(strengthInBits);
			}
			else
			{
				state = null;
			}

			foreach (AuthenticationDescription description in descriptions)
			{
				ExternalLoginViewModel login = new ExternalLoginViewModel
				{
					Name = description.Caption,
					Url = Url.Route("ExternalLogin", new
					{
						provider = description.AuthenticationType,
						response_type = "token",
						client_id = Startup.PublicClientId,
						redirect_uri = new Uri(Request.RequestUri, returnUrl).AbsoluteUri,
						state = state
					}),
					State = state
				};
				logins.Add(login);
			}

			return logins;
		}

		// POST api/Account/Register
		[AllowAnonymous]
		[Route("Register")]
		public async Task<IHttpActionResult> Register(RegisterBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			UserProfile user = new UserProfile
			{
				UserName = model.UserName,
				Email = model.Email,
				EmailConfirmed = false
			};

			IdentityResult identityResult = await UserManager.CreateAsync(user, model.Password);

			IHttpActionResult createResult = GetErrorResult(identityResult);

			if (createResult != null)
			{
				return createResult;
			}

			UserProfile justCreatedUser = await UserManager.FindByNameAsync(model.UserName);

			IdentityResult roleResult = await UserManager.AddToRoleAsync(justCreatedUser.Id, "User");

			IHttpActionResult addRoleResult = GetErrorResult(roleResult);

			if (addRoleResult != null)
			{
				return addRoleResult;
			}

			string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
			var callbackUrl = Url.Link("ConfirmEmail", new { userId = user.Id, code = code });

			var notification = new AccountNotificationModel
			{
				Code = code,
				Url = callbackUrl,
				UserId = justCreatedUser.Id,
				Email = justCreatedUser.Email,
				DisplayName = justCreatedUser.UserName
			};

			string body = ViewRenderer.RenderView("~/Views/Mailer/NewAccount.cshtml", notification);
			await UserManager.SendEmailAsync(user.Id, "DurandalAuth account confirmation", body);

			return Ok();
		}

		// POST api/Account/RegisterExternal
		[OverrideAuthentication]
		[HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
		[Route("RegisterExternal")]
		public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

			if (externalLogin == null)
			{
				return InternalServerError();
			}

			UserProfile user = new UserProfile
			{
				UserName = model.UserName,
				Email = model.Email,
				EmailConfirmed = true
			};

			user.Logins.Add(new IdentityUserLogin
			{
				LoginProvider = externalLogin.LoginProvider,
				ProviderKey = externalLogin.ProviderKey,
                UserId = user.Id
			});

            IdentityResult identityResult = await UserManager.CreateAsync(user);

            IHttpActionResult createResult = GetErrorResult(identityResult);

            if (createResult != null)
            {
                return createResult;
            }

            UserProfile justCreatedUser = await UserManager.FindByNameAsync(model.UserName);

            IdentityResult roleResult = await UserManager.AddToRoleAsync(justCreatedUser.Id, "User");

            IHttpActionResult addRoleResult = GetErrorResult(roleResult);

            if (addRoleResult != null)
            {
                return addRoleResult;
            }

			return Ok();
		}

		[HttpGet]
		[Authorize(Roles="Administrator")]
		public IEnumerable<UserProfileViewModel> GetUsers()
		{
			var users = UnitOfwork.UserProfileRepository.All();
			return users.Select(user => new UserProfileViewModel { UserName = user.UserName }).ToList();
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing)
			{
				if (UserManager != null)
				{
					UserManager.Dispose();
				}                
			}

			base.Dispose(disposing);
		}

		#region Aplicaciones auxiliares

		private IAuthenticationManager Authentication
		{
			get { return Request.GetOwinContext().Authentication; }
		}

		private IHttpActionResult GetErrorResult(IdentityResult result)
		{
			if (result == null)
			{
				return InternalServerError();
			}

			if (!result.Succeeded)
			{
				if (result.Errors != null)
				{
					foreach (string error in result.Errors)
					{
						ModelState.AddModelError("", error);
					}
				}

				if (ModelState.IsValid)
				{
					// No errors in ModelState, return empty BadRequest
					return BadRequest();
				}

				return BadRequest(ModelState);
			}

			return null;
		}

		private class ExternalLoginData
		{
			public string LoginProvider { get; set; }
			public string ProviderKey { get; set; }
			public string UserName { get; set; }

			public IList<Claim> GetClaims()
			{
				IList<Claim> claims = new List<Claim>();
				claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

				if (UserName != null)
				{
					claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
				}

				return claims;
			}

			public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
			{
				if (identity == null)
				{
					return null;
				}

				Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

				if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
					|| String.IsNullOrEmpty(providerKeyClaim.Value))
				{
					return null;
				}

				if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
				{
					return null;
				}

				return new ExternalLoginData
				{
					LoginProvider = providerKeyClaim.Issuer,
					ProviderKey = providerKeyClaim.Value,
					UserName = identity.FindFirstValue(ClaimTypes.Name)
				};
			}
		}

		private static class RandomOAuthStateGenerator
		{
			private static RandomNumberGenerator _random = new RNGCryptoServiceProvider();

			public static string Generate(int strengthInBits)
			{
				const int bitsPerByte = 8;

				if (strengthInBits % bitsPerByte != 0)
				{
					throw new ArgumentException("strengthInBits should be divisible by 8.", "strengthInBits");
				}

				int strengthInBytes = strengthInBits / bitsPerByte;

				byte[] data = new byte[strengthInBytes];
				_random.GetBytes(data);
				return HttpServerUtility.UrlTokenEncode(data);
			}
		}

        private bool IsLocalUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return false;
            }

            Uri absoluteUri;
            if (Uri.TryCreate(url, UriKind.Absolute, out absoluteUri))
            {
                return String.Equals(Request.RequestUri.Host, absoluteUri.Host,
                            StringComparison.OrdinalIgnoreCase);
            }
            else
            {
                bool isLocal = !url.StartsWith("http:", StringComparison.OrdinalIgnoreCase)
                    && !url.StartsWith("https:", StringComparison.OrdinalIgnoreCase)
                    && Uri.IsWellFormedUriString(url, UriKind.Relative);
                return isLocal;
            }
        }

		#endregion
	}
}
