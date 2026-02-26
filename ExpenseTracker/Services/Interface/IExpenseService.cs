using ExpenseTracker.DTOs;

namespace ExpenseTracker.Services;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseCategoryDto>> GetCategoriesAsync(bool includeInactive = false);
    Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryDto dto, string actor);
    Task UpdateCategoryAsync(int id, UpdateExpenseCategoryDto dto, string actor);

    Task<IEnumerable<DraftDto>> GetDraftsByEmployeeAsync(int employeeId);
    Task<DraftDto?> GetDraftByIdAsync(int id);
    Task<DraftDto> CreateDraftAsync(int employeeId, CreateDraftDto dto);
    Task UpdateDraftAsync(int id, int employeeId, UpdateDraftDto dto);
    Task DeleteDraftAsync(int id, int employeeId);
    Task<RequestDto> SubmitDraftToRequestAsync(int draftId, int employeeId);

    Task<PagedResultDto<RequestDto>> GetRequestsAsync(int userId, string role, RequestFilterDto filter);
    Task<PagedResultDto<RequestDto>> GetTeamPendingRequestsAsync(int managerId, RequestFilterDto filter);
    Task<RequestDto?> GetRequestByIdAsync(int id, int userId, string role);
    Task<IEnumerable<StatusHistoryDto>> GetStatusHistoryByRequestAsync(int requestId, int userId, string role);
    Task<RequestDto> ResubmitRejectedRequestAsync(int requestId, int employeeId);

    Task<ApprovedDto> ApproveRequestAsync(int requestId, int managerId, string managerName, ApproveRequestDto dto);
    Task<RejectedDto> RejectRequestAsync(int requestId, int managerId, RejectRequestDto dto);
    Task<FinanceStatusDto> ProcessPaymentAsync(int requestId, string processedBy, FinancePaymentDto dto);

    Task<IEnumerable<MonthlyExpenseSummaryDto>> GetMonthlyExpenseSummaryAsync(int year, int month);
    Task<DashboardStatsDto> GetDashboardStatsAsync(int year, int month);
}
