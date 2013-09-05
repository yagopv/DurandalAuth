using DurandalAuth.Domain.Model;
using System.Collections.Generic;

namespace DurandalAuth.Web.Helpers
{
    public class LookupBundle
    {
        public IEnumerable<Category> Categories { get; set; }
    }
}
