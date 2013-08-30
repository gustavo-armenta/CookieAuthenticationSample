using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Common.Connections;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Owin;

namespace SelfHost
{
    public class Startup
    {
        static byte[] loginForm;

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
           
            app.Use((context, next) =>
            {
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

            app.MapSignalR<AuthorizeEchoConnection>("/echo");
            app.MapSignalR();
        }

        private bool ValidateUserCredentials(string userName, string password)
        {
            return userName == "user" && password == "password";
        }
    }
}
