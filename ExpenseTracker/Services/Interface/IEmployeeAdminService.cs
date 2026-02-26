using ExpenseTracker.DTOs;

namespace ExpenseTracker.Services;

public interface IEmployeeAdminService
{
    Task<IReadOnlyCollection<EmployeeAdminDto>> GetEmployeesAsync(bool includeInactive);
    Task<EmployeeAdminDto?> GetEmployeeByIdAsync(int id);
    Task<EmployeeAdminDto> CreateEmployeeAsync(CreateEmployeeByAdminDto dto, string actor);
    Task<EmployeeAdminDto> UpdateEmployeeAsync(int id, UpdateEmployeeByAdminDto dto, string actor);
    Task UpdateEmployeeStatusAsync(int id, UpdateEmployeeStatusDto dto, string actor);
}
