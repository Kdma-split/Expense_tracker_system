namespace ExpenseTracker.Models;

/// <summary>
/// Admin-managed expense categories.
/// </summary>
public class ExpenseCategoryConfig : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<Draft> Drafts { get; set; } = new List<Draft>();
    
    public ICollection<Request> Requests { get; set; } = new List<Request>();
    
    public ICollection<Approved> ApprovedItems { get; set; } = new List<Approved>();
}
