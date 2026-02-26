using ExpenseTracker.Models;
using BCrypt.Net;

namespace ExpenseTracker.Data;

public static class DbInitializer
{
    public static void Initialize(ExpenseDbContext context)
    {
        context.Database.EnsureCreated();
        
        // Check if already seeded
        if (context.Employees.Any()) return;
        
        // Create Admin Employee
        var adminEmployee = new Employee
        {
            Name = "Admin User",
            Role = "Admin",
            IsActive = true,
            Department = "Administration",
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.Employees.Add(adminEmployee);
        
        // Create Finance Employee
        var financeEmployee = new Employee
        {
            Name = "Finance User",
            Role = "Finance",
            IsActive = true,
            Department = "Finance",
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.Employees.Add(financeEmployee);
        
        // Create Manager Employee
        var managerEmployee = new Employee
        {
            Name = "Manager User",
            Role = "Manager",
            IsActive = true,
            Department = "IT",
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.Employees.Add(managerEmployee);
        
        // Create Regular Employee
        var regularEmployee = new Employee
        {
            Name = "Regular Employee",
            Role = "Employee",
            IsActive = true,
            Department = "IT",
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.Employees.Add(regularEmployee);
        
        context.SaveChanges();

        // Set manager relationship after identities are generated
        regularEmployee.ManagerId = managerEmployee.Id;
        context.SaveChanges();
        
        // Create Employee Profiles with BCrypt hashed passwords
        var adminProfile = new EmployeeProfile
        {
            EmployeeId = adminEmployee.Id,
            Email = "admin@company.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.EmployeeProfiles.Add(adminProfile);
        
        var financeProfile = new EmployeeProfile
        {
            EmployeeId = financeEmployee.Id,
            Email = "finance@company.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Finance123!"),
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.EmployeeProfiles.Add(financeProfile);
        
        var managerProfile = new EmployeeProfile
        {
            EmployeeId = managerEmployee.Id,
            Email = "manager@company.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.EmployeeProfiles.Add(managerProfile);
        
        var employeeProfile = new EmployeeProfile
        {
            EmployeeId = regularEmployee.Id,
            Email = "employee@company.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee123!"),
            CreatedBy = "System",
            CreatedDate = DateTime.UtcNow
        };
        context.EmployeeProfiles.Add(employeeProfile);
        
        context.SaveChanges();

        // Seed expense categories
        var categories = new[]
        {
            "Travel", "Food", "Certifications", "Miscellaneous", "Training", "Equipment", "Software"
        };

        foreach (var category in categories)
        {
            context.ExpenseCategories.Add(new ExpenseCategoryConfig
            {
                Name = category,
                IsActive = true,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            });
        }
        context.SaveChanges();
    }
}
