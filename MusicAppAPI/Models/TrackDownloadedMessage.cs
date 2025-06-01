namespace MusicAppAPI.Models;

public class TrackDownloadedMessage
{
    public required string TrackId { get; set; }
    public DateTime DownloadedAt { get; set; }
    public required string Source { get; set; }
}