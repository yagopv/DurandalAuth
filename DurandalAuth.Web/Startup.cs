using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(DurandalAuth.Web.Startup))]
namespace DurandalAuth.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
