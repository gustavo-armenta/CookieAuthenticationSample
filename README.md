CookieAuthenticationSample
==========================

Protected SignalR endpoint web-hosted or self-hosted can be accessed by authenticated C# and/or JS client

**CookieAuthenticationSample** demos how to use form/cookie based authentication for different types of signalR connection.  

If you have general signalR questions, please ask in stackoverflow with tag signalr.

Solution contains four projects
--

- A **web host** project which uses IIS Express with port 8080 as the host and MVC5 form cookie based log-in pages.  It demos how signalR connections can be used inside MVC5 project which requires authentication. 

- A **JavaScript Client** uses IIS Express as the host.  The client authenticate and perform signalR actions with the server.  This demos that cross domain functionality works in the server.

- **CSharpClient** is a console application.  It demos that how we can use HttpClient to authenticate with the web host, then use signalR with authenticated CookieContainer to communicate with the server.

- An **OWIN selfhost** project.  It uses OWIN host to self-host an owin HTTP server listening to port 83.  It simplified the authentication model to only allow user/password pair to log in.  But it demos the form authentication in an self host environment.

- A **Windows Phone** project and a **Windows Store** project that demos that they can use almost the same code as CSharpClient to perform the authentication and signalR in these platforms.    

Walk through
=====
In the following walk through, if you'd like to examine the web traffic, either use browser F12 network tools or Fiddler will work fine.  For any user registration,  let User name = 'user', Password = 'password'.  This is needed because we hard coded this authentication later in self-host and CSharpClient for simplification.

Web host walk through
--
1. Make sure all projects build successfully.
2. Set Web host as start project
3. F5/ctrl-f5 to run.
4. Without login, go to AuthorizeEchoConnection or AuthorizeEchoHub page will require you to log in
5. Register User 'user' with Password 'password'
6. Go to AuthorizeEchoConnection page through menu, it should display like following, which demonstrate how a signalR persistent connection works

	    SignalR Persistent Connection.
	    Only an authenticated user can connect to this Persistent Connection.
	    •8/29/2013 17:22 stateChanged: disconnected => connecting
	    •8/29/2013 17:22 starting
	    •8/29/2013 17:22 stateChanged: connecting => connected
	    •8/29/2013 17:22 received: Welcome user!
	    •8/29/2013 17:22 start.done
	    •8/29/2013 17:22 transport=webSockets
	    •8/29/2013 17:22 received: sending to AuthorizeEchoConnection


7. Go to AuthorizeEchoHub page through menu, it should display like following, which demonstrate how a signalR hub connection works
	
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
	
JavaScript Client walk through
--
1. Start Web host server
2. In project JavaScriptClient, browse index.html directly, you will get a link to external log-in Web host.
3. Click the link and Log in Web host. It will redirect you back to http://localhost:31111/AuthorizeEchoConnection.html and you should see similar result as shown in webhost walk through
4. Click menu item AuthorizeEchoHub to visit http://localhost:31111/AuthorizeEchoHub.html to verify hub.


CSharpClient walk through
--
1. In a command prompt, go to CookieAuthenticationSample\CSharpClient\bin\Debug folder
2. Run CSharpClient.exe
3. Examine result, it should show detailed output of how authentication and signalR connections are processed

SelfHost walk through
--
1. In a new command prompt, go to CookieAuthenticationSample\SelfHost\bin\Debug folder
2. Run SelfHost.exe which starts a server at http://localhost:83/
3. In IE, run http://localhost:83/
4. Log in with User 'user' with Password 'password'
5. Examine http://localhost:83/AuthorizeEchoConnection.html and http://localhost:83/AuthorizeEchoHub.html

Windows Store App Walk through
--
The sample app s based on Windows phone 8, note, it shares the same code as in CSharpClient

1. Use either web host server or self host server locally, http://localhost:8080/
2. Run the windows store app project in local machine

Windows Phone App Walk through
--
The sample app s based on Windows phone 8, note, it shares the same code as in CSharpClient

1. Deploy Web host project to a server, such as Azure website at http://signalr-test1.azurewebsites.net/, replace the URL making it client.RunAsync parameter in MainPage.xaml.cs file. It's because windows phone emulator runs in a separate virtual machine therefore you can't use a URL containing localhost.
2. Run windows phone project in the emulator.
               

