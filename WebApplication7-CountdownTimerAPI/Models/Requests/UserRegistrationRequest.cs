using System.ComponentModel.DataAnnotations;

namespace WebApplication7_CountdownTimerAPI.Models.Requests;

public class UserRegistrationRequest
{
    [Required]
    public string UserName { get; set; }
    [Required]
    public string Phone { get; set; }
    [Required]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }


}
