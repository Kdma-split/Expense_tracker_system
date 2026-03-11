namespace ExpenseTracker.Models;

/// <summary>
/// Line items for a submitted request
/// </summary>
public class RequestItem : BaseEntity
{
    public int RequestId { get; set; }

    public Request Request { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public int CategoryId { get; set; }

    public ExpenseCategoryConfig Category { get; set; } = null!;
}
