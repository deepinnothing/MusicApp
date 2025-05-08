using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicAppAPI.Models;

public class User
{
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Id { get; set; }
    
    [BsonElement("email")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Email { get; set; }
    
    [BsonElement("password")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Password { get; set; }
    
    [BsonIgnoreIfNull]
    [BsonElement("roles")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Roles { get; set; }

    [BsonElement("library_tracks")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string> LibraryTracks { get; set; } = [];

    [BsonElement("library_albums")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string> LibraryAlbums { get; set; } = [];
    
    [BsonIgnore] // This property should never be written to the database
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Token { get; set; }
}