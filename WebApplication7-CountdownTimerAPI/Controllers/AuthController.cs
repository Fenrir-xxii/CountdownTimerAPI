using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication7_CountdownTimerAPI.Models.Configuration;
using WebApplication7_CountdownTimerAPI.Models.Requests;
using WebApplication7_CountdownTimerAPI.Models.Responses;
using WebApplication7_CountdownTimerAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace WebApplication7_CountdownTimerAPI.Controllers;

[ApiController]
[Route("api/auth/")]

public class AuthController : ControllerBase
{
    private readonly ILogger<TimeHistoryController> _logger;
    private readonly UserManager<User> _userManager;
    private readonly JwtConfig _jwtConfig;
    private readonly SignInManager<User> _signInManager;
    public AuthController(ILogger<TimeHistoryController> logger, UserManager<User> userManager, IOptionsMonitor<JwtConfig> options, SignInManager<User> signInManager)
    {
        _logger = logger;
        _userManager = userManager;
        _jwtConfig = options.CurrentValue;
        _signInManager = signInManager;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationRequest register)
    {
        if (!ModelState.IsValid) return BadRequest(new AuthResponse
        {
            Success = false,
            Error = "Bad request",
            Token = String.Empty
        });
        var existingUser = await _userManager.FindByEmailAsync(register.Email);
        if (existingUser != null)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Error = "User already exist",
                Token = String.Empty
            });
        }
        var newUser = new User
        {
            Email = register.Email,
            UserName = register.UserName,
            PhoneNumber = register.Phone
        };
        var isCreated = await _userManager.CreateAsync(newUser, register.Password);
        if (!isCreated.Succeeded)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Error = String.Join(" ", isCreated.Errors.Select(x => x.Description).ToList()),
                Token = String.Empty
            });
        }
        var jwtToken = GenerateJwtToken(newUser);
        return Ok(new AuthResponse
        {
            Success = true,
            Error = String.Empty,
            Token = jwtToken
        });
    }
    private string GenerateJwtToken(IdentityUser<int> user)
    {
        var jwtHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);
        var jwtDecsriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("Id", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            }),
            Expires = DateTime.Now.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = jwtHandler.CreateToken(jwtDecsriptor);
        var jwtToken = jwtHandler.WriteToken(token);

        return jwtToken;
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest user)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Error = "Bad request",
                Token = String.Empty
            });
        }

        var existingUser = await _userManager.FindByEmailAsync(user.Email);
        if (existingUser == null)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Error = "User not found",
                Token = String.Empty
            });
        }
        var isValid = await _userManager.CheckPasswordAsync(existingUser, user.Password);

        if (!isValid)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Error = "Wrong password",
                Token = String.Empty
            });
        }

        //var signInResult = await _signInManager.PasswordSignInAsync(existingUser, user.Password, true, false);
        //if (!signInResult.Succeeded)
        //{
        //    return BadRequest(new AuthResponse
        //    {
        //        Success = false,
        //        Error = "Sign in failed",
        //        Token = String.Empty
        //    });
        //}
        //if (User.Identity.IsAuthenticated)
        //{
        //    Console.WriteLine("AUTH: IsAuthenticated");
        //}
        //else
        //{
        //    Console.WriteLine("AUTH: Is not Authenticated");
        //}
        var jwtToken = GenerateJwtToken(existingUser);
        return Ok(new AuthResponse
        {
            Success = true,
            Error = String.Empty,
            Token = jwtToken
        });
    }
    [Authorize]
    [HttpGet("check", Name = "GetTokenCheck")]
    public async Task<object> GetTokenCheck()
    {
        var newUser = new UserData { Success = false };
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId != null)
        {
            newUser = new UserData
            {
                UserName = userId,
                //Phone = _user.PhoneNumber,
                //Email = _user.Email,
                Success = true
            };
        }
        return newUser;
    }
}
