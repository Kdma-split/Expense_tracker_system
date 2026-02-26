using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/admin/employees")]
[Authorize(Roles = "Admin")]
public class AdminEmployeesController : ControllerBase
{
    private readonly IEmployeeAdminService _employeeAdminService;

    public AdminEmployeesController(IEmployeeAdminService employeeAdminService)
    {
        _employeeAdminService = employeeAdminService;
    }

    private string GetActor() => User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<EmployeeAdminDto>>> GetEmployees([FromQuery] bool includeInactive = true)
    {
        return Ok(await _employeeAdminService.GetEmployeesAsync(includeInactive));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeAdminDto>> GetEmployee(int id)
    {
        var employee = await _employeeAdminService.GetEmployeeByIdAsync(id);
        return employee == null ? NotFound() : Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeAdminDto>> CreateEmployee([FromBody] CreateEmployeeByAdminDto dto)
    {
        try
        {
            var created = await _employeeAdminService.CreateEmployeeAsync(dto, GetActor());
            return CreatedAtAction(nameof(GetEmployee), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeAdminDto>> UpdateEmployee(int id, [FromBody] UpdateEmployeeByAdminDto dto)
    {
        try
        {
            return Ok(await _employeeAdminService.UpdateEmployeeAsync(id, dto, GetActor()));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateEmployeeStatus(int id, [FromBody] UpdateEmployeeStatusDto dto)
    {
        try
        {
            await _employeeAdminService.UpdateEmployeeStatusAsync(id, dto, GetActor());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
