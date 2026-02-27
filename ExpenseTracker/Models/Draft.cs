namespace ExpenseTracker.Models;

/// <summary>
/// Temporary storage for drafts before submission
/// </summary>
public class Draft : BaseEntity
{
    public int EmployeeId { get; set; }
    
    public Employee Employee { get; set; } = null!;
    
    public string Subject { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    
    public int? CategoryId { get; set; }
    
    public ExpenseCategoryConfig? Category { get; set; }
    
    public DateTime DateOfExpense { get; set; }
    
    public DateTime DraftDate { get; set; } = DateTime.UtcNow;
}
