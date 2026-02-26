using ExpenseTracker.Data;
using ExpenseTracker.DTOs;
using ExpenseTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services;

public class EmployeeAdminService : IEmployeeAdminService
{
    private readonly ExpenseDbContext _db;

    public EmployeeAdminService(ExpenseDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<EmployeeAdminDto>> GetEmployeesAsync(bool includeInactive)
    {
        var query = _db.Employees.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(e => e.IsActive);
        }

        return await (from e in query
                      join ep in _db.EmployeeProfiles.AsNoTracking() on e.Id equals ep.EmployeeId
                      orderby e.Name
                      select new EmployeeAdminDto(
                          e.Id, e.Name, e.Role, e.Department, e.ManagerId, ep.Email, e.IsActive))
            .ToListAsync();
    }

    public async Task<EmployeeAdminDto?> GetEmployeeByIdAsync(int id)
    {
        return await (from e in _db.Employees.AsNoTracking()
                      join ep in _db.EmployeeProfiles.AsNoTracking() on e.Id equals ep.EmployeeId
                      where e.Id == id
                      select new EmployeeAdminDto(
                          e.Id, e.Name, e.Role, e.Department, e.ManagerId, ep.Email, e.IsActive))
            .FirstOrDefaultAsync();
    }

    public async Task<EmployeeAdminDto> CreateEmployeeAsync(CreateEmployeeByAdminDto dto, string actor)
    {
        ValidateAdminManagedRole(dto.Role);
        await ValidateManagerIfProvided(dto.ManagerId);

        if (await _db.EmployeeProfiles.AnyAsync(p => p.Email == dto.Email))
        {
            throw new InvalidOperationException("Email already registered");
        }

        var employee = new Employee
        {
            Name = dto.Name.Trim(),
            Role = dto.Role.Trim(),
            Department = dto.Department.Trim(),
            ManagerId = dto.ManagerId,
            IsActive = true,
            CreatedBy = actor,
            CreatedDate = DateTime.UtcNow
        };

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        var profile = new EmployeeProfile
        {
            EmployeeId = employee.Id,
            Email = dto.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedBy = actor,
            CreatedDate = DateTime.UtcNow
        };

        _db.EmployeeProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return new EmployeeAdminDto(
            employee.Id, employee.Name, employee.Role, employee.Department,
            employee.ManagerId, profile.Email, employee.IsActive
        );
    }

    public async Task<EmployeeAdminDto> UpdateEmployeeAsync(int id, UpdateEmployeeByAdminDto dto, string actor)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new InvalidOperationException("Employee not found");

        if (employee.Role is "Admin" or "Finance")
        {
            throw new InvalidOperationException("Hardcoded Admin/Finance employees cannot be modified");
        }

        ValidateAdminManagedRole(dto.Role);
        await ValidateManagerIfProvided(dto.ManagerId);

        employee.Name = dto.Name.Trim();
        employee.Role = dto.Role.Trim();
        employee.Department = dto.Department.Trim();
        employee.ManagerId = dto.ManagerId;
        employee.UpdatedBy = actor;
        employee.UpdatedDate = DateTime.UtcNow;

        var profile = await _db.EmployeeProfiles.FirstOrDefaultAsync(p => p.EmployeeId == employee.Id)
            ?? throw new InvalidOperationException("Employee profile not found");

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            profile.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            profile.UpdatedBy = actor;
            profile.UpdatedDate = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return new EmployeeAdminDto(
            employee.Id, employee.Name, employee.Role, employee.Department,
            employee.ManagerId, profile.Email, employee.IsActive
        );
    }

    public async Task UpdateEmployeeStatusAsync(int id, UpdateEmployeeStatusDto dto, string actor)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new InvalidOperationException("Employee not found");

        if (employee.Role is "Admin" or "Finance")
        {
            throw new InvalidOperationException("Hardcoded Admin/Finance employees cannot be deactivated");
        }

        employee.IsActive = dto.IsActive;
        employee.UpdatedBy = actor;
        employee.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private static void ValidateAdminManagedRole(string role)
    {
        var normalized = role.Trim();
        if (normalized is not ("Employee" or "Manager"))
        {
            throw new InvalidOperationException("Admin can only manage Employee/Manager roles");
        }
    }

    private async Task ValidateManagerIfProvided(int? managerId)
    {
        if (!managerId.HasValue)
        {
            return;
        }

        var validManager = await _db.Employees
            .AnyAsync(e => e.Id == managerId.Value && e.Role == "Manager" && e.IsActive);
        if (!validManager)
        {
            throw new InvalidOperationException("ManagerId must reference an active manager");
        }
    }
}
