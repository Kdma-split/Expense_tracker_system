namespace ExpenseTracker.Models;

/// <summary>
/// Finance payment status tracking
/// </summary>
public class FinanceStatus : BaseEntity
{
    public int RequestId { get; set; }
    
    public Request Request { get; set; } = null!;
    
    public FinanceStatusEnum Status { get; set; } = FinanceStatusEnum.Pending;
    
    public string ProcessedBy { get; set; } = string.Empty;
    
    public DateTime? PaymentDate { get; set; }
}
