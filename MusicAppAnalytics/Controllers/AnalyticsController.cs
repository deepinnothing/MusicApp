using Microsoft.AspNetCore.Mvc;
using MusicAppAnalytics.Services;

namespace MusicAppAnalytics.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AlbumAnalyticsService _albumAnalyticsService;
    private readonly TrackAnalyticsService _trackAnalyticsService;

    public AnalyticsController(AlbumAnalyticsService albumAnalyticsService, TrackAnalyticsService trackAnalyticsService)
    {
        _albumAnalyticsService = albumAnalyticsService;
        _trackAnalyticsService = trackAnalyticsService;
    }

    [HttpGet("top-albums")]
    public ActionResult GetTopAlbums([FromQuery] int count = 10)
    {
        return Ok(_albumAnalyticsService.GetTopAlbums(count));
    }
    
    [HttpGet("top-tracks")]
    public ActionResult GetTopTracks([FromQuery] string? artist, [FromQuery] int count = 10)
    {
        return Ok(artist is null 
            ? _trackAnalyticsService.GetTopTracks(count) 
            : _trackAnalyticsService.GetTopTracksByArtist(artist, count));
    }
}