using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ITokenSessionStore _tokenSessionStore;

    public AuthController(IAuthService authService, ITokenSessionStore tokenSessionStore)
    {
        _authService = authService;
        _tokenSessionStore = tokenSessionStore;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        var employeeIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

        if (!int.TryParse(employeeIdClaim, out var employeeId) || string.IsNullOrWhiteSpace(jti))
        {
            return BadRequest(new { message = "Invalid token context" });
        }

        _tokenSessionStore.RemoveSession(employeeId, jti);
        return NoContent();
    }
}
