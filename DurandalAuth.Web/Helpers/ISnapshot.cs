using System.Threading.Tasks;
using System.Web;

namespace DurandalAuth.Web.Helpers
{
    /// <summary>
    /// This interface is the contract that you have implement in order to make your page ajax crawlable for google bots
    /// </summary>
    /// <remarks>
    /// The implementation you´ll find in this site uses Blitline with Azure for SEO Optimization but there are
    /// another valid options like using the same Blitline with Amazon S3 (straighforward) or execute 
    /// a headless browser among others
    /// </remarks>
    /// <see cref="https://developers.google.com/webmasters/ajax-crawling/?hl=es"/>
    public interface ISnapshot
    {
        /// <summary>
        /// Check if is a bot
        /// </summary>
        /// <param name="request">The request object</param>
        /// <returns></returns>
        bool IsBot(HttpRequestBase request);

        /// <summary>
        /// Check if all is ready for taking snapshots => Is a bot? Is configured via cloud services or headless browsers?
        /// </summary>
        /// <returns>bool</returns>
        bool Ready();

        /// <summary>
        /// Create the snapshot
        /// </summary>
        Task<bool> Create(string url);

        /// <summary>
        /// Get the html for return to google bot
        /// </summary>
        string Get(string url);

        /// <summary>
        /// Check if the snapshot exists so you don´t need to create it again
        /// </summary>
        bool Exist(string url);

        /// <summary>
        /// Check if the snapshot is expired so you need to create it again
        /// </summary>
        bool IsExpired(string url);
    }
}
