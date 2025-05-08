using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MusicAppAPI.Models;
using MusicAppAPI.Services;

namespace MusicAppAPI.Controllers;

[ApiController]
[Route("api")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    
    [HttpPost("sign-up")]
    public async Task<ActionResult> SignUpAsync([FromBody] SignData signData)
    {
        try
        {
            return StatusCode(await _userService.RegisterAsync(signData.Email, signData.Password) == null 
                ? StatusCodes.Status400BadRequest : StatusCodes.Status201Created);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
    
    [HttpPost("sign-in")]
    public async Task<ActionResult<User>> SignInAsync([FromBody] SignData signData)
    {
        try
        {
            User? authenticatedUser = await _userService.AuthenticateAsync(signData.Email, signData.Password);
            return authenticatedUser == null ? StatusCode(StatusCodes.Status401Unauthorized) : Ok(authenticatedUser);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [Authorize(Roles = "admin")]
    [HttpPatch("[controller]/give-admin-rights")]
    public async Task<ActionResult> GiveAdminRightsAsync([FromBody] string email)
    {
        try
        {
            return await _userService.SetRoleAsync(email, "admin")
                ? StatusCode(StatusCodes.Status200OK)
                : StatusCode(StatusCodes.Status400BadRequest);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
    
    public class SignData
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}