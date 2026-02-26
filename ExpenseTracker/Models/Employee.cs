namespace ExpenseTracker.Models;

/// <summary>
/// Employee with self-referencing manager relationship
/// </summary>
public class Employee : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    public string Role { get; set; } = "Employee"; // Employee, Manager, Admin, Finance

    public bool IsActive { get; set; } = true;
    
    public string Department { get; set; } = string.Empty;
    
    // Self-referencing foreign key for manager
    public int? ManagerId { get; set; }
    
    public Employee? Manager { get; set; }
    
    public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
    
    public ICollection<EmployeeProfile> EmployeeProfiles { get; set; } = new List<EmployeeProfile>();
    
    public ICollection<Draft> Drafts { get; set; } = new List<Draft>();
    
    public ICollection<Request> Requests { get; set; } = new List<Request>();
}
