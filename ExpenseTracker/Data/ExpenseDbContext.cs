using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Models;

namespace ExpenseTracker.Data;

public class ExpenseDbContext : DbContext
{
    public ExpenseDbContext(DbContextOptions<ExpenseDbContext> options) : base(options) { }
    
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<EmployeeProfile> EmployeeProfiles => Set<EmployeeProfile>();
    public DbSet<Draft> Drafts => Set<Draft>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<ExpenseCategoryConfig> ExpenseCategories => Set<ExpenseCategoryConfig>();
    public DbSet<StatusHistory> StatusHistory => Set<StatusHistory>();
    public DbSet<Approved> ApprovedItems => Set<Approved>();
    public DbSet<Rejected> RejectedItems => Set<Rejected>();
    public DbSet<FinanceStatus> FinanceStatuses => Set<FinanceStatus>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Employee - self-referencing manager relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Manager)
            .WithMany(e => e.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Employee>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);
        
        // EmployeeProfile -> Employee
        modelBuilder.Entity<EmployeeProfile>()
            .HasOne(ep => ep.Employee)
            .WithMany(e => e.EmployeeProfiles)
            .HasForeignKey(ep => ep.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EmployeeProfile>()
            .HasIndex(ep => ep.EmployeeId)
            .IsUnique();

        modelBuilder.Entity<EmployeeProfile>()
            .HasIndex(ep => ep.Email)
            .IsUnique();

        modelBuilder.Entity<ExpenseCategoryConfig>()
            .HasIndex(c => c.Name)
            .IsUnique();
        
        // Draft -> Employee
        modelBuilder.Entity<Draft>()
            .HasOne(d => d.Employee)
            .WithMany(e => e.Drafts)
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Draft>()
            .HasOne(d => d.Category)
            .WithMany(c => c.Drafts)
            .HasForeignKey(d => d.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Request -> Employee
        modelBuilder.Entity<Request>()
            .HasOne(r => r.Employee)
            .WithMany(e => e.Requests)
            .HasForeignKey(r => r.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Request>()
            .HasOne(r => r.Category)
            .WithMany(c => c.Requests)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StatusHistory>()
            .HasOne(h => h.Request)
            .WithMany(r => r.StatusHistory)
            .HasForeignKey(h => h.RequestId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Approved -> Request (one-to-one)
        modelBuilder.Entity<Approved>()
            .HasOne(a => a.Request)
            .WithOne(r => r.Approved)
            .HasForeignKey<Approved>(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Approved>()
            .HasOne(a => a.Category)
            .WithMany(c => c.ApprovedItems)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Rejected -> Request (one-to-one)
        modelBuilder.Entity<Rejected>()
            .HasOne(r => r.Request)
            .WithOne(req => req.Rejected)
            .HasForeignKey<Rejected>(r => r.RequestId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Rejected -> Employee (manager)
        modelBuilder.Entity<Rejected>()
            .HasOne(r => r.Manager)
            .WithMany()
            .HasForeignKey(r => r.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);
        
        // FinanceStatus -> Request (one-to-one)
        modelBuilder.Entity<FinanceStatus>()
            .HasOne(f => f.Request)
            .WithOne(r => r.FinanceStatus)
            .HasForeignKey<FinanceStatus>(f => f.RequestId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Configure enum conversions
        modelBuilder.Entity<Draft>()
            .Property(d => d.Amount)
            .HasPrecision(18, 2);
        
        modelBuilder.Entity<Request>()
            .Property(r => r.Status)
            .HasConversion<int>();
        
        modelBuilder.Entity<Request>()
            .Property(r => r.Amount)
            .HasPrecision(18, 2);
        
        modelBuilder.Entity<Approved>()
            .Property(a => a.TotalAmount)
            .HasPrecision(18, 2);
        
        modelBuilder.Entity<Approved>()
            .Property(a => a.Status)
            .HasConversion<int>();
        
        modelBuilder.Entity<FinanceStatus>()
            .Property(f => f.Status)
            .HasConversion<int>();

        modelBuilder.Entity<StatusHistory>()
            .Property(h => h.FromStatus)
            .HasConversion<int>();

        modelBuilder.Entity<StatusHistory>()
            .Property(h => h.ToStatus)
            .HasConversion<int>();

        modelBuilder.Entity<Request>()
            .Property(r => r.RowVersion)
            .IsRowVersion();

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.Status, r.CreatedAt });

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.EmployeeId, r.DateOfExpense });

        modelBuilder.Entity<Request>()
            .HasIndex(r => r.CategoryId);

        modelBuilder.Entity<StatusHistory>()
            .HasIndex(h => new { h.RequestId, h.ChangedAt });

        modelBuilder.Entity<Draft>()
            .HasIndex(d => new { d.EmployeeId, d.DraftDate });
    }
}
