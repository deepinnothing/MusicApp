using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly IMongoDatabase _database;

    public LibraryController(IMongoDatabase database)
    {
        _database = database;
    }
    
    public class AlbumIdRequest
    {
        public string albumId { get; set; } = "";
    }
    
    public class TrackIdRequest
    {
        public string trackId { get; set; } = "";
    }
    
    [HttpGet("tracks")]
    public async Task<ActionResult> GetAllTracks()
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get access to the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? userFilter = Builders<User>.Filter.Eq(u => u.Id, userId);
            User? foundUser = await usersCollection.Find(userFilter).FirstOrDefaultAsync();
            if (foundUser == null) return StatusCode(StatusCodes.Status404NotFound);
            
            // User documents only store tracks' ids, so fetch of the track collection is needed
            IMongoCollection<Track>? tracksCollection = _database.GetCollection<Track>("tracks");
            FilterDefinition<Track>? trackFilter = Builders<Track>.Filter.In(t => t.Id, foundUser.LibraryTracks);
            return Ok(await tracksCollection.Find(trackFilter).ToListAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
    
    [HttpPatch("tracks")]
    public async Task<ActionResult> AddTrack([FromBody] string trackId)
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get access to the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            
            // Add track to the user's library by id if it's not already added
            UpdateDefinition<User>? updateDefinition = Builders<User>.Update.AddToSet(u => u.LibraryTracks, trackId);
            UpdateResult? result = await usersCollection.UpdateOneAsync(filter, updateDefinition);
            return result.MatchedCount == 0 ? StatusCode(StatusCodes.Status401Unauthorized) : StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
    
    [HttpDelete("tracks/{trackId}")]
    public async Task<ActionResult> RemoveTrack(string trackId)
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get access to the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            
            // Remove track from the user's library by id
            UpdateDefinition<User>? updateDefinition = Builders<User>.Update.Pull(u => u.LibraryTracks, trackId);
            UpdateResult? result = await usersCollection.UpdateOneAsync(filter, updateDefinition);
            return result.MatchedCount == 0 ? StatusCode(StatusCodes.Status401Unauthorized) : 
                result.ModifiedCount == 0 ? StatusCode(StatusCodes.Status400BadRequest) : 
                StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
    
    [HttpGet("album")]
    public async Task<ActionResult<List<Album>>> GetAllAlbums()
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get access to the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? userFilter = Builders<User>.Filter.Eq(u => u.Id, userId);
            User? foundUser = await usersCollection.Find(userFilter).FirstOrDefaultAsync();
            if (foundUser == null) return StatusCode(StatusCodes.Status404NotFound);
            
            // User documents only store albums' ids, so fetch of the album collection is needed
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album>? albumFilter = Builders<Album>.Filter.In(a => a.Id, foundUser.LibraryAlbums);
            
            // When requesting all the albums, tracks are usually not needed and create too much boilerplate
            ProjectionDefinition<Album>? projection = Builders<Album>.Projection.Exclude("tracks");
            return Ok(await albumsCollection.Find(albumFilter).Project<Album>(projection).ToListAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
    
    [HttpPatch("albums")]
    public async Task<ActionResult> AddAlbum([FromBody] string albumId)
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            
            // Add album to the user's library by id if it's not already added
            UpdateDefinition<User>? updateDefinition = Builders<User>.Update.AddToSet(u => u.LibraryAlbums, albumId);
            UpdateResult? result = await usersCollection.UpdateOneAsync(filter, updateDefinition);
            return result.MatchedCount == 0 ? StatusCode(StatusCodes.Status401Unauthorized) 
                : StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
    
    [HttpDelete("albums/{albumId}")]
    public async Task<ActionResult> RemoveAlbum(string albumId)
    {
        try
        {
            // Get user id from the JWT token
            string? userId = HttpContext.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return StatusCode(StatusCodes.Status401Unauthorized);
            
            // Find the user in the database to get the user's library
            IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            
            // Remove album from the user's library by id
            UpdateDefinition<User>? updateDefinition = Builders<User>.Update.Pull(u => u.LibraryAlbums, albumId);
            UpdateResult? result = await usersCollection.UpdateOneAsync(filter, updateDefinition);
            return result.MatchedCount == 0 ? StatusCode(StatusCodes.Status401Unauthorized) : 
                result.ModifiedCount == 0 ? StatusCode(StatusCodes.Status400BadRequest) : 
                StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
}
