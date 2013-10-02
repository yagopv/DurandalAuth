using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.IO;
using System.Linq;

using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

using System.Threading.Tasks;
using System.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Web;

namespace DurandalAuth.Web.Helpers
{
    /// <summary>
    /// This class provides snapshots with the static html content of this site
    /// </summary>
    ///<see cref="http://stackoverflow.com/questions/18530258/how-to-make-a-spa-seo-crawlable"/>
    public class Snapshot : ISnapshot
    {
        /// <summary>
        /// Check if the snapshot service is configured
        /// </summary>
        /// <returns></returns>
        public bool Configured()
        {
            if (ConfigurationManager.AppSettings["CrawlerServiceApiId"] != "{CrawlerServiceApiId}" &&
                ConfigurationManager.AppSettings["CrawlerServiceEndPoint"] != "{CrawlerServiceEndPoint}")
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Check if is a bot
        /// </summary>
        /// <param name="request">The request object</param>
        /// <returns></returns>
        public bool IsBot(HttpRequestBase request)
        {
            if (request.QueryString["_escaped_fragment_"] != null)
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Creates the snapshot
        /// </summary>
        /// <param name="url">The url to crawl</param>
        /// <returns>true if the snapshot was successfully created</returns>
        public async Task<string> Get(string url, string userAgent)
        {
            HttpClient client = new HttpClient();
            
            CrawlerConfig config = new CrawlerConfig() 
            {
                ApiId = ConfigurationManager.AppSettings["CrawlerServiceApiId"],
                Application = "durandalauth",
                ExpirationDate = DateTime.UtcNow.AddDays(3),
                Store = true,
                Url = url,
                UserAgent = userAgent
            };

            var response = await client.PostAsJsonAsync<CrawlerConfig>(ConfigurationManager.AppSettings["CrawlerServiceEndPoint"], config);

            response.EnsureSuccessStatusCode();

            return response.Content.ReadAsStringAsync().Result;
        }
    }

    public class CrawlerConfig
    {
        public string ApiId { get; set; }
        public string Application { get; set; }
        public string Url { get; set; }
        public bool Store { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string UserAgent { get; set; }
    }
}