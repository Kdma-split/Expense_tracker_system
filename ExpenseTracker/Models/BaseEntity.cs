using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models;

/// <summary>
/// Base entity with audit fields for all tables
/// </summary>
public abstract class BaseEntity
{
    [Key]
    public int Id { get; set; }
    
    public string? CreatedBy { get; set; }
    
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public string? UpdatedBy { get; set; }
    
    public DateTime? UpdatedDate { get; set; }
}
