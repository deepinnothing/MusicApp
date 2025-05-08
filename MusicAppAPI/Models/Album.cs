using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicAppAPI.Models;

public class Album
{
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Id { get; set; }
    
    [BsonElement("title")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Title { get; set; }
    
    [BsonElement("artist")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Artist { get; set; }
    
    [BsonElement("year")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Year { get; set; }
    
    [BsonIgnoreIfNull]
    [BsonElement("realTracks")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<Track>? Tracks { get; set; }
    
    [BsonIgnoreIfNull]
    [BsonElement("coverUrl")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? CoverUrl { get; set; }
    
    [BsonIgnoreIfNull]
    [BsonElement("label")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Label { get; set; }
    
    // This property is only used to serialize and deserialize album objects from MongoDB
    [BsonIgnoreIfNull]
    [BsonElement("tracks")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
    public List<string>? TrackIds { get; set; }
}