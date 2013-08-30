CookieAuthenticationSample
==========================

Protected SignalR endpoint webhosted or selfhosted can be accessed by authenticated C# and/or JS client

**CookieAuthenticationSample** demos how to use form/cookie based authentication for different types of signalR connection.  

Solution contains four projects
--

- A **web host** project which uses IIS Express with port 8080 as the host and MVC5 form cookie based login pages.  It demos how signalR connections can be used inside MVC5 project which requires authentication. 

- A **JavaScript Client** uses IIS Express as the host.  The client authenticate and perform signalR actions with the server.  This demos that cross domain functionality works in the server.

- **CSharpClient** is a console application.  It demos that how we can use HttpClient to authenticate with the web host, then use signalR with authenticated CookieContainer to communicate with the server.

- An **OWIN selfhost** project.  It uses OWIN host to self-host an over simplified http server listening to port 8080.  It just demos that an authentication can be done, and the clients can also connect to this server instead of the web host.  Note, the port is the same as in web host.  

Walkthrough
=====
In the following walkthroughs, if you'd like to examine the web traffic, either use browser F12 network tools or Fiddler will work fine.  For any user registration,  let User name = 'user', Password = 'password'.  This is needed because we hard coded this authentication later in selfhost and CSharpClient for simplification.

Web host walkthrough
--
1. Make sure all projects build successfully.
2. Set Web host as start project
3. F5/ctrl-f5 to run.
4. Without login, go to AuthorizeEchoConnection or AuthorizeEchoHub page will require you to login
5. Register User 'user' with Password 'password'
6. Goto AuthorizeEchoConnection page through menu, it should display like following, which demonstrate how a signalR persistent connection works

	
	    SignalR Persistent Connection.
	    Only an authenticated user can connect to this Persistent Connection.
	    •8/29/2013 17:22 stateChanged: disconnected => connecting
	    •8/29/2013 17:22 starting
	    •8/29/2013 17:22 stateChanged: connecting => connected
	    •8/29/2013 17:22 received: Welcome user!
	    •8/29/2013 17:22 start.done
	    •8/29/2013 17:22 transport=webSockets
	    •8/29/2013 17:22 received: sending to AuthorizeEchoConnection


7. Goto AuthorizeEchoHub page through menu, it should display like following, which demonstrate how a signalR hub connection works
	
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
	
