using ExpenseTracker.Data;
using ExpenseTracker.DTOs;
using ExpenseTracker.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ExpenseTracker.Services;

public class ExpenseService : IExpenseService
{
    private readonly ExpenseDbContext _db;

    public ExpenseService(ExpenseDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ExpenseCategoryDto>> GetCategoriesAsync(bool includeInactive = false)
    {
        var query = _db.ExpenseCategories.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        return await query
            .OrderBy(c => c.Name)
            .Select(c => new ExpenseCategoryDto(c.Id, c.Name, c.IsActive))
            .ToListAsync();
    }

    public async Task<ExpenseCategoryDto> CreateCategoryAsync(CreateExpenseCategoryDto dto, string actor)
    {
        var exists = await _db.ExpenseCategories.AnyAsync(c => c.Name == dto.Name.Trim());
        if (exists)
        {
            throw new InvalidOperationException("Category already exists");
        }

        var category = new ExpenseCategoryConfig
        {
            Name = dto.Name.Trim(),
            IsActive = true,
            CreatedBy = actor,
            CreatedDate = DateTime.UtcNow
        };

        _db.ExpenseCategories.Add(category);
        await _db.SaveChangesAsync();
        return new ExpenseCategoryDto(category.Id, category.Name, category.IsActive);
    }

    public async Task UpdateCategoryAsync(int id, UpdateExpenseCategoryDto dto, string actor)
    {
        var category = await _db.ExpenseCategories.FindAsync(id)
            ?? throw new InvalidOperationException("Category not found");

        var duplicate = await _db.ExpenseCategories.AnyAsync(c => c.Id != id && c.Name == dto.Name.Trim());
        if (duplicate)
        {
            throw new InvalidOperationException("Category name already in use");
        }

        category.Name = dto.Name.Trim();
        category.IsActive = dto.IsActive;
        category.UpdatedBy = actor;
        category.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<DraftDto>> GetDraftsByEmployeeAsync(int employeeId)
    {
        return await _db.Drafts
            .AsNoTracking()
            .Include(d => d.Category)
            .Where(d => d.EmployeeId == employeeId)
            .OrderByDescending(d => d.DraftDate)
            .Select(ToDraftDto())
            .ToListAsync();
    }

    public async Task<DraftDto?> GetDraftByIdAsync(int id)
    {
        return await _db.Drafts
            .AsNoTracking()
            .Include(d => d.Category)
            .Where(d => d.Id == id)
            .Select(ToDraftDto())
            .FirstOrDefaultAsync();
    }

    public async Task<DraftDto> CreateDraftAsync(int employeeId, CreateDraftDto dto)
    {
        await ValidateCategoryAsync(dto.CategoryId);

        var draft = new Draft
        {
            EmployeeId = employeeId,
            Subject = dto.Subject.Trim(),
            Description = dto.Description.Trim(),
            Amount = dto.Amount,
            CategoryId = dto.CategoryId,
            DateOfExpense = dto.DateOfExpense.Date,
            DraftDate = DateTime.UtcNow,
            CreatedBy = employeeId.ToString(),
            CreatedDate = DateTime.UtcNow
        };

        _db.Drafts.Add(draft);
        await _db.SaveChangesAsync();

        var categoryName = await _db.ExpenseCategories
            .Where(c => c.Id == dto.CategoryId)
            .Select(c => c.Name)
            .FirstAsync();

        return new DraftDto(
            draft.Id, draft.EmployeeId, draft.Subject, draft.Description, draft.Amount,
            draft.CategoryId, categoryName, draft.DateOfExpense, draft.DraftDate
        );
    }

    public async Task UpdateDraftAsync(int id, int employeeId, UpdateDraftDto dto)
    {
        await ValidateCategoryAsync(dto.CategoryId);

        var draft = await _db.Drafts.FirstOrDefaultAsync(d => d.Id == id && d.EmployeeId == employeeId)
            ?? throw new InvalidOperationException("Draft not found");

        draft.Subject = dto.Subject.Trim();
        draft.Description = dto.Description.Trim();
        draft.Amount = dto.Amount;
        draft.CategoryId = dto.CategoryId;
        draft.DateOfExpense = dto.DateOfExpense.Date;
        draft.UpdatedDate = DateTime.UtcNow;
        draft.UpdatedBy = employeeId.ToString();

        await _db.SaveChangesAsync();
    }

    public async Task DeleteDraftAsync(int id, int employeeId)
    {
        var draft = await _db.Drafts.FirstOrDefaultAsync(d => d.Id == id && d.EmployeeId == employeeId)
            ?? throw new InvalidOperationException("Draft not found");

        _db.Drafts.Remove(draft);
        await _db.SaveChangesAsync();
    }

    public async Task<RequestDto> SubmitDraftToRequestAsync(int draftId, int employeeId)
    {
        var draft = await _db.Drafts.FirstOrDefaultAsync(d => d.Id == draftId && d.EmployeeId == employeeId)
            ?? throw new InvalidOperationException("Draft not found");

        var duplicateExists = await _db.Requests.AnyAsync(r =>
            r.EmployeeId == employeeId &&
            r.Subject == draft.Subject &&
            r.Description == draft.Description &&
            r.Amount == draft.Amount &&
            r.CategoryId == draft.CategoryId &&
            r.DateOfExpense == draft.DateOfExpense &&
            r.Status != RequestStatus.Rejected);

        if (duplicateExists)
        {
            throw new InvalidOperationException("Duplicate submission detected");
        }

        await using var tx = await _db.Database.BeginTransactionAsync();

        var request = new Request
        {
            EmployeeId = draft.EmployeeId,
            Subject = draft.Subject,
            Description = draft.Description,
            Amount = draft.Amount,
            CategoryId = draft.CategoryId,
            DateOfExpense = draft.DateOfExpense,
            CreatedAt = DateTime.UtcNow,
            Status = RequestStatus.Submitted,
            CreatedBy = employeeId.ToString(),
            CreatedDate = DateTime.UtcNow
        };

        _db.Requests.Add(request);
        await _db.SaveChangesAsync();

        _db.StatusHistory.Add(new StatusHistory
        {
            RequestId = request.Id,
            FromStatus = RequestStatus.Draft,
            ToStatus = RequestStatus.Submitted,
            ChangedBy = employeeId.ToString(),
            Remarks = "Draft submitted",
            ChangedAt = DateTime.UtcNow,
            CreatedBy = employeeId.ToString(),
            CreatedDate = DateTime.UtcNow
        });

        _db.Drafts.Remove(draft);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return await _db.Requests
            .AsNoTracking()
            .Include(r => r.Category)
            .Where(r => r.Id == request.Id)
            .Select(ToRequestDto())
            .FirstAsync();
    }

    public async Task<PagedResultDto<RequestDto>> GetRequestsAsync(int userId, string role, RequestFilterDto filter)
    {
        var query = _db.Requests.AsNoTracking().Include(r => r.Category).AsQueryable();
        if (role == "Employee")
        {
            query = query.Where(r => r.EmployeeId == userId);
        }
        else if (role == "Manager")
        {
            var teamIds = await GetTeamMemberIdsAsync(userId);
            query = query.Where(r => teamIds.Contains(r.EmployeeId));
        }

        query = ApplyRequestFilter(query, filter);
        var total = await query.CountAsync();
        var items = await ApplySortAndPage(query, filter).Select(ToRequestDto()).ToListAsync();
        return new PagedResultDto<RequestDto>(items, filter.PageNumber, filter.PageSize, total);
    }

    public async Task<PagedResultDto<RequestDto>> GetTeamPendingRequestsAsync(int managerId, RequestFilterDto filter)
    {
        var teamIds = await GetTeamMemberIdsAsync(managerId);
        var effectiveFilter = filter with { Status = RequestStatus.Submitted };
        var query = _db.Requests.AsNoTracking().Include(r => r.Category)
            .Where(r => teamIds.Contains(r.EmployeeId));

        query = ApplyRequestFilter(query, effectiveFilter);
        var total = await query.CountAsync();
        var items = await ApplySortAndPage(query, effectiveFilter).Select(ToRequestDto()).ToListAsync();
        return new PagedResultDto<RequestDto>(items, effectiveFilter.PageNumber, effectiveFilter.PageSize, total);
    }

    public async Task<RequestDto?> GetRequestByIdAsync(int id, int userId, string role)
    {
        var query = _db.Requests.AsNoTracking().Include(r => r.Category).Where(r => r.Id == id);
        if (role == "Employee")
        {
            query = query.Where(r => r.EmployeeId == userId);
        }
        else if (role == "Manager")
        {
            var teamIds = await GetTeamMemberIdsAsync(userId);
            query = query.Where(r => teamIds.Contains(r.EmployeeId));
        }

        return await query.Select(ToRequestDto()).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<StatusHistoryDto>> GetStatusHistoryByRequestAsync(int requestId, int userId, string role)
    {
        var request = await GetRequestByIdAsync(requestId, userId, role);
        if (request == null)
        {
            throw new InvalidOperationException("Request not found");
        }

        return await _db.StatusHistory
            .AsNoTracking()
            .Where(h => h.RequestId == requestId)
            .OrderBy(h => h.ChangedAt)
            .Select(h => new StatusHistoryDto(
                h.Id, h.RequestId, h.FromStatus, h.ToStatus, h.ChangedBy, h.Remarks, h.ChangedAt))
            .ToListAsync();
    }

    public async Task<RequestDto> ResubmitRejectedRequestAsync(int requestId, int employeeId)
    {
        var request = await _db.Requests
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.EmployeeId == employeeId)
            ?? throw new InvalidOperationException("Request not found");

        if (request.Status != RequestStatus.Rejected)
        {
            throw new InvalidOperationException("Only rejected requests can be resubmitted");
        }

        var from = request.Status;
        request.Status = RequestStatus.Submitted;
        request.UpdatedBy = employeeId.ToString();
        request.UpdatedDate = DateTime.UtcNow;

        _db.StatusHistory.Add(new StatusHistory
        {
            RequestId = request.Id,
            FromStatus = from,
            ToStatus = RequestStatus.Submitted,
            ChangedBy = employeeId.ToString(),
            Remarks = "Employee resubmitted rejected request",
            ChangedAt = DateTime.UtcNow,
            CreatedBy = employeeId.ToString(),
            CreatedDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return new RequestDto(
            request.Id, request.EmployeeId, request.Subject, request.Description, request.Amount,
            request.CategoryId, request.Category.Name, request.DateOfExpense, request.CreatedAt, request.Status
        );
    }

    public async Task<ApprovedDto> ApproveRequestAsync(int requestId, int managerId, string managerName, ApproveRequestDto dto)
    {
        var teamIds = await GetTeamMemberIdsAsync(managerId);
        var request = await _db.Requests.FirstOrDefaultAsync(r => r.Id == requestId && teamIds.Contains(r.EmployeeId))
            ?? throw new InvalidOperationException("Request not found for manager team");

        if (request.Status != RequestStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requests can be approved");
        }

        await using var tx = await _db.Database.BeginTransactionAsync();
        var from = request.Status;
        request.Status = RequestStatus.Approved;
        request.UpdatedBy = managerName;
        request.UpdatedDate = DateTime.UtcNow;

        _db.ApprovedItems.Add(new Approved
        {
            RequestId = requestId,
            TotalAmount = request.Amount,
            CategoryId = request.CategoryId,
            Status = ApprovedStatus.Pending,
            CreatedBy = managerName,
            CreatedDate = DateTime.UtcNow
        });

        _db.StatusHistory.Add(new StatusHistory
        {
            RequestId = request.Id,
            FromStatus = from,
            ToStatus = RequestStatus.Approved,
            ChangedBy = managerName,
            Remarks = dto.Comments,
            ChangedAt = DateTime.UtcNow,
            CreatedBy = managerName,
            CreatedDate = DateTime.UtcNow
        });

        try
        {
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent approval/rejection detected. Refresh and retry.");
        }

        var approved = await _db.ApprovedItems.OrderByDescending(a => a.Id).FirstAsync(a => a.RequestId == requestId);
        return new ApprovedDto(approved.Id, approved.RequestId, approved.TotalAmount, approved.CategoryId, approved.Status);
    }

    public async Task<RejectedDto> RejectRequestAsync(int requestId, int managerId, RejectRequestDto dto)
    {
        var teamIds = await GetTeamMemberIdsAsync(managerId);
        var request = await _db.Requests.FirstOrDefaultAsync(r => r.Id == requestId && teamIds.Contains(r.EmployeeId))
            ?? throw new InvalidOperationException("Request not found for manager team");

        if (request.Status != RequestStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requests can be rejected");
        }

        await using var tx = await _db.Database.BeginTransactionAsync();
        var from = request.Status;
        request.Status = RequestStatus.Rejected;
        request.UpdatedBy = managerId.ToString();
        request.UpdatedDate = DateTime.UtcNow;

        var rejected = new Rejected
        {
            RequestId = requestId,
            ManagerId = managerId,
            Comment = dto.Comment.Trim(),
            CreatedBy = managerId.ToString(),
            CreatedDate = DateTime.UtcNow
        };

        _db.RejectedItems.Add(rejected);
        _db.StatusHistory.Add(new StatusHistory
        {
            RequestId = request.Id,
            FromStatus = from,
            ToStatus = RequestStatus.Rejected,
            ChangedBy = managerId.ToString(),
            Remarks = dto.Comment,
            ChangedAt = DateTime.UtcNow,
            CreatedBy = managerId.ToString(),
            CreatedDate = DateTime.UtcNow
        });

        try
        {
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent approval/rejection detected. Refresh and retry.");
        }

        return new RejectedDto(rejected.Id, rejected.RequestId, rejected.ManagerId, rejected.Comment);
    }

    public async Task<FinanceStatusDto> ProcessPaymentAsync(int requestId, string processedBy, FinancePaymentDto dto)
    {
        var request = await _db.Requests.FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new InvalidOperationException("Request not found");

        if (request.Status != RequestStatus.Approved)
        {
            throw new InvalidOperationException("Finance can only pay manager-approved requests");
        }

        await using var tx = await _db.Database.BeginTransactionAsync();
        var from = request.Status;
        request.Status = RequestStatus.Paid;
        request.UpdatedBy = processedBy;
        request.UpdatedDate = DateTime.UtcNow;

        var approved = await _db.ApprovedItems.FirstOrDefaultAsync(a => a.RequestId == requestId);
        if (approved != null)
        {
            approved.Status = ApprovedStatus.Paid;
            approved.UpdatedBy = processedBy;
            approved.UpdatedDate = DateTime.UtcNow;
        }

        var financeStatus = new FinanceStatus
        {
            RequestId = requestId,
            Status = FinanceStatusEnum.Paid,
            ProcessedBy = processedBy,
            PaymentDate = DateTime.UtcNow,
            CreatedBy = processedBy,
            CreatedDate = DateTime.UtcNow
        };

        _db.FinanceStatuses.Add(financeStatus);
        _db.StatusHistory.Add(new StatusHistory
        {
            RequestId = request.Id,
            FromStatus = from,
            ToStatus = RequestStatus.Paid,
            ChangedBy = processedBy,
            Remarks = dto.Notes,
            ChangedAt = DateTime.UtcNow,
            CreatedBy = processedBy,
            CreatedDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return new FinanceStatusDto(financeStatus.Id, financeStatus.RequestId, financeStatus.Status, financeStatus.ProcessedBy, financeStatus.PaymentDate);
    }

    public async Task<IEnumerable<MonthlyExpenseSummaryDto>> GetMonthlyExpenseSummaryAsync(int year, int month)
    {
        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        return await _db.Requests
            .AsNoTracking()
            .Include(r => r.Category)
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end && r.Status != RequestStatus.Rejected)
            .GroupBy(r => new { r.CategoryId, r.Category.Name })
            .Select(g => new MonthlyExpenseSummaryDto(year, month, g.Key.CategoryId, g.Key.Name, g.Sum(x => x.Amount), g.Count()))
            .OrderBy(x => x.CategoryName)
            .ToListAsync();
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(int year, int month)
    {
        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);
        var monthlyTotal = await _db.Requests
            .AsNoTracking()
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end && r.Status != RequestStatus.Rejected)
            .SumAsync(r => (decimal?)r.Amount) ?? 0m;

        var pendingApprovals = await _db.Requests
            .AsNoTracking()
            .CountAsync(r => r.Status == RequestStatus.Submitted);

        var byCategory = (await GetMonthlyExpenseSummaryAsync(year, month)).ToList();

        var topClaims = await _db.Requests
            .AsNoTracking()
            .Include(r => r.Category)
            .Where(r => r.CreatedAt >= start && r.CreatedAt < end)
            .OrderByDescending(r => r.Amount)
            .Take(5)
            .Select(ToRequestDto())
            .ToListAsync();

        return new DashboardStatsDto(monthlyTotal, pendingApprovals, byCategory, topClaims);
    }

    private async Task ValidateCategoryAsync(int categoryId)
    {
        var active = await _db.ExpenseCategories.AnyAsync(c => c.Id == categoryId && c.IsActive);
        if (!active)
        {
            throw new InvalidOperationException("Invalid or inactive category");
        }
    }

    private async Task<List<int>> GetTeamMemberIdsAsync(int managerId)
    {
        return await _db.Employees
            .AsNoTracking()
            .Where(e => e.ManagerId == managerId)
            .Select(e => e.Id)
            .ToListAsync();
    }

    private static IQueryable<Request> ApplyRequestFilter(IQueryable<Request> query, RequestFilterDto filter)
    {
        if (filter.FromDate.HasValue)
        {
            query = query.Where(r => r.CreatedAt >= filter.FromDate.Value.Date);
        }

        if (filter.ToDate.HasValue)
        {
            var inclusiveEnd = filter.ToDate.Value.Date.AddDays(1);
            query = query.Where(r => r.CreatedAt < inclusiveEnd);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(r => r.Status == filter.Status.Value);
        }

        if (filter.EmployeeId.HasValue)
        {
            query = query.Where(r => r.EmployeeId == filter.EmployeeId.Value);
        }

        return query;
    }

    private static IQueryable<Request> ApplySortAndPage(IQueryable<Request> query, RequestFilterDto filter)
    {
        var sortBy = (filter.SortBy ?? "date").Trim().ToLowerInvariant();
        var desc = !string.Equals(filter.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);

        query = (sortBy, desc) switch
        {
            ("amount", true) => query.OrderByDescending(r => r.Amount),
            ("amount", false) => query.OrderBy(r => r.Amount),
            ("date", false) => query.OrderBy(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };

        var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
        var pageSize = filter.PageSize is < 1 or > 200 ? 20 : filter.PageSize;
        return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
    }

    private static Expression<Func<Draft, DraftDto>> ToDraftDto()
    {
        return d => new DraftDto(
            d.Id, d.EmployeeId, d.Subject, d.Description, d.Amount, d.CategoryId,
            d.Category.Name, d.DateOfExpense, d.DraftDate
        );
    }

    private static Expression<Func<Request, RequestDto>> ToRequestDto()
    {
        return r => new RequestDto(
            r.Id, r.EmployeeId, r.Subject, r.Description, r.Amount, r.CategoryId,
            r.Category.Name, r.DateOfExpense, r.CreatedAt, r.Status
        );
    }
}
