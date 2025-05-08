using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using MusicAppAPI.Models;

namespace MusicAppAPI.Services;

public class UserService : IUserService
{
    private readonly IMongoDatabase _database;
    
    public UserService(IMongoDatabase database)
    {
        _database = database;
    }
    
    public async Task<User?> RegisterAsync(string email, string password)
    {
        IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
        
        // Check if a user with the specified email already exists    
        FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Email, email);
        if (await usersCollection.CountDocumentsAsync(filter) > 0) return null;
        
        User user = new()
        {
            Email = email,
            // Replace the password with a hash generated for it
            Password = new PasswordHasher<object?>().HashPassword(null, password)
        };

        // The first ever user automatically becomes an admin
        long count = await usersCollection.CountDocumentsAsync(_ => true);
        if (count == 0) user.Roles = ["admin"];
        
        await usersCollection.InsertOneAsync(user);
        return user;
    }
    
    public async Task<User?> AuthenticateAsync(string email, string password)
    {
        IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
            
        // Check if a user with the specified email exists    
        FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Email, email);
        User? user = await usersCollection.Find(filter).FirstOrDefaultAsync();
        if (user == null) return null;
        
        // Check if the provided password is correct    
        PasswordVerificationResult passwordVerificationResult = new PasswordHasher<object?>().VerifyHashedPassword(null, user.Password!, password);
            
        // If the password is correct, add the JWT token to the user object
        if (passwordVerificationResult == PasswordVerificationResult.Failed) 
            return null;
        user.Token = CreateToken(user);
        user.Password = null;
        return user;
    }

    public async Task<bool> SetRoleAsync(string email, string role)
    {
        IMongoCollection<User>? usersCollection = _database.GetCollection<User>("users");
        
        // Find a user with the specified email
        FilterDefinition<User>? filter = Builders<User>.Filter.Eq(u => u.Email, email);
        // Add the role only if it doesn't exist already (avoid duplicate roles)
        UpdateDefinition<User>? update = Builders<User>.Update.AddToSet(user=> user.Roles, role);
        // If the user is found, the role has been assigned either previously or now
        return (await usersCollection.UpdateOneAsync(filter, update)).MatchedCount > 0;
    }
    
    private string CreateToken(User user)
    {
        JwtSecurityTokenHandler handler = new();
        
        byte[] privateKey = Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")!); // See launchSettings.json
        SigningCredentials credentials = new(new SymmetricSecurityKey(privateKey), SecurityAlgorithms.HmacSha256Signature);
        
        SecurityTokenDescriptor tokenDescriptor = new()
        {
            SigningCredentials = credentials,
            Expires = DateTime.UtcNow.AddDays(1),
            Subject = GenerateClaims(user)
        };
          
        SecurityToken? token = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }
    
    // Specifies what info will be contained within the token
    private static ClaimsIdentity GenerateClaims(User user)
    {
        ClaimsIdentity ci = new();
  
        ci.AddClaim(new Claim("id", user.Id!));
        foreach (string role in user.Roles!)
            ci.AddClaim(new Claim(ClaimTypes.Role, role));
          
        return ci;
    }
}