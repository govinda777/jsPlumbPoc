using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(jsPlumbPoc.Startup))]
namespace jsPlumbPoc
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
