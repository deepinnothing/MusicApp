using MusicAppAPI.Models;

namespace MusicAppAPI.Services;

public interface IUserService
{
    Task<User?> AuthenticateAsync(string email, string password);
    Task<User?> RegisterAsync(string email, string password);
    Task<bool> SetRoleAsync(string email, string role);
}