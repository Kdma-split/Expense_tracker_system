using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/finance")]
[Authorize(Roles = "Finance,Admin")]
public class FinanceController : ApiControllerBase
{
    private readonly IExpenseService _expenseService;

    public FinanceController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpPost("pay")]
    public async Task<ActionResult<FinanceStatusDto>> ProcessPayment([FromBody] FinancePaymentDto dto)
    {
        try
        {
            return Ok(await _expenseService.ProcessPaymentAsync(dto.RequestId, GetName(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
