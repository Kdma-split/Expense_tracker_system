using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/drafts")]
[Authorize(Roles = "Employee")]
public class DraftsController : ApiControllerBase
{
    private readonly IExpenseService _expenseService;

    public DraftsController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DraftDto>>> GetMyDrafts()
    {
        return Ok(await _expenseService.GetDraftsByEmployeeAsync(GetEmployeeId()));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DraftDto>> GetDraft(int id)
    {
        var draft = await _expenseService.GetDraftByIdAsync(id);
        if (draft == null || draft.EmployeeId != GetEmployeeId())
        {
            return NotFound();
        }

        return Ok(draft);
    }

    [HttpPost]
    public async Task<ActionResult<DraftDto>> CreateDraft([FromBody] CreateDraftDto dto)
    {
        try
        {
            var draft = await _expenseService.CreateDraftAsync(GetEmployeeId(), dto);
            return CreatedAtAction(nameof(GetDraft), new { id = draft.Id }, draft);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDraft(int id, [FromBody] UpdateDraftDto dto)
    {
        try
        {
            await _expenseService.UpdateDraftAsync(id, GetEmployeeId(), dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDraft(int id)
    {
        try
        {
            await _expenseService.DeleteDraftAsync(id, GetEmployeeId());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/submit")]
    public async Task<ActionResult<RequestDto>> SubmitDraft(int id)
    {
        try
        {
            return Ok(await _expenseService.SubmitDraftToRequestAsync(id, GetEmployeeId()));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
