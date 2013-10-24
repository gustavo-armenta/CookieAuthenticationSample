using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebHost.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }


        [Authorize]
        public ActionResult AuthorizeEchoConnection()
        {
            ViewBag.Message = "Only an authenticated user can connect to this Persistent Connection.";

            return View();
        }

        [Authorize]
        public ActionResult AuthorizeEchoHub()
        {
            ViewBag.Message = "Only an authenticated user can connect to this Hub.";

            return View();
        }
    }
}