using System.Collections.Concurrent;
using MusicAppAPI.Models;

namespace MusicAppAnalytics.Services;

public class TrackAnalyticsService
{
    private readonly ConcurrentDictionary<string, TrackStats> _trackStats = new();
    
    public void RecordDownload(TrackDownloadedMessage message)
    {
        TrackStats stats = _trackStats.GetOrAdd(message.TrackId, _ => new TrackStats
        {
            TrackId = message.TrackId
        });

        if (message.TrackTitle != null) stats.TrackTitle = message.TrackTitle;
        if (message.TrackArtist != null) stats.TrackArtist = message.TrackArtist;
        
        stats.DownloadCount++;
        stats.LastDownloadedAt = message.DownloadedAt;
        stats.Sources.Add(message.Source);
    }

    public IEnumerable<TrackStats> GetTopTracks(int count = 100)
    {
        return _trackStats.Values
            .OrderByDescending(t => t.DownloadCount)
            .Take(count)
            .ToList();
    }
    
    public IEnumerable<TrackStats> GetTopTracksByArtist(string artist, int count = 10)
    {
        return _trackStats.Values
            .Where(t => t.TrackArtist == artist)
            .OrderByDescending(t => t.DownloadCount)
            .Take(count)
            .ToList();
    }
}

public class TrackStats
{
    public required string TrackId { get; set; }
    public string? TrackTitle { get; set; }
    public string? TrackArtist { get; set; }
    public int DownloadCount { get; set; }
    public DateTime LastDownloadedAt { get; set; }
    public HashSet<string> Sources { get; } = [];
}