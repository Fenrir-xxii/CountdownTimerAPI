namespace WebApplication7_CountdownTimerAPI.Models;

public class CountdownRecord
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string DurationPlanned { get; set; }
    public string DurationPerformed { get; set; }
    public virtual User User { get; set; }
}
