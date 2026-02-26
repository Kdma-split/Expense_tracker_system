using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseTracker.Controllers;

[ApiController]
[Authorize]
public abstract class ApiControllerBase : ControllerBase
{
    protected int GetEmployeeId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    protected string GetRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    protected string GetName() => User.FindFirst(ClaimTypes.Name)?.Value ?? GetEmployeeId().ToString();
}
