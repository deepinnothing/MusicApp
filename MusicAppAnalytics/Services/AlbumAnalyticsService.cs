using System.Collections.Concurrent;
using MusicAppAPI.Models;

namespace MusicAppAnalytics.Services;

public class AlbumAnalyticsService
{
    private readonly ConcurrentDictionary<string, AlbumStats> _albumStats = new();
    
    public void RecordView(AlbumViewedMessage message)
    {
        AlbumStats stats = _albumStats.GetOrAdd(message.AlbumId, _ => new AlbumStats
        {
            AlbumId = message.AlbumId,
            AlbumTitle = message.AlbumTitle,
            AlbumArtist = message.AlbumArtist
        });

        stats.ViewCount++;
        stats.LastViewedAt = message.ViewedAt;
        stats.Sources.Add(message.Source);
    }

    public IEnumerable<AlbumStats> GetTopAlbums(int count = 10)
    {
        return _albumStats.Values
            .OrderByDescending(a => a.ViewCount)
            .Take(count)
            .ToList();
    }
}

public class AlbumStats
{
    public required string AlbumId { get; set; }
    public required string AlbumTitle { get; set; }
    public required string AlbumArtist { get; set; }
    public int ViewCount { get; set; }
    public DateTime LastViewedAt { get; set; }
    public HashSet<string> Sources { get; } = [];
}