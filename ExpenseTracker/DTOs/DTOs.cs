using ExpenseTracker.Models;

namespace ExpenseTracker.DTOs;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, int EmployeeId, string Role, string Name);

public record EmployeeDto(int Id, string Name, string Role, string Department, int? ManagerId);
public record EmployeeAdminDto(int Id, string Name, string Role, string Department, int? ManagerId, string Email, bool IsActive, DateTime CreatedDate);
public record CreateEmployeeByAdminDto(string Email, string Password, string Name, string Role, string Department, int? ManagerId);
public record UpdateEmployeeByAdminDto(string Name, string Role, string Department, int? ManagerId, string? Password);
public record UpdateEmployeeStatusDto(bool IsActive);

public record ExpenseCategoryDto(int Id, string Name, bool IsActive);
public record CreateExpenseCategoryDto(string Name);
public record UpdateExpenseCategoryDto(string Name, bool IsActive);

public record DraftDto(
    int Id,
    int EmployeeId,
    string Subject,
    string Description,
    decimal Amount,
    int CategoryId,
    string CategoryName,
    DateTime DateOfExpense,
    DateTime DraftDate
);

public record CreateDraftDto(
    string Subject,
    string Description,
    decimal Amount,
    int CategoryId,
    DateTime DateOfExpense
);

public record UpdateDraftDto(
    string Subject,
    string Description,
    decimal Amount,
    int CategoryId,
    DateTime DateOfExpense
);

public record RequestDto(
    int Id,
    int EmployeeId,
    string Subject,
    string Description,
    decimal Amount,
    int CategoryId,
    string CategoryName,
    DateTime DateOfExpense,
    DateTime CreatedAt,
    RequestStatus Status
);

public record RequestFilterDto(
    DateTime? FromDate,
    DateTime? ToDate,
    RequestStatus? Status,
    int? EmployeeId,
    string? SortBy,
    string? SortOrder,
    int PageNumber = 1,
    int PageSize = 20
);

public record PagedResultDto<T>(IReadOnlyCollection<T> Items, int PageNumber, int PageSize, int TotalCount);

public record ApproveRequestDto(int RequestId, string? Comments);
public record RejectRequestDto(int RequestId, string Comment);
public record ResubmitRequestDto(int RequestId);

public record FinancePaymentDto(int RequestId, string? Notes);

public record FinanceStatusDto(
    int Id,
    int RequestId,
    FinanceStatusEnum Status,
    string ProcessedBy,
    DateTime? PaymentDate
);

public record ApprovedDto(
    int Id,
    int RequestId,
    decimal TotalAmount,
    int CategoryId,
    ApprovedStatus Status
);

public record RejectedDto(int Id, int RequestId, int ManagerId, string Comment);

public record StatusHistoryDto(
    int Id,
    int RequestId,
    RequestStatus FromStatus,
    RequestStatus ToStatus,
    string ChangedBy,
    string? Remarks,
    DateTime ChangedAt
);

public record MonthlyExpenseSummaryDto(int Year, int Month, int CategoryId, string CategoryName, decimal TotalAmount, int RequestCount);
public record DashboardStatsDto(decimal MonthlyTotal, int PendingApprovals, IReadOnlyCollection<MonthlyExpenseSummaryDto> ByCategory, IReadOnlyCollection<RequestDto> TopClaims);
