using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/categories")]
public class CategoriesController : ApiControllerBase
{
    private readonly IExpenseService _expenseService;

    public CategoriesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseCategoryDto>>> GetCategories([FromQuery] bool includeInactive = false)
    {
        if (includeInactive && GetRole() != "Admin")
        {
            return Forbid();
        }

        return Ok(await _expenseService.GetCategoriesAsync(includeInactive));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ExpenseCategoryDto>> CreateCategory([FromBody] CreateExpenseCategoryDto dto)
    {
        try
        {
            var created = await _expenseService.CreateCategoryAsync(dto, GetName());
            return CreatedAtAction(nameof(GetCategories), new { includeInactive = true }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateExpenseCategoryDto dto)
    {
        try
        {
            await _expenseService.UpdateCategoryAsync(id, dto, GetName());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
