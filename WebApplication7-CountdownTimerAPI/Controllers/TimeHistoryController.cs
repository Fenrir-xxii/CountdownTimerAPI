using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace WebApplication7_CountdownTimerAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/timers/")]
public class TimeHistoryController : ControllerBase
{
    private readonly ILogger<TimeHistoryController> _logger;
    public TimeHistoryController(ILogger<TimeHistoryController> logger)
    {
        _logger = logger;
    }
    private List<object> _history = new List<object>
{
     new
        {
            Id=1,
            Title = "new title 1",
            Date = new DateTime()
        },
        new
        {
            Id=2,
            Title = "new title 2",
            Date = new DateTime()
        }
};

    [HttpGet("list", Name = "GetTimerList")]
    public async Task<IList<object>> GetList()
    {
        return _history.ToList();

    }
    [HttpGet("item/{id}", Name = "GetTimer")]
    public async Task<object> GetTimer(int id)
    {
        return _history.FirstOrDefault();
    }
    //[HttpGet("index")]
    //public IActionResult Index()
    //{
    //    return View();
    //}
}
