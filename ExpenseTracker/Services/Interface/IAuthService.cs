using ExpenseTracker.DTOs;
using ExpenseTracker.Models;

namespace ExpenseTracker.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    string GenerateJwtToken(EmployeeProfile profile, Employee employee, string jti, DateTime expiresAtUtc);
}
