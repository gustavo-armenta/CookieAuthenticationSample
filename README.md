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

Summary
==
In real world applications, if many different different kind of clients wants to authorize to the server (e.g. windows store, windows phone, web page etc.), the server might be written using web API purely for authentication.  VS2013 SPA template shows a perfect example on how to do that using OWIN and WebAPI. Similar code can be written to make SignalR work with authentication in this kind situation as well. 

