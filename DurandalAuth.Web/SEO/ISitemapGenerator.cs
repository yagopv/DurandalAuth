using System.Collections.Generic;
using System.Xml.Linq;

namespace DurandalAuth.Web.SEO
{
    public interface ISitemapGenerator
    {
        XDocument GenerateSiteMap(IEnumerable<ISitemapItem> items);
    }
}
