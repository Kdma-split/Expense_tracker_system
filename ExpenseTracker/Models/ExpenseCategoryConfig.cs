namespace ExpenseTracker.Models;

/// <summary>
/// Admin-managed expense categories.
/// </summary>
public class ExpenseCategoryConfig : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<Draft> Drafts { get; set; } = new List<Draft>();

    public ICollection<DraftItem> DraftItems { get; set; } = new List<DraftItem>();
    
    public ICollection<Request> Requests { get; set; } = new List<Request>();

    public ICollection<RequestItem> RequestItems { get; set; } = new List<RequestItem>();
    
    public ICollection<Approved> ApprovedItems { get; set; } = new List<Approved>();
}
