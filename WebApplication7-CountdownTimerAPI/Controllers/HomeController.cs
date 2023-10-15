using Microsoft.AspNetCore.Mvc;
using WebApplication7_CountdownTimerAPI.Models;

namespace WebApplication7_CountdownTimerAPI.Controllers;

public class HomeController : Controller
{
    [HttpGet("/")]
    public IActionResult Index()
    {
        //if (User.Identity.IsAuthenticated)
        //{
        //    Console.WriteLine("HOME: IsAuthenticated");
        //}
        //else
        //{
        //    Console.WriteLine("HOME: Is not Authenticated");
        //}
        return View();
    }
}
