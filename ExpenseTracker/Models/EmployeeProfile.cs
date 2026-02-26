namespace ExpenseTracker.Models;

/// <summary>
/// Authentication data linked to Employee - email & hashed password for JWT
/// </summary>
public class EmployeeProfile : BaseEntity
{
    public int EmployeeId { get; set; }
    
    public Employee Employee { get; set; } = null!;
    
    public string Email { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
}
