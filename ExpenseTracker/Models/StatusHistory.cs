namespace ExpenseTracker.Models;

/// <summary>
/// Immutable audit trail for request status changes.
/// </summary>
public class StatusHistory : BaseEntity
{
    public int RequestId { get; set; }
    
    public Request Request { get; set; } = null!;
    
    public RequestStatus FromStatus { get; set; }
    
    public RequestStatus ToStatus { get; set; }
    
    public string ChangedBy { get; set; } = string.Empty;
    
    public string? Remarks { get; set; }
    
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
