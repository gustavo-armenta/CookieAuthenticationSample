# CookieAuthenticationSample

This sample demonstrates how to use Owin, SignalR, MVC, and Authentication together in server (webhost and selfhost) and client (console, windows store, windows phone, javascript) platforms. 

The server is protected using Forms/Cookie Authentication, the user authenticates and its signalr connections are established transparently with the logged in credentials. 

Then, there is the scenario where an external client wants to establish a signalr connection. For a javascript client, this is accomplished by enabling CORS on the server and redirecting the client to the server to do authentication and finally redirected back to client website. For csharp clients, a HttpClient instance is used to perform authentication and the CookieContainer is passed to the signalr connection.

If you have general signalR questions, please ask in stackoverflow with tag signalr.

## Solution contains six projects
- A **web host** project created with the MVC5 Visual Studio Template and configured with its default form cookie authentication. It demos how signalR connections are used inside MVC5 project which requires authentication. 
- A **self host** project uses OWIN server. It uses form cookie authentication without MVC5 and the anti-forgery token.
- A **JavaScript Client** uses IIS Express as the host.  The client authenticate and perform signalR actions with the server.  This demos that cross domain functionality works in the server.
- A **CSharpClient** is a console application.  It demos how we can use HttpClient to authenticate with the web host, then use signalR with authenticated CookieContainer to communicate with the server.
- A **Windows Phone** project and a **Windows Store** project that demos that they can use almost the same code as CSharpClient to perform the authentication and signalR in these platforms.    

## Walk through
In the following walk through, if you'd like to examine the web traffic, either use browser F12 network tools or Fiddler will work fine.  For any user registration,  let User name = 'user', Password = 'password'.  This is needed because we hard coded this authentication later in self-host and CSharpClient for simplification.

### Web host walk through
1. Make sure all projects build successfully.
2. Set Web host as start project
3. F5/ctrl-f5 to run.
4. Without login, go to AuthorizeEchoConnection or AuthorizeEchoHub page will require you to log in
5. Register User 'user' with Password 'password'
6. Go to AuthorizeEchoConnection page through menu, it should display like following, which demonstrate how a signalR persistent connection works

```
    SignalR Persistent Connection.
    Only an authenticated user can connect to this Persistent Connection.
    •8/29/2013 17:22 stateChanged: disconnected => connecting
    •8/29/2013 17:22 starting
    •8/29/2013 17:22 stateChanged: connecting => connected
    •8/29/2013 17:22 received: Welcome user!
    •8/29/2013 17:22 start.done
    •8/29/2013 17:22 transport=webSockets
    •8/29/2013 17:22 received: sending to AuthorizeEchoConnection
```

7. Go to AuthorizeEchoHub page through menu, it should display like following, which demonstrate how a signalR hub connection works

```	
    SignalR Hub.
    Only an authenticated user can connect to this Hub.
    •8/29/2013 17:28 stateChanged: disconnected => connecting
    •8/29/2013 17:28 starting
    •8/29/2013 17:28 stateChanged: connecting => connected
    •8/29/2013 17:28 hubReceived: Welcome user!
    •8/29/2013 17:28 received: {"H":"AuthorizeEchoHub","M":"hubReceived","A":["Welcome user!"]}
    •8/29/2013 17:28 hubReceived: Welcome user!
    •8/29/2013 17:28 received: {"H":"AuthorizeEchoHub","M":"hubReceived","A":["Welcome user!"]}
    •8/29/2013 17:28 start.done
    •8/29/2013 17:28 transport=webSockets
    •8/29/2013 17:28 hubReceived: sending to AuthorizeEchoHub
    •8/29/2013 17:28 received: {"H":"AuthorizeEchoHub","M":"hubReceived","A":["sending to AuthorizeEchoHub"]}
    •8/29/2013 17:28 received: {"I":"0"}
```	

### SelfHost walk through
1. WebHost and SelfHost projects use port 8080, therefore you should exit IIS Express before running the selfhost project
2. Make sure all projects build successfully.
3. Set Self host as start project
4. F5/ctrl-f5 to run.
5. In IE, navigate to http://localhost:8080/
6. Log in with User 'user' with Password 'password'
7. Examine http://localhost:8080/AuthorizeEchoConnection.html and http://localhost:8080/AuthorizeEchoHub.html

### JavaScript Client walk through
1. Start Web host server
2. In project JavaScriptClient, browse index.html directly, you will get a link to external log-in Web host.
3. Click the link and Log in Web host. It will redirect you back to http://localhost:31111/AuthorizeEchoConnection.html and you should see similar result as shown in webhost walk through
4. Click menu item AuthorizeEchoHub to visit http://localhost:31111/AuthorizeEchoHub.html to verify hub.

