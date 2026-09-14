namespace Backend.Models;

public class VisitorStatisticDto
{
    public int ActiveTotal { get; set; }
    public int ActiveBots { get; set; }
    public int ActiveGuests { get; set; }
    public int Today { get; set; }
    public int ThisMonth { get; set; }
    public int Total { get; set; }
}
