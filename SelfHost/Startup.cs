using System;
using System.IO;
using System.Net;
using System.Security.Claims;
using Common.Connections;
using Microsoft.Owin.Cors;
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
           
            app.Use(async (context, next) =>
            {
                var redirectUri = context.Request.Query["ReturnUrl"];

                if(context.Request.Path.Contains(options.LoginPath))
                {
                    if (context.Request.Method == "POST")
                    {
                        var form = await context.Request.ReadFormAsync();
                        var userName = form["UserName"];
                        var password = form["Password"];

                        if (!ValidateUserCredentials(userName, password))
                        {
                            var redirect = options.LoginPath;
                            if (!String.IsNullOrEmpty(redirectUri))
                            {
                                redirect += "?ReturnUrl=" + WebUtility.UrlEncode(redirectUri);
                            }

                            context.Response.Redirect(redirect);
                        }

                        var identity = new ClaimsIdentity(options.AuthenticationType);
                        identity.AddClaim(new Claim(ClaimTypes.Name, userName));
                        context.Authentication.SignIn(identity);

                        redirectUri = redirectUri ?? "/index.html";
                        context.Response.Redirect(redirectUri);
                    }
                    else
                    {
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync(loginForm);
                    }
                }
                else if (context.Request.Path.Contains(options.LogoutPath))
                {
                    context.Authentication.SignOut(options.AuthenticationType);
                    redirectUri = redirectUri ?? options.LoginPath;
                    context.Response.Redirect(redirectUri);
                }
                else if (context.Request.User == null || !context.Request.User.Identity.IsAuthenticated)
                {
                    context.Response.Redirect(options.LoginPath);
                }
                else if (context.Request.Path == "/")
                {
                    context.Response.Redirect("/index.html");
                }
                else
                {
                    await next();
                }
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
