using ExpenseTracker.DTOs;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace ExpenseTracker.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ITokenSessionStore _tokenSessionStore;
    
    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, ITokenSessionStore tokenSessionStore)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _tokenSessionStore = tokenSessionStore;
    }
    
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var profile = (await _unitOfWork.EmployeeProfiles.GetAllAsync())
            .FirstOrDefault(p => (p.Email ?? string.Empty).Trim().ToLowerInvariant() == normalizedEmail);
        
        if (profile == null) return null;
        
        if (!BCrypt.Net.BCrypt.Verify(request.Password, profile.PasswordHash))
            return null;
        
        var employee = await _unitOfWork.Employees.GetByIdAsync(profile.EmployeeId);
        if (employee == null) return null;
        if (!employee.IsActive) return null;
        
        var expiresAtUtc = DateTime.UtcNow.AddHours(24);
        var jti = Guid.NewGuid().ToString("N");
        var created = _tokenSessionStore.TryCreateSession(employee.Id, jti, expiresAtUtc);
        if (!created)
            throw new InvalidOperationException("User already has an active session");

        var token = GenerateJwtToken(profile, employee, jti, expiresAtUtc);
        
        return new LoginResponse(token, employee.Id, employee.Role, employee.Name);
    }
    
    public string GenerateJwtToken(EmployeeProfile profile, Employee employee, string jti, DateTime expiresAtUtc)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"));
        
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, profile.EmployeeId.ToString()),
            new Claim(ClaimTypes.Email, profile.Email),
            new Claim(ClaimTypes.Role, employee.Role),
            new Claim(ClaimTypes.Name, employee.Name),
            new Claim(JwtRegisteredClaimNames.Jti, jti)
        };
        
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ExpenseTracker",
            audience: _configuration["Jwt:Audience"] ?? "ExpenseTrackerUsers",
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
