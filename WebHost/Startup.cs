using Common.Connections;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebHost.Startup))]
namespace WebHost
{
    public partial class Startup 
    {
        public void Configuration(IAppBuilder app) 
        {
            ConfigureAuth(app);
            app.MapSignalR<AuthorizeEchoConnection>("/echo");
            app.MapSignalR();
        }
    }
}
