namespace ExpenseTracker.Models;

/// <summary>
/// Analytics table for approved expenses
/// </summary>
public class Approved : BaseEntity
{
    public int RequestId { get; set; }
    
    public Request Request { get; set; } = null!;
    
    public decimal TotalAmount { get; set; }
    
    public int CategoryId { get; set; }
    
    public ExpenseCategoryConfig Category { get; set; } = null!;
    
    public ApprovedStatus Status { get; set; } = ApprovedStatus.Pending;
}
