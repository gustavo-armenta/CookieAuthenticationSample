using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace Common.Hubs
{
    [Authorize]
    public class AuthorizeEchoHub : Hub
    {
        public override Task OnConnected()
        {
            return Clients.Caller.hubReceived("Welcome " + Context.User.Identity.Name + "!");
        }

        public void Echo(string value)
        {
            Clients.Caller.hubReceived(value);
        }
    }
}
