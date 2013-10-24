using Common.Connections;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebHost.Startup))]
namespace WebHost
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCors(CorsOptions.AllowAll);
            ConfigureAuth(app);

            app.MapSignalR<AuthorizeEchoConnection>("/echo");
            app.MapSignalR();
        }
    }
}
