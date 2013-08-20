using Common.Connections;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SelfHost
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var options = new CookieAuthenticationOptions();
            options.AuthenticationType = CookieAuthenticationDefaults.AuthenticationType;
            options.LoginPath = CookieAuthenticationDefaults.LoginPath;
            options.LogoutPath = CookieAuthenticationDefaults.LogoutPath;            

            app.UseCookieAuthentication(options);
            app.UseStaticFiles();
            app.MapConnection<AuthorizeEchoConnection>("/echo");
            app.MapHubs();
            app.Use((context, next) =>
            {
                if(context.Request.Path.Value.Contains(options.LoginPath.Value))
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
                else if (context.Request.Path.Value.Contains(options.LogoutPath.Value))
                {
                    context.Authentication.SignOut(options.AuthenticationType);
                    return Task.FromResult<object>(null);
                }

                return next.Invoke();
            });
        }
    }
}
