using Microsoft.AspNet.SignalR.Client;
using Microsoft.AspNet.SignalR.Client.Transports;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CSharpClient
{
    class Program
    {
        static void Main(string[] args)
        {
            string url = "http://localhost.fiddler:8080/";

            Program program = new Program();
            program.RunAsync(url).Wait();
        }

        private TextWriter _traceWriter = Console.Out;

        private async Task RunAsync(string url)
        {
            HttpClientHandler handler = new HttpClientHandler();
            handler.CookieContainer = new CookieContainer();

            using (var httpClient = new HttpClient(handler))
            {
                var response = await httpClient.GetAsync(url + "Account/Login");
                _traceWriter.WriteLine("Response.StatusCode: " + response.StatusCode);
                var content = await response.Content.ReadAsStringAsync();
                var requestVerificationToken = ParseRequestVerificationToken(content);
                content = requestVerificationToken + "&UserName=user&Password=password&RememberMe=false";

                response = await httpClient.PostAsync(url + "Account/Login", new StringContent(content, Encoding.UTF8, "application/x-www-form-urlencoded"));
                _traceWriter.WriteLine("Response.StatusCode: " + response.StatusCode);
                content = await response.Content.ReadAsStringAsync();
                requestVerificationToken = ParseRequestVerificationToken(content);

                var connection = new Connection(url + "echo");
                connection.CookieContainer = handler.CookieContainer;
                connection.TraceWriter = _traceWriter;
                connection.Received += (data) => connection.TraceWriter.WriteLine("Received: " + data);
                connection.Error += (exception) => connection.TraceWriter.WriteLine(string.Format("Error: {0}: {1}" + exception.GetType(), exception.Message));
                connection.TransportConnectTimeout = TimeSpan.FromSeconds(10);
                await connection.Start(new LongPollingTransport());
                await connection.Send("sending to AuthorizeEchoConnection");

                response = await httpClient.PostAsync(url + "Account/LogOff", new StringContent(requestVerificationToken, Encoding.UTF8, "application/x-www-form-urlencoded"));
                response = await httpClient.PostAsync(url + "Account/Logout", new StringContent(requestVerificationToken, Encoding.UTF8, "application/x-www-form-urlencoded"));
                _traceWriter.WriteLine("Response.StatusCode: " + response.StatusCode);

                try
                {
                    await connection.Send("sending must fail because of signout");
                }
                catch(Exception e)
                {
                    Console.WriteLine("sending failed as expected with error: {0}", e);
                }
            }
        }

        private string ParseRequestVerificationToken(string content)
        {
            var startIndex = content.IndexOf("__RequestVerificationToken");
            content = content.Substring(startIndex, content.IndexOf("\" />", startIndex) - startIndex);
            content = content.Replace("\" type=\"hidden\" value=\"", "=");
            return content;
        }
    }
}
