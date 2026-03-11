namespace ExpenseTracker.Models;

/// <summary>
/// Line items for a draft request
/// </summary>
public class DraftItem : BaseEntity
{
    public int DraftId { get; set; }

    public Draft Draft { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public int CategoryId { get; set; }

    public ExpenseCategoryConfig Category { get; set; } = null!;
}
