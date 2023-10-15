namespace WebApplication7_CountdownTimerAPI.Models;

public class FavoriteCountdown
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Time { get; set; }
    public virtual User User { get; set; }
}
