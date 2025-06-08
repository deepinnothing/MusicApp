using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumsController : ControllerBase
{
    private readonly IMongoDatabase _database;

    public AlbumsController(IMongoDatabase database)
    {
        _database = database;
    }

    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<ActionResult> AddNewAlbum([FromBody] Album album)
    {
        try
        {
            if (album.Title is null) return StatusCode(StatusCodes.Status400BadRequest, "Title must be specified.");
            if (album.Artist is null) return StatusCode(StatusCodes.Status400BadRequest, "Artist must be specified.");
            if (album.Year is null) return StatusCode(StatusCodes.Status400BadRequest, "Year must be specified.");
            if (album.Tracks == null || album.Tracks.Count == 0)
                return StatusCode(StatusCodes.Status400BadRequest, "Album must have at least one track.");

            // Validate tracks
            if (album.Tracks.Any(t => t.Title == null || t.Length == null))
                return StatusCode(StatusCodes.Status400BadRequest, "Some tracks are missing title and/or length.");
            if (album.Tracks.Any(t => t.Nr == null))
                for (int i = 0; i < album.Tracks.Count; i++)
                    album.Tracks[i].Nr = i + 1;

            // Generate an id if it's not provided
            album.Id ??= ObjectId.GenerateNewId().ToString();

            foreach (Track track in album.Tracks)
            {
                track.Artist ??= album.Artist;
                track.AlbumTitle = album.Title;
                track.AlbumId = album.Id;
                track.Year ??= album.Year;
            }

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
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet]
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
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAlbum(string id, [FromBody] Album albumUpdate)
    {
        try
        {
            // Fetch existing album to get trackIds
            IMongoCollection<Album> albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album> filter = Builders<Album>.Filter.Eq(a => a.Id, id);
            Album? album = await albumsCollection.Find(filter).FirstOrDefaultAsync();
            if (album == null) return StatusCode(StatusCodes.Status404NotFound);

            if (album.Title is null) return StatusCode(StatusCodes.Status400BadRequest, "Title must be specified.");
            if (album.Artist is null) return StatusCode(StatusCodes.Status400BadRequest, "Artist must be specified.");
            if (album.Year is null) return StatusCode(StatusCodes.Status400BadRequest, "Year must be specified.");
            if (album.Tracks == null || album.Tracks.Count == 0)
                return StatusCode(StatusCodes.Status400BadRequest, "Album must have at least one track.");

            // Validate tracks
            if (albumUpdate.Tracks!.Any(t => t.Title == null || t.Length == null))
                return StatusCode(StatusCodes.Status400BadRequest, "Some tracks are missing title and/or length.");
            if (albumUpdate.Tracks!.Any(t => t.Nr == null))
                for (int i = 0; i < albumUpdate.Tracks!.Count; i++)
                    albumUpdate.Tracks[i].Nr = i + 1;
            foreach (Track track in albumUpdate.Tracks!)
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
            
            // Only track ids are stored with the album in the database
            album.TrackIds = album.Tracks.Select(t => t.Id!).ToList();
            album.Tracks = null;
            
            await albumsCollection.ReplaceOneAsync(filter, albumUpdate);

            return StatusCode(StatusCodes.Status200OK);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
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
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Album>> GetAlbumById(string id)
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
            FilterDefinition<Album> filter;
            if (ObjectId.TryParse(id, out ObjectId objectId))
            {
                filter = Builders<Album>.Filter.Or(
                    Builders<Album>.Filter.Eq(t => t.Id, id),
                    Builders<Album>.Filter.Eq("_id", objectId)
                );
            }
            else
            {
                filter = Builders<Album>.Filter.Eq(t => t.Id, id);
            }

            // Use embedded tracks instead of Lookup 
            var album = await albumsCollection.Find(filter).FirstOrDefaultAsync();

            if (album is null) return StatusCode(StatusCodes.Status404NotFound);

            // If no embedded tracks, fallback to separate tracks collection
            if (album.Tracks == null || album.Tracks.Count == 0)
            {
                IMongoCollection<Track> tracksCollection = _database.GetCollection<Track>("tracks");
                var tracks = await tracksCollection.Find(Builders<Track>.Filter.Eq(t => t.AlbumId, id)).ToListAsync();
                album.Tracks = tracks;
            }

            return Ok(album);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Album>>> SearchAlbums(string query)
    {
        try
        {
            IMongoCollection<Album>? albumsCollection = _database.GetCollection<Album>("albums");
           // Search by titles and artists
            string escapedQuery = System.Text.RegularExpressions.Regex.Escape(query);
            FilterDefinition<Album>? filter = Builders<Album>.Filter.Or(
                Builders<Album>.Filter.Regex("title", new BsonRegularExpression($"^{escapedQuery}", "i")),
                Builders<Album>.Filter.Regex("artist", new BsonRegularExpression($"^{escapedQuery}", "i")));

            // Multiple albums might be returned, and tracks could create too much boilerplate
            ProjectionDefinition<Album>? projection = Builders<Album>.Projection.Exclude("tracks");
            return Ok(await albumsCollection.Find(filter).Project<Album>(projection).ToListAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }
}
