using ExpenseTracker.Data;
using ExpenseTracker.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace ExpenseTracker.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ExpenseDbContext _context;
    private IDbContextTransaction? _transaction;
    
    public UnitOfWork(ExpenseDbContext context)
    {
        _context = context;
        Employees = new Repository<Employee>(context);
        EmployeeProfiles = new Repository<EmployeeProfile>(context);
        Drafts = new Repository<Draft>(context);
        Requests = new Repository<Request>(context);
        ExpenseCategories = new Repository<ExpenseCategoryConfig>(context);
        StatusHistory = new Repository<StatusHistory>(context);
        ApprovedItems = new Repository<Approved>(context);
        RejectedItems = new Repository<Rejected>(context);
        FinanceStatuses = new Repository<FinanceStatus>(context);
    }
    
    public IRepository<Employee> Employees { get; }
    public IRepository<EmployeeProfile> EmployeeProfiles { get; }
    public IRepository<Draft> Drafts { get; }
    public IRepository<Request> Requests { get; }
    public IRepository<ExpenseCategoryConfig> ExpenseCategories { get; }
    public IRepository<StatusHistory> StatusHistory { get; }
    public IRepository<Approved> ApprovedItems { get; }
    public IRepository<Rejected> RejectedItems { get; }
    public IRepository<FinanceStatus> FinanceStatuses { get; }
    
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
    
    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }
    
    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
    
    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
    
    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
