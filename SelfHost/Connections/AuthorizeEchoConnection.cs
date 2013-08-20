using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace Common.Connections
{
    public class AuthorizeEchoConnection : PersistentConnection
    {
        protected override bool AuthorizeRequest(IRequest request)
        {
            return request.User != null && request.User.Identity.IsAuthenticated;
        }

        protected override Task OnReceived(IRequest request, string connectionId, string data)
        {
            return Connection.Send(connectionId, data);
        }

        protected override Task OnConnected(IRequest request, string connectionId)
        {
            return Connection.Send(connectionId, "Welcome " + request.User.Identity.Name + "!");
        }
    }
}
