using System.ComponentModel.DataAnnotations;

namespace WebApplication7_CountdownTimerAPI.Models.Requests;

public class UserLoginRequest
{
    [Required]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
}
