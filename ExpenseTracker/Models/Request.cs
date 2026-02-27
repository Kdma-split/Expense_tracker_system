using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models;

/// <summary>
/// Master queue for expense requests after submission from drafts
/// </summary>
public class Request : BaseEntity
{
    public int EmployeeId { get; set; }
    
    public Employee Employee { get; set; } = null!;
    
    public string Subject { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    
    public int? CategoryId { get; set; }
    
    public ExpenseCategoryConfig? Category { get; set; }
    
    public DateTime DateOfExpense { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public RequestStatus Status { get; set; } = RequestStatus.Submitted;
    
    public ICollection<StatusHistory> StatusHistory { get; set; } = new List<StatusHistory>();
    
    public Approved? Approved { get; set; }
    
    public Rejected? Rejected { get; set; }
    
    public FinanceStatus? FinanceStatus { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
