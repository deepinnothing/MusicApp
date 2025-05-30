using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : ControllerBase
{
    private readonly IMongoDatabase _database;

    public TracksController(IMongoDatabase database)
    {
        _database = database;
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
}