using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MusicAppAPI.Models;

public class Track
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
    
    [BsonElement("length")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Length { get; set; }
    
    [BsonIgnoreIfNull]
    [BsonElement("genre")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Genre { get; set; }
    
    [BsonElement("nr")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Nr { get; set; }
    
    [BsonElement("albumTitle")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? AlbumTitle { get; set; }
    
    [BsonElement("albumId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? AlbumId { get; set; }
}