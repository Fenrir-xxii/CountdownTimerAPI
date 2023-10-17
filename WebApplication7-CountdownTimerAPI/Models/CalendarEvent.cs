namespace WebApplication7_CountdownTimerAPI.Models;

public class CalendarEvent
{
    public int Id { get; set; }
    public string Title { get; set; }
    public DateTime EventDate { get; set; }
    public virtual User User { get; set; }
}