Code walk through
==
SelfHost\Connections\AuthorizeEchoConnection.cs
-
AuthorizeEchoConnection class inherits PersistentConnection and make sure override AuthorizeRequest to implement SignalR authorization for persistent connection.  Also used in WebHost project as a link.

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
SelfHost\Hubs\AuthorizeEchoHub.cs
-
Attribute Authorize (Microsoft.AspNet.SignalR.AuthorizeAttribute) can be used to authorize hubs.  Also used in WebHost project as a link.

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

Webhost\startup.cs
--
Note app.UseCors to allow cross origin message for all the requests in this website.  Use it with caution.  

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

SelfHost\Program.cs
--
We use OWIN host package to create our console process, which uses WebApp.Start to initiate the self host and listen to local machine's 83 port.

    class Program
    {
        static void Main(string[] args)
        {
            using (WebApp.Start<Startup>("http://*:83/"))
            {
                Console.WriteLine("Server running at http://localhost:83/");
                Console.ReadLine();
            }
        }
    }

SelfHost\Startup.cs
--
We use OWIN static file extension middleware package (still in development as of 10/2013) here to serve static html file in addition to WebApi and SignalR that is supported by OWIN self host.

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCors(CorsOptions.AllowAll);

            string contentPath = Path.Combine(Environment.CurrentDirectory, @"..\..");
            app.UseStaticFiles(contentPath);
            loginForm = File.ReadAllBytes(Path.Combine(contentPath, @"Account/form.html"));

            var options = new CookieAuthenticationOptions()
            {
                AuthenticationType = CookieAuthenticationDefaults.AuthenticationType,
                LoginPath = CookieAuthenticationDefaults.LoginPath,
                LogoutPath = CookieAuthenticationDefaults.LogoutPath,
            };

            app.UseCookieAuthentication(options);

We insert our middle ware to the OWIN pipe line to intercept login/logout calls and determine authentication.  Note, we redirect login URL if RedirectUrl is present in the incoming URL.
            
                var redirectUri = context.Request.Query.Get("ReturnUrl");

                if(context.Request.Path.Contains(options.LoginPath))
                {
                    if (context.Request.Method == "POST")
                    {
                        var form = context.Request.ReadFormAsync().Result;
                        var userName = form.Get("UserName");
                        var password = form.Get("Password");

                        if (!ValidateUserCredentials(userName, password))
                        {
                            var redirect = options.LoginPath;
                            if (!String.IsNullOrEmpty(redirectUri))
                            {
                                redirect += "?ReturnUrl=" + HttpUtility.UrlEncode(redirectUri);
                            }
                            context.Response.Redirect(redirect);
                            return Task.FromResult<object>(null);
                        }

                        var identity = new ClaimsIdentity(options.AuthenticationType);
                        identity.AddClaim(new Claim(ClaimTypes.Name, userName));
                        context.Authentication.SignIn(identity);

                        redirectUri = redirectUri ?? "/index.html";
                        context.Response.Redirect(redirectUri);
                        return Task.FromResult<object>(null);
                    }
                    else
                    {
                        context.Response.ContentLength = loginForm.LongLength;
                        context.Response.ContentType = "text/html";
                        context.Response.Body.Write(loginForm, 0, loginForm.Length);
                        return Task.FromResult<object>(null);
                    }
                }
                else if (context.Request.Path.Contains(options.LogoutPath))
                {
                    context.Authentication.SignOut(options.AuthenticationType);
                    redirectUri = redirectUri ?? options.LoginPath;
                    context.Response.Redirect(redirectUri);
                    return Task.FromResult<object>(null);
                }
                else if (context.Request.User == null || !context.Request.User.Identity.IsAuthenticated)
                {
                    context.Response.Redirect(options.LoginPath);
                    return Task.FromResult<object>(null);
                }
                else if (context.Request.Path == "/")
                {
                    context.Response.Redirect("/index.html");
                    return Task.FromResult<object>(null);
                }

                return next.Invoke();
            });

SelfHost/Scripts/Common.js
--
We use JavaScript code to perform login form post. 
	
	function postLoginForm() {
	    var loginForm = $("#loginForm");
	    loginForm.attr("action", "/Account/Login" + window.location.search);
	    loginForm.submit();
	}

