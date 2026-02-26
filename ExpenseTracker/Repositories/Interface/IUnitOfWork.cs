using ExpenseTracker.Data;
using ExpenseTracker.Models;

namespace ExpenseTracker.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<Employee> Employees { get; }
    IRepository<EmployeeProfile> EmployeeProfiles { get; }
    IRepository<Draft> Drafts { get; }
    IRepository<Request> Requests { get; }
    IRepository<ExpenseCategoryConfig> ExpenseCategories { get; }
    IRepository<StatusHistory> StatusHistory { get; }
    IRepository<Approved> ApprovedItems { get; }
    IRepository<Rejected> RejectedItems { get; }
    IRepository<FinanceStatus> FinanceStatuses { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