### CSharpClient walk through
1. In a command prompt, go to CookieAuthenticationSample\CSharpClient\bin\Debug folder
2. Run CSharpClient.exe
3. Examine result, it should show detailed output of how authentication and signalR connections are processed

### Windows Store App walk through
The sample app based on Windows Store, note, it shares the same code as in CSharpClient

1. Use either web host server or self host server locally, http://localhost:8080/
2. Run the windows store app project in local machine

### Windows Phone App walk through
The sample app based on Windows phone 8, note, it shares the same code as in CSharpClient

1. Deploy Web host project to a server, such as Azure website at http://signalr-test1.azurewebsites.net/, replace the URL making it client.RunAsync parameter in MainPage.xaml.cs file. It's because windows phone emulator runs in a separate virtual machine therefore you can't use a URL containing localhost.
2. Run windows phone project in the emulator.
               
## Code walk through
#### SelfHost\Connections\AuthorizeEchoConnection.cs
AuthorizeEchoConnection class inherits PersistentConnection and make sure override AuthorizeRequest to implement SignalR authorization for persistent connection. Also used in WebHost project as a link.

```csharp
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
```

#### SelfHost\Hubs\AuthorizeEchoHub.cs
Attribute Authorize (Microsoft.AspNet.SignalR.AuthorizeAttribute) can be used to authorize hubs.  Also used in WebHost project as a link.

```csharp
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
```

#### Webhost\Startup.cs
Note app.UseCors to allow cross origin requests in this website. Use it only when your JS client and server are hosted on separate machines.

```csharp
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
```

#### SelfHost\Startup.cs

This sample uses two nuget packages that are not officially released ("Microsoft.Owin.FileSystems" and "Microsoft.Owin.StaticFiles") to serve static html and javascript files. It is not advised to use these packages in a production environment. They are used in this sample because they represent the easiest option available to serve static content.

#### SelfHost/Scripts/Common.js
We use JavaScript code to perform login form post. 

```javascript	
	function postLoginForm() {
	    var loginForm = $("#loginForm");
	    loginForm.attr("action", "/Account/Login" + window.location.search);
	    loginForm.submit();
	}
```

#### CSharpClient\CommonClient.cs
RunAsync method handles the http authentication and the cookie is stored in HttpClientHandler.CookieContainer

```csharp
        public async Task RunAsync(string url)
        {
            var handler = new HttpClientHandler();
            handler.CookieContainer = new CookieContainer();

            using (var httpClient = new HttpClient(handler))
            {
                var loginUrl = url + "Account/Login";

                _traceWriter.WriteLine("Sending http GET to {0}", loginUrl);

                var response = await httpClient.GetAsync(loginUrl);
                var content = await response.Content.ReadAsStringAsync();
                var requestVerificationToken = ParseRequestVerificationToken(content);
                content = requestVerificationToken + "&UserName=user&Password=password&RememberMe=false";

                _traceWriter.WriteLine("Sending http POST to {0}", loginUrl);

                response = await httpClient.PostAsync(loginUrl, new StringContent(content, Encoding.UTF8, "application/x-www-form-urlencoded"));
                content = await response.Content.ReadAsStringAsync();
                requestVerificationToken = ParseRequestVerificationToken(content);

                await RunPersistentConnection(url, handler.CookieContainer);
                await RunHub(url, handler.CookieContainer);

                _traceWriter.WriteLine();
                _traceWriter.WriteLine("Sending http POST to {0}", url + "Account/LogOff");
                response = await httpClient.PostAsync(url + "Account/LogOff", CreateContent(requestVerificationToken));

                _traceWriter.WriteLine("Sending http POST to {0}", url + "Account/Logout");
                response = await httpClient.PostAsync(url + "Account/Logout", CreateContent(requestVerificationToken));
            }
        }
```

RunPersistentConnection and RunHub methods pass the HttpClientHandler.CookieContainer to the signalr connection instance before the connection is started. Then, the signalr client starts and all its requests contain the authentication cookie.

```csharp
        private async Task RunPersistentConnection(string url, CookieContainer cookieContainer)
        {
            _traceWriter.WriteLine();
            _traceWriter.WriteLine("*** Persistent Connection ***");

            using (var connection = new Connection(url + "echo"))
            {
                connection.CookieContainer = cookieContainer;
                connection.TraceWriter = _traceWriter;

                connection.Received += data =>
                {
                    connection.TraceWriter.WriteLine("Received: " + data);
                };

                connection.Error += exception =>
                {
                    connection.TraceWriter.WriteLine("Error: {0}: {1}" + exception.GetType(), exception.Message);
                };

                await connection.Start();
                await connection.Send("sending to AuthorizeEchoConnection");
                await Task.Delay(TimeSpan.FromSeconds(2));
            }
        }
```