SelfHost\Scripts\AuthorizeEchoConnection.js and AuthorizeEchoHub.js
--
These 2 JavaScript files defines the SignalR operation and events, including connection, disconnection, reconnect, stateChanged events.


    connection.connectionSlow(function () {
        writeEvent("connectionSlow");
    });

    connection.disconnected(function () {
        writeEvent("disconnected");
    });

    connection.error(function (error) {
        var innerError = error;
        var message = "";
        while (innerError) {
            message += " Message=" + innerError.message + " Stack=" + innerError.stack;
            innerError = innerError.source
        }
        writeError("Error: " + message);
    });

    connection.reconnected(function () {
        writeEvent("reconnected");
    });

    connection.reconnecting(function () {
        writeEvent("reconnecting");
    });

    connection.starting(function () {
        writeEvent("starting");
    });

    connection.received(function (data) {
        writeLine("received: " + connection.json.stringify(data));
    });

    connection.stateChanged(function (change) {
        writeEvent("stateChanged: " + printState(change.oldState) + " => " + printState(change.newState));
    });

    authorizeEchoHub.client.hubReceived = function (data) {
        writeLine("hubReceived: " + data);
    }

CSharpClient\Program.cs
--
RunAsync function defines how we can use HttpClient, CookieContainer to login and get the verification cookie. 


        private static IClientTransport GetClientTransport()
        {
            return new AutoTransport(new DefaultHttpClient());            
        }

        private async Task RunAsync(string url)
        {
            HttpClientHandler handler = new HttpClientHandler();
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

                await RunPersistentConnection(url, httpClient, handler.CookieContainer, requestVerificationToken);
                await RunHub(url, httpClient, handler.CookieContainer, requestVerificationToken);

                _traceWriter.WriteLine();
                _traceWriter.WriteLine("Sending http POST to {0}", url + "Account/LogOff");
                response = await httpClient.PostAsync(url + "Account/LogOff", new StringContent(requestVerificationToken, Encoding.UTF8, "application/x-www-form-urlencoded"));

                _traceWriter.WriteLine("Sending http POST to {0}", url + "Account/Logout");
                response = await httpClient.PostAsync(url + "Account/Logout", new StringContent(requestVerificationToken, Encoding.UTF8, "application/x-www-form-urlencoded"));
            }
        }

RunPersistentConnection and RunHub function demonstrates how to use the CookieContainer to run authenticated signalR functions


        private async Task RunPersistentConnection(string url, HttpClient httpClient, CookieContainer cookieContainer, string requestVerificationToken)
        {
            _traceWriter.WriteLine();
            _traceWriter.WriteLine("*** Persistent Connection ***");

            using (var connection = new Connection(url + "echo"))
            {
                connection.CookieContainer = cookieContainer;
                connection.TraceWriter = _traceWriter;
                connection.Received += (data) => connection.TraceWriter.WriteLine("Received: " + data);
                connection.Error += (exception) => connection.TraceWriter.WriteLine(string.Format("Error: {0}: {1}" + exception.GetType(), exception.Message));
                await connection.Start(GetClientTransport());
                await connection.Send("sending to AuthorizeEchoConnection");
                await Task.Delay(TimeSpan.FromSeconds(2));
            }
        }

        private async Task RunHub(string url, HttpClient httpClient, CookieContainer cookieContainer, string requestVerificationToken)
        {
            _traceWriter.WriteLine();
            _traceWriter.WriteLine("*** Hub ***");

            using (var connection = new HubConnection(url))
            {
                connection.CookieContainer = cookieContainer;
                connection.TraceWriter = _traceWriter;
                connection.Received += (data) => connection.TraceWriter.WriteLine("Received: " + data);
                connection.Error += (exception) => connection.TraceWriter.WriteLine(string.Format("Error: {0}: {1}" + exception.GetType(), exception.Message));

                var authorizeEchoHub = connection.CreateHubProxy("AuthorizeEchoHub");
                authorizeEchoHub.On<string>("hubReceived", (data) => connection.TraceWriter.WriteLine("HubReceived: " + data));

                await connection.Start(GetClientTransport());
                await authorizeEchoHub.Invoke("echo", "sending to AuthorizeEchoHub");
                await Task.Delay(TimeSpan.FromSeconds(2));
            }
        }

CSharpClient\CommonClient.cs
--
This file is almost the same as program.cs, which is used by the Windows phone and Windows store sample apps to do the exact same thing as in the CSharpClient program. 

Summary
==
This sample solution demos how we can make OWIN, SignalR, MVC, Authentication on different platforms to work together.  

In real world applications, if many different different kind of clients wants to authorize to the server (e.g. windows store, windows phone, web page etc.), the server might be written using web API purely for authentication.  VS2013 SPA template shows a perfect example on how to do that using OWIN and WebAPI. Similar code can be written to make SignalR work with authentication in this kind situation as well. 

