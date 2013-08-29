using System;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Common.Connections;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security.Cookies;
using Owin;

namespace SelfHost
{
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

                        if(userName != "user" || password != "password")
                        {
                            context.Authentication.Challenge(options.AuthenticationType);
                            return Task.FromResult<object>(null);
                        }

                        var identity = new ClaimsIdentity(options.AuthenticationType);
                        identity.AddClaim(new Claim(ClaimTypes.Name, userName));
                        context.Authentication.SignIn(identity);

                        byte[] bytes = Encoding.UTF8.GetBytes("<input name=\"__RequestVerificationToken\" type=\"hidden\" value=\"0\" />");
                        context.Response.ContentLength = bytes.LongLength;
                        context.Response.ContentType = "text/html";
                        context.Response.Body.Write(bytes, 0, bytes.Length);
                        return Task.FromResult<object>(null);
                    }
                }
                else if (context.Request.Path.Contains(options.LogoutPath))
                {
                    context.Authentication.SignOut(options.AuthenticationType);
                    return Task.FromResult<object>(null);
                }

                return next.Invoke();
            });

            app.MapSignalR<AuthorizeEchoConnection>("/echo");
            app.MapSignalR();
        }
    }
}
