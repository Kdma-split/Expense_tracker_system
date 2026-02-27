using ExpenseTracker.DTOs;
using ExpenseTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers;

[Route("api/requests")]
public class RequestsController : ApiControllerBase
{
    private readonly IExpenseService _expenseService;

    public RequestsController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    [Authorize(Roles = "Employee,Manager,Finance,Admin")]
    public async Task<ActionResult<PagedResultDto<RequestDto>>> GetRequests([FromQuery] RequestFilterDto filter)
    {
        return Ok(await _expenseService.GetRequestsAsync(GetEmployeeId(), GetRole(), filter));
    }

    [HttpGet("team-pending")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<PagedResultDto<RequestDto>>> GetTeamPending([FromQuery] RequestFilterDto filter)
    {
        return Ok(await _expenseService.GetTeamPendingRequestsAsync(GetEmployeeId(), filter));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Employee,Manager,Finance,Admin")]
    public async Task<ActionResult<RequestDto>> GetRequest(int id)
    {
        var request = await _expenseService.GetRequestByIdAsync(id, GetEmployeeId(), GetRole());
        return request == null ? NotFound() : Ok(request);
    }

    [HttpGet("{id:int}/history")]
    [Authorize(Roles = "Employee,Manager,Finance,Admin")]
    public async Task<ActionResult<IEnumerable<StatusHistoryDto>>> GetRequestHistory(int id)
    {
        try
        {
            return Ok(await _expenseService.GetStatusHistoryByRequestAsync(id, GetEmployeeId(), GetRole()));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("resubmit")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<RequestDto>> Resubmit([FromBody] ResubmitRequestDto dto)
    {
        try
        {
            return Ok(await _expenseService.ResubmitRejectedRequestAsync(dto.RequestId, GetEmployeeId()));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("approve")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<ApprovedDto>> ApproveRequest([FromBody] ApproveRequestDto dto)
    {
        try
        {
            return Ok(await _expenseService.ApproveRequestAsync(dto.RequestId, GetEmployeeId(), GetName(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reject")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<RejectedDto>> RejectRequest([FromBody] RejectRequestDto dto)
    {
        try
        {
            return Ok(await _expenseService.RejectRequestAsync(dto.RequestId, GetEmployeeId(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/category")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RequestDto>> UpdateCategory(int id, [FromBody] UpdateRequestCategoryDto dto)
    {
        try
        {
            return Ok(await _expenseService.UpdatePaidRequestCategoryAsync(id, dto.CategoryId, GetName(), dto.Remarks));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
