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
    private async Task<List<CountdownRecord>> GetRecords(int count)
    {
        var user = await GetCurrentUser();
        if(user == null)
        {
            return new List<CountdownRecord>();
        }

        return await _context.CountdownRecords.Where(x => x.User.Id == user.Id).OrderByDescending(x => x.Id).Take(count).ToListAsync();
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
    private async Task<List<CalendarEvent>> GetCalendarEvents()
    {
        var user = await GetCurrentUser();
        if (user == null)
        {
            return new List<CalendarEvent>();
        }
        return await _context.CalendarEvents.Where(x => x.User.Id == user.Id).OrderBy(x => x.EventDate).ToListAsync();
    }

    [HttpGet("records", Name = "GetTimerList")]
    public async Task<List<CountdownRecord>> GetList()
    {
        return await GetRecords(5);
    }
    [HttpGet("fav", Name = "GetFavoriteList")]
    public async Task<List<FavoriteCountdown>> GetFavoriteList()
    {
        return await GetFavoriteCountdowns();

    }
    [HttpGet("events", Name = "GetEventList")]
    public async Task<List<CalendarEvent>> GetCalendarEventList()
    {
        return await GetCalendarEvents();

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
        if(user == null)
        {
            return BadRequest(new AddCountdownResponse
            {
                Success = false,
                Error = "User not found"
            });
        }
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
    [HttpPost("add-favorite")]
    public async Task<IActionResult> AddFavoriteCountdown([FromBody] AddFavoriteCountdownRequest request)
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
        if (user == null)
        {
            return BadRequest(new AddCountdownResponse
            {
                Success = false,
                Error = "User not found"
            });
        }
        var favorite = new FavoriteCountdown
        {
            Title = request.Title,
            Time = request.Time,
            User = user
        };

        _context.Add(favorite);
        _context.SaveChanges();

        return Ok(new AddCountdownResponse
        {
            Success = true,
            Error = string.Empty
        });
    }
    [HttpPost("del-fav/{id}")]
    public async Task<IActionResult> DeleteFavorite(int id)
    {
        var favorite = await _context.FavoriteCountdowns.FirstOrDefaultAsync(x => x.Id == id);
        if(favorite == null)
        {
            return Ok(new {Success = false});
        }
        _context.Remove(favorite);
        _context.SaveChanges();
        return Ok(new { Success = true });
    }
    [HttpPost("add-event")]
    public async Task<IActionResult> AddCalendartEvent([FromBody] AddCalendarEventRequest request)
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
        if (user == null)
        {
            return BadRequest(new AddCountdownResponse
            {
                Success = false,
                Error = "User not found"
            });
        }
        var calendarEvent = new CalendarEvent
        {
            Title = request.Title,
            EventDate = DateTime.Parse(request.EventDate),
            User = user
        };

        _context.Add(calendarEvent);
        _context.SaveChanges();

        return Ok(new AddCountdownResponse
        {
            Success = true,
            Error = string.Empty
        });
    }
    //[HttpGet("authcheck", Name = "GetTokenCheck")]
    //public async Task<object> GetTokenCheck()
    //{
    //    return true; //
    //}
}
