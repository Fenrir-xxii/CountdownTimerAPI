using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication7_CountdownTimerAPI.Models;
using WebApplication7_CountdownTimerAPI.Models.Requests;
using WebApplication7_CountdownTimerAPI.Models.Responses;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WebApplication7_CountdownTimerAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/timers/")]
public class TimeHistoryController : ControllerBase
{
    private readonly ILogger<TimeHistoryController> _logger;
    private readonly SiteDbContext _context;
    private readonly UserManager<User> _userManager;
    public TimeHistoryController(ILogger<TimeHistoryController> logger, SiteDbContext siteContext, UserManager<User> userManager)
    {
        _logger = logger;
        _context = siteContext;
        _userManager = userManager;
    }
    //    private List<object> _history = new List<object>
    //{
    //     new
    //        {
    //            Id=1,
    //            Title = "new title 1",
    //            Span = new TimeSpan(16, 30,0)
    //        },
    //        new
    //        {
    //            Id=2,
    //            Title = "new title 2",
    //            Span = new TimeSpan(21, 20,0 )
    //        }
    //};
    private async Task<User?> GetCurrentUser()
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(userId != null)
        {
            return await _userManager.FindByEmailAsync(userId);
        }
        return null;
    }
    private async Task<List<CountdownRecord>> GetRecords()
    {
        var user = await GetCurrentUser();
        if(user == null)
        {
            return new List<CountdownRecord>();
        }
        return await _context.CountdownRecords.Where(x => x.User.Id == user.Id).ToListAsync();
    }
    private async Task<List<FavoriteCountdown>> GetFavoriteCountdowns()
    {
        var user = await GetCurrentUser();
        if (user == null)
        {
            return new List<FavoriteCountdown>();
        }
        return await _context.FavoriteCountdowns.Where(x => x.User.Id == user.Id).ToListAsync();
    }

    [HttpGet("records", Name = "GetTimerList")]
    public async Task<List<CountdownRecord>> GetList()
    {
        return await GetRecords();

    }
    [HttpGet("fav", Name = "GetFavoriteList")]
    public async Task<List<FavoriteCountdown>> GetFavoriteList()
    {
        return await GetFavoriteCountdowns();

    }
    [HttpPost("add-countdown")]
    public async Task<IActionResult> AddCountdownRecord([FromBody] AddCountdownRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AddCountdownResponse
            {
                Success = false,
                Error = "Bad request"
            });
        }
        var user = await GetCurrentUser();
        var countdown = new CountdownRecord
        {
            StartTime = DateTime.Parse(request.StartTime),
            EndTime = DateTime.Parse(request.EndTime),
            DurationPerformed = request.DurationPerformed,
            DurationPlanned = request.DurationPlanned,
            User = user
        };

        _context.Add(countdown);
        _context.SaveChanges();

        return Ok(new AddCountdownResponse
        {
            Success = true,
            Error = string.Empty
        });
    }
    //[HttpGet("item/{id}", Name = "GetTimer")]
    //public async Task<object> GetTimer(int id)
    //{
    //    return _history.FirstOrDefault();
    //}
    //[HttpGet("authcheck", Name = "GetTokenCheck")]
    //public async Task<object> GetTokenCheck()
    //{
    //    return true; //
    //}
}
