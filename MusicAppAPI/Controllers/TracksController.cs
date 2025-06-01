using EasyNetQ;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : ControllerBase
{
    private readonly IMongoDatabase _database;
    private readonly IBus _rabbitMQBus;

    public TracksController(IMongoDatabase database, IBus rabbitMQBus)
    {
        _database = database;
        _rabbitMQBus = rabbitMQBus;
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Track>>> SearchTracks(string query)
    {
        try
        {
            IMongoCollection<Track>? tracksCollection = _database.GetCollection<Track>("tracks");
            // Search by titles and artists
            FilterDefinition<Track>? filter = Builders<Track>.Filter.Or(
                Builders<Track>.Filter.Regex("title", new BsonRegularExpression(query, "i")),
                Builders<Track>.Filter.Regex("artist", new BsonRegularExpression(query, "i")));

            return await tracksCollection.Find(filter).ToListAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<Track>>> GetAllTracks()
    {
        try
        {
            IMongoCollection<Track>? tracksCollection = _database.GetCollection<Track>("tracks");
            // An empty filter to find all documents in the collection
            FilterDefinition<Track>? filter = Builders<Track>.Filter.Empty;

            List<Track>? tracks = await tracksCollection.Find(filter).ToListAsync();

            return Ok(tracks);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpPost("{id}/upload")]
    public async Task<ActionResult> UploadFile(string id, IFormFile file)
    {
        try
        {
            if (file.Length == 0 || Path.GetExtension(file.FileName).ToLower() != ".flac")
                return StatusCode(StatusCodes.Status400BadRequest);

            string uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "assets/audio");
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            string fileName = id + ".flac";

            string filePath = Path.Combine(uploadPath, fileName);
            using (FileStream fs = new(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            return StatusCode(StatusCodes.Status201Created);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> DownloadTrack(string id, [FromQuery] string? title, [FromQuery] string? artist)
    {
        try
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "assets/audio", id + ".flac");
            if (!System.IO.File.Exists(filePath)) return StatusCode(StatusCodes.Status404NotFound);
            
            // Adding title and artist in the query is optional but makes the file's name look appropriate
            string fileName = id + ".flac";
            if (artist != null && title != null)
                fileName = $"{artist} - {title}.flac";
            
            // Send a message to RabbitMQ to track downloads
            try
            {
                TrackDownloadedMessage message = new()
                {
                    TrackId = id,
                    TrackTitle = title,
                    TrackArtist = artist,
                    DownloadedAt = DateTime.UtcNow,
                    Source = $"{Request.HttpContext.Connection.RemoteIpAddress}:{Request.HttpContext.Connection.RemotePort}"
                };

                await _rabbitMQBus.PubSub.PublishAsync(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
            
            // Return the response even if RabbitMQ is down
            FileStream stream = new(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, "audio/flac", fileName);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
}