JavaScript Client walkthrough
--
1. In project JavaScriptClient, browse AuthorizeEchoHub.html directly, you will get following, indicating that there are negotiation errors, which actually because we are not authenticated to the web host yet.  Similar error is for AuthorizeEchoConnection page at this time.
	
		SignalR Hub.
		Only an authenticated user can connect to this Hub.
		AuthorizeEchoConnection.html
		AuthorizeEchoHub.html
		•8/29/2013 17:30 stateChanged: disconnected => connecting
		•8/29/2013 17:30 starting
		•8/29/2013 17:30 Error: Message=Error during negotiation request. Stack=undefined Message=Error parsing negotiate response. Stack=undefined Message=Invalid character Stack=SyntaxError: Invalid character at _parseResponse (http://localhost:8080/Scripts/jquery.signalR-2.0.0-rc1.js:335:17) at success (http://localhost:8080/Scripts/jquery.signalR-2.0.0-rc1.js:652:29) at fire (http://localhost:8080/Scripts/jquery-1.8.2.js:974:5) at fireWith (http://localhost:8080/Scripts/jquery-1.8.2.js:1082:7) at done (http://localhost:8080/Scripts/jquery-1.8.2.js:7788:5) at callback (http://localhost:8080/Scripts/jquery-1.8.2.js:8500:8)
		•8/29/2013 17:30 start.fail Error: Error during negotiation request.
		•8/29/2013 17:30 disconnected
		•8/29/2013 17:30 stateChanged: connecting => disconnected
	
2. browse to Index.html, login with  User 'user' with Password 'password'
	
3. Go back to AuthorizeEchoHub and AuthorizeEchoConnection page through the link, we should no longer see error message anymore.

CSharpClient walkthrough
--
1. In a command prompt, go to CookieAuthenticationSample\CSharpClient\bin\Debug folder
2. Run CSharpClient.exe
3. Examine result, it should show detailed output of how authentication and signalR connections are processed

SelfHost walkthrough
--
1. Stop the web host site since the web host also uses port 8080
2. In a new command prompt, go to CookieAuthenticationSample\SelfHost\bin\Debug folder
3. Run SelfHost.exe
4. Repeat JavaScript Client walkthrough and CSharpClient walkthrough

Code walkthrough
==
SelfHost\Connections\AuthorizeEchoConnection.cs
-
AuthorizeEchoConnection class inherits PersistentConnection and make sure override AuthorizeRequest to implement SignalR authorization for persistent connection 

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
Attribute Authorize (Microsoft.AspNet.SignalR.AuthorizeAttribute) can be used to authorize hubs

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
We use Owin host package to create our console process, which uses WebApp.Start to initiate the self host and listen to locahost:8080.

    class Program
    {
        static void Main(string[] args)
        {
            using (WebApp.Start<Startup>("http://localhost:8080/"))
            {
                Console.WriteLine("Server running at http://localhost:8080/");
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

            var options = new CookieAuthenticationOptions()
            {
                AuthenticationType = CookieAuthenticationDefaults.AuthenticationType,
                LoginPath = CookieAuthenticationDefaults.LoginPath,
                LogoutPath = CookieAuthenticationDefaults.LogoutPath,
            };

            app.UseCookieAuthentication(options);

We insert our middle ware to the OWIN pipe line to intercept login/logout calls and determine authentication.

            app.Use((context, next) =>
            {
                if(context.Request.Path.Contains(options.LoginPath))
                {
                    if (context.Request.Method == "GET")
                    {
                        byte[] bytes = Encoding.UTF8.GetBytes("<input name=\"__RequestVerificationToken\" type=\"hidden\" value=\"0\" />");
                        context.Response.ContentLength = bytes.LongLength;
                        context.Response.ContentType = "text/html";
                        context.Response.Body.Write(bytes, 0, bytes.Length);
                        return Task.FromResult<object>(null);
                    }
                    else
                    {
                        var form = context.Request.ReadFormAsync().Result;
                        var userName = form.Get("UserName");
                        var password = form.Get("Password");

SelfHost/Scripts/Common.js
--
We use Javascript code to perform get login form and post our login cross domain for JavaScriptClient index.html login form. 

	function updateLoginForm() {
	    $.ajax({
	        url: "http://localhost:8080/Account/Login",
	        type: "GET",
	        xhrFields: { withCredentials: true },        
	        success: function (content) {
	            writeLine("login.get.done");
	            var requestVerificationToken = $("input[name='__RequestVerificationToken']", $(content)).val();
	            var requestVerificationTokenField = $("[name=__RequestVerificationToken]");
	            requestVerificationTokenField.val(requestVerificationToken);
	
	            $("#loginButton").removeAttr('disabled');
	        },
	        error: function (error) {
	            writeError("login.get.fail " + error);
	        }
	    });
	}
	
	function postLoginForm() {
	    $.ajax({
	        url: "http://localhost:8080/Account/Login",
	        type: "POST",
	        data: $("#loginForm").serialize(),
	        xhrFields: { withCredentials: true },
	        success: function (content) {
	            writeLine("login.post.done");
	            var requestVerificationToken = $("input[name='__RequestVerificationToken']", $(content)).val();
	
	            var loginPage = $("#loginPage");
	            var contentPage = $("#contentPage");
	
	            loginPage.hide();
	            contentPage.show();
	        },
	        error: function (error) {
	            writeError("login.post.fail " + error);
	        }
	    });
	}

SelfHost\Scripts\AuthorizeEchoConnection.js and AuthorizeEchoHub.js
--
These 2 JavaScipt files defines the SignalR operation and events, including connection, disconnection, reconnect, stateChanged events.


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

RunPersistentConnection and RunHub function demonstrates how to use the cookieContainer to run authenticated signalR functions


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

Summary
==
This sample solution demos how we can make OWIN, SignalR, MVC, Authentication on different platforms to work together.  

In real world applications, if many different different kind of clients wants to authorize to the server (e.g. windows store, windows phone, web page etc.), the server might be written using web API purely for authentication.  VS2013 SPA template shows a perfect example on how to do that using OWIN and WebAPI. Similar code can be written to make SignalR work with authentication in this kind situation as well. 

