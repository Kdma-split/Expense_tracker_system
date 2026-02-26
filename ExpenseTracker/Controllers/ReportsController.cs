using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/reports")]
[Authorize(Roles = "Finance,Admin")]
public class ReportsController : ApiControllerBase
{
    private readonly IExpenseService _expenseService;

    public ReportsController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<IEnumerable<MonthlyExpenseSummaryDto>>> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
    {
        if (year < 2000 || year > 2100 || month is < 1 or > 12)
        {
            return BadRequest(new { message = "Invalid year/month" });
        }

        return Ok(await _expenseService.GetMonthlyExpenseSummaryAsync(year, month));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboard([FromQuery] int year, [FromQuery] int month)
    {
        if (year < 2000 || year > 2100 || month is < 1 or > 12)
        {
            return BadRequest(new { message = "Invalid year/month" });
        }

        return Ok(await _expenseService.GetDashboardStatsAsync(year, month));
    }
}
