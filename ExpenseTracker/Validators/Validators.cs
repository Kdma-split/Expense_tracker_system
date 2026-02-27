using FluentValidation;
using ExpenseTracker.DTOs;

namespace ExpenseTracker.Validators;

// ============ Auth Validators ============

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

// ============ Draft Validators ============

public class CreateDraftValidator : AbstractValidator<CreateDraftDto>
{
    public CreateDraftValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero");
        RuleFor(x => x.DateOfExpense)
            .LessThanOrEqualTo(DateTime.UtcNow.Date.AddDays(1))
            .WithMessage("Date of expense cannot be in the future");
    }
}

public class UpdateDraftValidator : AbstractValidator<UpdateDraftDto>
{
    public UpdateDraftValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero");
        RuleFor(x => x.DateOfExpense)
            .LessThanOrEqualTo(DateTime.UtcNow.Date.AddDays(1))
            .WithMessage("Date of expense cannot be in the future");
    }
}


// ============ Request Validators ============

public class ApproveRequestValidator : AbstractValidator<ApproveRequestDto>
{
    public ApproveRequestValidator()
    {
        RuleFor(x => x.RequestId).GreaterThan(0);
    }
}

public class RejectRequestValidator : AbstractValidator<RejectRequestDto>
{
    public RejectRequestValidator()
    {
        RuleFor(x => x.RequestId).GreaterThan(0);
        RuleFor(x => x.Comment).NotEmpty().WithMessage("Rejection comment is mandatory")
            .MaximumLength(1000);
    }
}


// ============ Finance Validators ============

public class FinancePaymentValidator : AbstractValidator<FinancePaymentDto>
{
    public FinancePaymentValidator()
    {
        RuleFor(x => x.RequestId).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}

public class UpdateRequestCategoryValidator : AbstractValidator<UpdateRequestCategoryDto>
{
    public UpdateRequestCategoryValidator()
    {
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Remarks).MaximumLength(1000);
    }
}

public class CreateExpenseCategoryValidator : AbstractValidator<CreateExpenseCategoryDto>
{
    public CreateExpenseCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateExpenseCategoryValidator : AbstractValidator<UpdateExpenseCategoryDto>
{
    public UpdateExpenseCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class CreateEmployeeByAdminValidator : AbstractValidator<CreateEmployeeByAdminDto>
{
    public CreateEmployeeByAdminValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty().Must(r => r is "Employee" or "Manager")
            .WithMessage("Role must be Employee or Manager");
    }
}

public class UpdateEmployeeByAdminValidator : AbstractValidator<UpdateEmployeeByAdminDto>
{
    public UpdateEmployeeByAdminValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty().Must(r => r is "Employee" or "Manager")
            .WithMessage("Role must be Employee or Manager");
        RuleFor(x => x.Password!).MinimumLength(6).When(x => !string.IsNullOrWhiteSpace(x.Password));
    }
}
