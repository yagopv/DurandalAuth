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
    public class BlitlineSnapshot : ISnapshot
    {
        private CloudStorageAccount storageAccount;

        private CloudBlobClient blobClient;

        private CloudBlobContainer container;

        private const string blitlineApiEndPoint = "http://api.blitline.com/job";
        
        private const string blitlineApiListenEndPoint = "http://cache.blitline.com/listen";

        /// <summary>
        /// ctor
        /// </summary>
        public BlitlineSnapshot()
        {
            storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ToString());
        }

        /// <summary>
        /// Check if is a bot
        /// </summary>
        /// <param name="request">The request object</param>
        /// <returns></returns>
        public bool IsBot(HttpRequestBase request)
        {
            //request.QueryString["_escaped_fragment_"] != null ||
            if (request.UserAgent.ToLowerInvariant().Contains("googlebot") ||
                request.UserAgent.ToLowerInvariant().Contains("bingbot"))
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Check if all is ready for taking snapshots => Is a bot? Is configured via cloud services or headless browsers?
        /// </summary>
        /// <returns>bool</returns>
        public bool Ready()
        {
            // Create  snapshots container if not exists
            blobClient = storageAccount.CreateCloudBlobClient();

            container = blobClient.GetContainerReference("snapshots");

            container.CreateIfNotExists();

            container.SetPermissions(
                new BlobContainerPermissions
                {
                    PublicAccess =
                        BlobContainerPublicAccessType.Blob
                });

            // Check if Blitline is configured
            if (ConfigurationManager.AppSettings["BlitlineApiId"] != "{BlitlineApiId}")
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
        public async Task<bool> Create(string url)
        {
            HttpClient client = new HttpClient();

            FormUrlEncodedContent content = new FormUrlEncodedContent(
                    new List<KeyValuePair<string, string>>() { 
                        new KeyValuePair<string,string>("json", CreateBlitlineJSONData(url))
            });

            // Send a request asynchronously continue when complete 
            var postresponse = await client.PostAsync(blitlineApiEndPoint, content);

            postresponse.EnsureSuccessStatusCode();

            var poststring = await postresponse.Content.ReadAsStringAsync();

            if (!String.IsNullOrEmpty(poststring) && poststring.Contains("error"))
            {
                return false;
            }

            JObject postjson = JObject.Parse(poststring);

            if (postjson == null)
            {
                return false;
            }

            //Listen for job terminated
            var listenresponse = await client.GetAsync(blitlineApiListenEndPoint + "/" + postjson["results"]["job_id"].ToString());

            listenresponse.EnsureSuccessStatusCode();

            var listenstring = await listenresponse.Content.ReadAsStringAsync();

            if (!String.IsNullOrEmpty(listenstring) && listenstring.Contains("error"))
            {
                return false;
            }

            JObject listenjson = JObject.Parse(listenstring);

            return listenjson == null ? false : true;
        }

        /// <summary>
        /// Get the html content for being returned to google bot
        /// </summary>
        /// <param name="url">The target url for get then html content</param>
        /// <returns>Html static content</returns>
        public string Get(string url) 
        {
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(GetReference(url));

            string html;

            using (var memoryStream = new MemoryStream())
            {
                blockBlob.DownloadToStream(memoryStream);
                html = System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
            }

            return html;
        }

        /// <summary>
        /// Indicates if the snapshot already exists
        /// </summary>
        /// <param name="url">The url to check</param>
        /// <returns></returns>
        public bool Exist(string url)
        {
            CloudBlockBlob blockBlob = new CloudBlockBlob(new Uri(string.Format(CultureInfo.InvariantCulture, "{0}/{1}", container.Uri, GetReference(url))));
            return blockBlob.Exists();
        }

        /// <summary>
        /// If the snapshot is expired the create a new one
        /// </summary>
        /// <param name="url">The url to check</param>
        /// <returns>true if expired</returns>
        public bool IsExpired(string url)
        {
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(GetReference(url));
            blockBlob.FetchAttributes();

            //The snapshot, by default, will be available 3 days before being replaced by a new one
            return blockBlob.Properties.LastModified < DateTimeOffset.UtcNow.AddDays(-3);
        }

        /// <summary>
        /// Creates the necessary data for sending to Blitline
        /// </summary>
        /// <param name="url">The target url</param>
        /// <returns>string representing the json to send</returns>
        private string CreateBlitlineJSONData(string url)
        {
            var json = new
            {
                applicationXXXid = ConfigurationManager.AppSettings["BlitlineApiId"],
                src = url, //.Replace("?_escaped_fragment_=", ""),
                srcXXXtype = "screen_shot_url",
                srcXXXdata = new
                {
                    viewport = "1200x800",
                    saveXXXhtml = new
                    {
                        azureXXXdestination = new
                        {
                            accountXXXname =  storageAccount.Credentials.AccountName,
                            sharedXXXaccessXXXsignature = GetSaSAuthorization(GetReference(url))
                        }
                    }
                },
                functions = new List<object>() {
                    new { name = "no_op" }
                }
            };

            string jsonstring = JsonConvert.SerializeObject(json);

            jsonstring = jsonstring.Replace("XXX", "_");

            return jsonstring;
        }

        /// <summary>
        /// Get SaS Auth for allow Blitline to write blobs on my Azure account
        /// </summary>
        /// <param name="reference">The target</param>
        /// <returns>SaS query string</returns>
        private string GetSaSAuthorization(string reference)
        {
            var sas = container.GetSharedAccessSignature(new SharedAccessBlobPolicy()
            {
                Permissions = SharedAccessBlobPermissions.Write,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5), //SAS Start time is back by 5 minutes to take clock skewness into consideration
                SharedAccessExpiryTime = DateTime.UtcNow.AddMinutes(15)
            });
            return string.Format(CultureInfo.InvariantCulture, "{0}/{1}{2}", container.Uri, reference, sas);
        }

        /// <summary>
        /// Helper for constructing the blob name
        /// </summary>
        /// <param name="reference">Target url</param>
        /// <returns>Blob name</returns>
        private string GetReference(string reference)
        {
            string fragment = new Uri(reference).AbsolutePath;
            if (String.IsNullOrEmpty(fragment) || fragment == "/")
            {
                return "root";
            }
            else
            {   
                char[] arr = fragment.Where(c => (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))).ToArray();
                var urlreference = new string(arr);
                return urlreference.Trim().ToLower().Replace(" ", "-") +  ".html";
            }            
        }

    }
}