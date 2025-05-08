using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Controllers;

[ApiController]
[Route("api")]
public class StoreController : ControllerBase
{
    private readonly IMongoDatabase _database;

    public StoreController(IMongoDatabase database)
    {
        _database = database;
    }

    [Authorize(Roles = "admin")]
    [HttpPost("albums")]
    public async Task<ActionResult> AddNewAlbum([FromBody] Album album)
    {
        try
        {
            if (album.Title is null) return StatusCode(StatusCodes.Status400BadRequest, "Title must be specified.");
            if (album.Artist is null) return StatusCode(StatusCodes.Status400BadRequest, "Artist must be specified.");
            if (album.Year is null) return StatusCode(StatusCodes.Status400BadRequest, "Year must be specified.");
            if (album.Tracks == null || album.Tracks.Count == 0)
                return StatusCode(StatusCodes.Status400BadRequest, "Album must have at least one track.");
            
            // Store tracks in a separate collection
            IMongoCollection<Track>? tracksCollection = _database.GetCollection<Track>("tracks");
            await tracksCollection.InsertManyAsync(album.Tracks);
            
            // Only track ids are stored with the album in the database
            album.TrackIds = album.Tracks.Select(t => t.Id!).ToList();
            album.Tracks = null;
            
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            await albumsCollection.InsertOneAsync(album);
            return Created($"api/albums/{album.Id}", null);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("albums")]
    public async Task<ActionResult<List<Album>>> GetAllAlbums()
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album>? filter = Builders<Album>.Filter.Empty;

            // When requesting all the albums, tracks are usually not needed and create too much boilerplate
            ProjectionDefinition<Album>? projection = Builders<Album>.Projection.Exclude("tracks");
            return Ok(await albumsCollection.Find(filter).Project<Album>(projection).ToListAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpPatch("albums/{id}")]
    public async Task<ActionResult> ModifyAlbum(string id, [FromBody] Album albumUpdate)
    {
        try
        {
            // Fetch existing album to get trackIds
            IMongoCollection<Album> albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album> filter = Builders<Album>.Filter.Eq(t => t.Id, id);
            Album? album = await albumsCollection.Find(filter).FirstOrDefaultAsync();
            if (album == null) return StatusCode(StatusCodes.Status404NotFound);
            
            List<UpdateDefinition<Album>> updates = [];

            if (!string.IsNullOrEmpty(albumUpdate.Title))
                updates.Add(Builders<Album>.Update.Set("title", albumUpdate.Title));

            if (!string.IsNullOrEmpty(albumUpdate.Artist))
                updates.Add(Builders<Album>.Update.Set("artist", albumUpdate.Artist));

            if (albumUpdate.Year.HasValue)
                updates.Add(Builders<Album>.Update.Set("year", albumUpdate.Year.Value));

            if (albumUpdate.Tracks != null)
            {
                if (albumUpdate.Tracks == null || albumUpdate.Tracks.Count == 0)
                    return StatusCode(StatusCodes.Status400BadRequest, "Album must have at least one track.");
                
                // Validate tracks
                if (albumUpdate.Tracks.Any(t => t.Title == null || t.Length == null))
                    return StatusCode(StatusCodes.Status400BadRequest, "Some tracks are missing title and or length.");
                if (albumUpdate.Tracks.Any(t => t.Nr == null))
                    for (int i = 0; i < albumUpdate.Tracks.Count; i++)
                        albumUpdate.Tracks[i].Nr = i + 1;
                foreach (Track track in albumUpdate.Tracks)
                {
                    track.Artist ??= album.Artist;
                    track.AlbumTitle = album.Title;
                    track.AlbumId = id;
                    track.Year ??= album.Year;
                }
                
                IMongoCollection<Track> tracksCollection = _database.GetCollection<Track>("tracks");
                
                // Compare tracks to identify removals
                List<string> existingTrackIds = album.TrackIds!;
                List<string> updatedTrackIds = albumUpdate.Tracks.Where(t => t.Id != null).Select(t => t.Id!).ToList();
                List<string> tracksToRemove = existingTrackIds.Except(updatedTrackIds).ToList();
                
                // Use bulk write for tracks for better performance
                List<WriteModel<Track>> bulkTrackOperations = [];
                
                // New tracks (id is null)
                List<Track> newTracks = albumUpdate.Tracks.Where(t => t.Id is null).ToList();
                foreach (Track newTrack in newTracks)
                    bulkTrackOperations.Add(new InsertOneModel<Track>(newTrack));
                
                // Existing tracks (id is non-null)
                List<Track> existingTracks = albumUpdate.Tracks.Where(t => t.Id != null).ToList();
                foreach (Track track in existingTracks)
                    bulkTrackOperations.Add(new ReplaceOneModel<Track>(
                        Builders<Track>.Filter.Eq(t => t.Id, track.Id), track));
                
                // Tracks to remove
                if (tracksToRemove.Count != 0)
                    bulkTrackOperations.Add(new DeleteManyModel<Track>(
                        Builders<Track>.Filter.In(t => t.Id, tracksToRemove)));
                
                if (bulkTrackOperations.Count != 0)
                    await tracksCollection.BulkWriteAsync(bulkTrackOperations);
                
                updates.Add(Builders<Album>.Update.Set("tracks", albumUpdate.Tracks.Select(t => t.Id!).ToList()));
            }
            
            if (!string.IsNullOrEmpty(albumUpdate.CoverUrl))
                updates.Add(Builders<Album>.Update.Set("coverUrl", albumUpdate.CoverUrl));
            
            if (!string.IsNullOrEmpty(albumUpdate.Label))
                updates.Add(Builders<Album>.Update.Set("label", albumUpdate.Label));

            if (updates.Count == 0)
                return StatusCode(StatusCodes.Status400BadRequest, "No fields provided to update.");
            
            UpdateDefinition<Album>? updateDefinition = Builders<Album>.Update.Combine(updates);
            await albumsCollection.UpdateOneAsync(filter, updateDefinition);

            return StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("albums/{id}")]
    public async Task<ActionResult> DeleteAlbum(string id)
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album>? filter = Builders<Album>.Filter.Eq(a => a.Id, id);
            
            DeleteResult result = await albumsCollection.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return StatusCode(StatusCodes.Status404NotFound);
            
            // Remove all tracks of the album as well
            IMongoCollection<Track>? tracksCollection = _database.GetCollection<Track>("tracks");
            await tracksCollection.DeleteManyAsync(Builders<Track>.Filter.Eq(t => t.AlbumId, id));
            
            return StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("albums/{id}")]
    public async Task<ActionResult<Album>> GetAlbumById(string id)
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album>? filter = Builders<Album>.Filter.Eq(t => t.Id, id);

            // When a single album is requested, it's better to return tracks details as well, not just ids
            var album = BsonSerializer.Deserialize<Album?>(await albumsCollection.Aggregate().Match(filter)
                .Lookup("tracks", "tracks", "_id", "realTracks").FirstOrDefaultAsync());

            if (album is null) return StatusCode(StatusCodes.Status404NotFound);

            // These fields are useless in the context of an album
            foreach (Track track in album.Tracks!)
            {
                track.AlbumTitle = null;
                track.AlbumId = null;
            }

            return Ok(album);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("albums/search")]
    public async Task<ActionResult<List<Album>>> SearchAlbums(string query)
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            // Search by titles and artists
            FilterDefinition<Album>? filter = Builders<Album>.Filter.Or(
                Builders<Album>.Filter.Regex("title", new BsonRegularExpression(query, "i")),
                Builders<Album>.Filter.Regex("artist", new BsonRegularExpression(query, "i")));

            // Multiple albums might be returned, and tracks could create too much boilerplate
            ProjectionDefinition<Album>? projection = Builders<Album>.Projection.Exclude("tracks");
            return Ok(await albumsCollection.Find(filter).Project<Album>(projection).ToListAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
    
    [HttpGet("tracks/search")]
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
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
    
    [HttpGet("tracks")]
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
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}