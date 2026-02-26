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
    
    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }
    
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var profile = (await _unitOfWork.EmployeeProfiles.GetAllAsync())
            .FirstOrDefault(p => p.Email == request.Email.Trim().ToLowerInvariant());
        
        if (profile == null) return null;
        
        if (!BCrypt.Net.BCrypt.Verify(request.Password, profile.PasswordHash))
            return null;
        
        var employee = await _unitOfWork.Employees.GetByIdAsync(profile.EmployeeId);
        if (employee == null) return null;
        if (!employee.IsActive) return null;
        
        var token = GenerateJwtToken(profile, employee);
        
        return new LoginResponse(token, employee.Id, employee.Role, employee.Name);
    }
    
    public string GenerateJwtToken(EmployeeProfile profile, Employee employee)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"));
        
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, profile.EmployeeId.ToString()),
            new Claim(ClaimTypes.Email, profile.Email),
            new Claim(ClaimTypes.Role, employee.Role),
            new Claim(ClaimTypes.Name, employee.Name)
        };
        
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ExpenseTracker",
            audience: _configuration["Jwt:Audience"] ?? "ExpenseTrackerUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
