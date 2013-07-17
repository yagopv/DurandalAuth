using DotNetOpenAuth.AspNet;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Linq;
using DotNetOpenAuth.AspNet.Clients;

namespace DurandalAuth.Web.Helpers
{
    public class MicrosoftScopedClient : IAuthenticationClient
    {
        private string clientId;
        private string clientSecret;
        private string scope;

        private const string baseUrl = "https://login.live.com/oauth20_authorize.srf";
        private const string tokenUrl = "https://login.live.com/oauth20_token.srf";

        public MicrosoftScopedClient(string clientId, string clientSecret, string scope)
        {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.scope = scope;
        }

        public string ProviderName
        {
            get { return "Microsoft"; }
        }

        public void RequestAuthentication(HttpContextBase context, Uri returnUrl)
        {
            string url = baseUrl + "?client_id=" + clientId + "&redirect_uri=" + HttpUtility.UrlEncode(returnUrl.ToString()) + "&scope=" + HttpUtility.UrlEncode(scope) + "&response_type=code";
            context.Response.Redirect(url);
        }

        public AuthenticationResult VerifyAuthentication(HttpContextBase context)
        {
            string code = context.Request.QueryString["code"];

            string rawUrl = context.Request.Url.ToString();
            //From this we need to remove code portion
            rawUrl = Regex.Replace(rawUrl, "&code=[^&]*", "");

            IDictionary<string, string> userData = GetUserData(code, rawUrl);

            if (userData == null)
                return new AuthenticationResult(false, ProviderName, null, null, null);

            string id = userData["id"];
            string username = userData["email"];
            userData.Remove("id");
            userData.Remove("email");

            AuthenticationResult result = new AuthenticationResult(true, ProviderName, id, username, userData);
            return result;
        }

        private IDictionary<string, string> GetUserData(string accessCode, string redirectURI)
        {
            string token = QueryAccessToken(redirectURI, accessCode);
            if (token == null || token == "")
            {
                return null;
            }
            var userData = GetUserData(token);
            return userData;
        }

        private IDictionary<string, string> GetUserData(string accessToken)
        {
            ExtendedMicrosoftClientUserData graph;
            var request =
                WebRequest.Create(
                    "https://apis.live.net/v5.0/me?access_token=" + EscapeUriDataStringRfc3986(accessToken));
            using (var response = request.GetResponse())
            {
                using (var responseStream = response.GetResponseStream())
                {
                    using (StreamReader sr = new StreamReader(responseStream))
                    {
                        string data = sr.ReadToEnd();
                        graph = JsonConvert.DeserializeObject<ExtendedMicrosoftClientUserData>(data);
                    }
                }
            }

            var userData = new Dictionary<string, string>();
            userData.Add("id", graph.Id);
            userData.Add("username", graph.Name);
            userData.Add("name", graph.Name);
            userData.Add("link", graph.Link == null ? null : graph.Link.AbsoluteUri);
            userData.Add("gender", graph.Gender);
            userData.Add("firstname", graph.FirstName);
            userData.Add("lastname", graph.LastName);
            userData.Add("email", graph.Emails.Preferred);
            return userData;
        }

        private string QueryAccessToken(string returnUrl, string authorizationCode)
        {
            var entity =
                CreateQueryString(
                    new Dictionary<string, string> {
                        { "client_id", this.clientId },
                        { "redirect_uri", returnUrl },
                        { "client_secret", this.clientSecret},
                        { "code", authorizationCode },
                        { "grant_type", "authorization_code" },
                    });

            WebRequest tokenRequest = WebRequest.Create(tokenUrl);
            tokenRequest.ContentType = "application/x-www-form-urlencoded";
            tokenRequest.ContentLength = entity.Length;
            tokenRequest.Method = "POST";

            using (Stream requestStream = tokenRequest.GetRequestStream())
            {
                var writer = new StreamWriter(requestStream);
                writer.Write(entity);
                writer.Flush();
            }

            HttpWebResponse tokenResponse = (HttpWebResponse)tokenRequest.GetResponse();
            if (tokenResponse.StatusCode == HttpStatusCode.OK)
            {
                using (Stream responseStream = tokenResponse.GetResponseStream())
                {
                    using (StreamReader sr = new StreamReader(responseStream))
                    {
                        string data = sr.ReadToEnd();
                        var tokenData = JsonConvert.DeserializeObject<OAuth2AccessTokenData>(data);
                        if (tokenData != null)
                        {
                            return tokenData.AccessToken;
                        }
                    }
                }
            }

            return null;
        }

        private static readonly string[] UriRfc3986CharsToEscape = new[] { "!", "*", "'", "(", ")" };
        private static string EscapeUriDataStringRfc3986(string value)
        {
            StringBuilder escaped = new StringBuilder(Uri.EscapeDataString(value));

            // Upgrade the escaping to RFC 3986, if necessary.
            for (int i = 0; i < UriRfc3986CharsToEscape.Length; i++)
            {
                escaped.Replace(UriRfc3986CharsToEscape[i], Uri.HexEscape(UriRfc3986CharsToEscape[i][0]));
            }

            // Return the fully-RFC3986-escaped string.
            return escaped.ToString();
        }

        private static string CreateQueryString(IEnumerable<KeyValuePair<string, string>> args)
        {
            if (!args.Any())
            {
                return string.Empty;
            }
            StringBuilder sb = new StringBuilder(args.Count() * 10);

            foreach (var p in args)
            {
                sb.Append(EscapeUriDataStringRfc3986(p.Key));
                sb.Append('=');
                sb.Append(EscapeUriDataStringRfc3986(p.Value));
                sb.Append('&');
            }
            sb.Length--; // remove trailing &

            return sb.ToString();
        }

        protected class ExtendedMicrosoftClientUserData
        {
            public string FirstName { get; set; }
            public string Gender { get; set; }
            public string Id { get; set; }
            public string LastName { get; set; }
            public Uri Link { get; set; }
            public string Name { get; set; }
            public Emails Emails { get; set; }
        }

        protected class Emails
        {
            public string Preferred { get; set; }
            public string Account { get; set; }
            public string Personal { get; set; }
            public string Business { get; set; }
        }
    }
}



