namespace WebApplication7_CountdownTimerAPI.Models.Requests;

public class AddCountdownRequest
{
    public string StartTime { get; set; }
    public string EndTime { get; set; }
    public string DurationPlanned { get; set; }
    public string DurationPerformed { get; set; }
}
