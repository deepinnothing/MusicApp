namespace MusicAppAPI.Models;

public class AlbumViewedMessage
{
    public required string AlbumId { get; set; }
    public required string AlbumTitle { get; set; }
    public required string AlbumArtist { get; set; }
    public DateTime ViewedAt { get; set; }
    public required string Source { get; set; }
}