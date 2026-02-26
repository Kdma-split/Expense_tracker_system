namespace ExpenseTracker.Models;

/// <summary>
/// Records of manager-rejected expenses with mandatory rejection reason
/// </summary>
public class Rejected : BaseEntity
{
    public int RequestId { get; set; }
    
    public Request Request { get; set; } = null!;
    
    public int ManagerId { get; set; }
    
    public Employee Manager { get; set; } = null!;
    
    // Mandatory comment for rejection
    public string Comment { get; set; } = string.Empty;
}
