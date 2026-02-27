using ExpenseTracker.Models;

namespace ExpenseTracker.Data;

public static class DbInitializer
{
    public static void Initialize(ExpenseDbContext context)
    {
        // User requested to discard old data and reseed realistic dummy data.
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        var now = DateTime.UtcNow;

        var categories = SeedCategories(context, now);
        var uncategorizedId = categories["Uncategorized"];
        var categoryPool = categories.Where(kv => kv.Key != "Uncategorized").Select(kv => kv.Value).ToList();

        var admin = AddEmployee(context, "Admin User", "Admin", "Administration", null, now);
        var finance = AddEmployee(context, "Finance User", "Finance", "Finance", null, now);

        var managers = new List<Employee>();
        var managerNames = new[]
        {
            "Amit Sharma",
            "Neha Verma",
            "Rajiv Menon",
            "Priya Nair",
            "Sandeep Kulkarni"
        };

        for (var i = 1; i <= 5; i++)
        {
            managers.Add(AddEmployee(context, managerNames[i - 1], "Manager", i % 2 == 0 ? "Operations" : "Engineering", null, now));
        }

        var employees = new List<Employee>();
        var employeeNames = new[]
        {
            "Rohit Gupta",
            "Ananya Singh",
            "Vikram Rao",
            "Sneha Iyer",
            "Arjun Patel",
            "Kavya Reddy",
            "Nitin Joshi",
            "Pooja Bansal",
            "Harsh Vardhan",
            "Meera Krishnan",
            "Karthik Subramanian",
            "Ishita Choudhary",
            "Yash Malhotra",
            "Divya Bhatt",
            "Rakesh Tiwari",
            "Nandini Deshpande",
            "Abhishek Srivastava",
            "Shreya Kapoor",
            "Manish Agarwal",
            "Deepika Soni",
            "Tarun Jain",
            "Bhavna Mishra"
        };

        for (var i = 1; i <= 22; i++)
        {
            var manager = managers[(i - 1) % managers.Count];
            var department = i % 3 == 0 ? "Sales" : (i % 3 == 1 ? "Engineering" : "Operations");
            employees.Add(AddEmployee(context, employeeNames[i - 1], "Employee", department, manager.Id, now));
        }

        SeedProfiles(context, admin, finance, managers, employees, now);
        SeedDrafts(context, employees, uncategorizedId, now);
        SeedRequestsAndWorkflowData(context, employees, managers, finance, categoryPool, now);

        context.SaveChanges();
    }

    private static Dictionary<string, int> SeedCategories(ExpenseDbContext context, DateTime now)
    {
        var names = new[]
        {
            "Travel",
            "Food",
            "Certifications",
            "Miscellaneous",
            "Training",
            "Equipment",
            "Software",
            "Uncategorized"
        };

        foreach (var name in names)
        {
            context.ExpenseCategories.Add(new ExpenseCategoryConfig
            {
                Name = name,
                IsActive = true,
                CreatedBy = "System",
                CreatedDate = now
            });
        }

        context.SaveChanges();
        return context.ExpenseCategories.ToDictionary(x => x.Name, x => x.Id);
    }

    private static Employee AddEmployee(
        ExpenseDbContext context,
        string name,
        string role,
        string department,
        int? managerId,
        DateTime now)
    {
        var employee = new Employee
        {
            Name = name,
            Role = role,
            Department = department,
            ManagerId = managerId,
            IsActive = true,
            CreatedBy = "System",
            CreatedDate = now
        };

        context.Employees.Add(employee);
        context.SaveChanges();
        return employee;
    }

    private static void SeedProfiles(
        ExpenseDbContext context,
        Employee admin,
        Employee finance,
        IReadOnlyList<Employee> managers,
        IReadOnlyList<Employee> employees,
        DateTime now)
    {
        const string defaultPassword = "Pass@123";

        context.EmployeeProfiles.Add(new EmployeeProfile
        {
            EmployeeId = admin.Id,
            Email = "admin@gyansys.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
            CreatedBy = "System",
            CreatedDate = now
        });

        context.EmployeeProfiles.Add(new EmployeeProfile
        {
            EmployeeId = finance.Id,
            Email = "finance@gyansys.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
            CreatedBy = "System",
            CreatedDate = now
        });

        for (var i = 0; i < managers.Count; i++)
        {
            var managerEmail = ToCorporateEmail(managers[i].Name);
            context.EmployeeProfiles.Add(new EmployeeProfile
            {
                EmployeeId = managers[i].Id,
                Email = managerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                CreatedBy = "System",
                CreatedDate = now
            });
        }

        for (var i = 0; i < employees.Count; i++)
        {
            var employeeEmail = ToCorporateEmail(employees[i].Name);
            context.EmployeeProfiles.Add(new EmployeeProfile
            {
                EmployeeId = employees[i].Id,
                Email = employeeEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                CreatedBy = "System",
                CreatedDate = now
            });
        }

        context.SaveChanges();
    }

    private static void SeedDrafts(
        ExpenseDbContext context,
        IReadOnlyList<Employee> employees,
        int uncategorizedId,
        DateTime now)
    {
        for (var i = 0; i < 10; i++)
        {
            var employee = employees[i];
            context.Drafts.Add(new Draft
            {
                EmployeeId = employee.Id,
                Subject = $"Draft Expense {i + 1}",
                Description = $"Draft claim description {i + 1}",
                Amount = 100 + (i * 37),
                CategoryId = uncategorizedId,
                DateOfExpense = now.AddDays(-(i + 1)).Date,
                DraftDate = now.AddDays(-i),
                CreatedBy = employee.Id.ToString(),
                CreatedDate = now.AddDays(-i)
            });
        }

        context.SaveChanges();
    }

    private static void SeedRequestsAndWorkflowData(
        ExpenseDbContext context,
        IReadOnlyList<Employee> employees,
        IReadOnlyList<Employee> managers,
        Employee finance,
        IReadOnlyList<int> categoryPool,
        DateTime now)
    {
        var requestTemplates = new (string Subject, string Description)[]
        {
            ("Client Visit Travel Reimbursement", "Flight and local cab expenses for client meeting in Bengaluru."),
            ("Team Lunch Reimbursement", "Project milestone team lunch with itemized bill attached."),
            ("Software Subscription Renewal", "Renewal of design and collaboration software used for delivery."),
            ("Home Office Keyboard Purchase", "Ergonomic keyboard purchased for work-from-home setup."),
            ("Training Workshop Fee", "Data analytics workshop registration fee reimbursement."),
            ("Airport Transfer Charges", "Cab fare for airport pickup and drop during official travel."),
            ("Hotel Stay for Onsite Meeting", "One-night stay for onsite client workshop."),
            ("Certification Exam Fee", "Cloud certification exam fee paid by employee."),
            ("Project Equipment Reimbursement", "Portable monitor purchased for project demonstrations."),
            ("Business Dinner Claim", "Client dinner expense during quarterly review."),
            ("Intercity Bus Travel Claim", "Bus tickets for site visit in neighboring city."),
            ("Internet Dongle Purchase", "Backup internet dongle for remote work continuity."),
            ("Office Supplies Reimbursement", "Notebooks and stationery procured for sprint planning."),
            ("Conference Registration Expense", "Registration for industry technology conference."),
            ("Local Commute Expense", "Metro and auto charges for client office commute."),
            ("Printer Cartridge Purchase", "Printer cartridge bought for documentation needs."),
            ("Technical Book Reimbursement", "Reference books purchased for architecture work."),
            ("Workshop Travel Meal Claim", "Meals and local transport during two-day workshop.")
        };

        var statuses = new[]
        {
            RequestStatus.Submitted,
            RequestStatus.Approved,
            RequestStatus.Rejected,
            RequestStatus.Paid
        };

        var requestIndex = 0;
        foreach (var employee in employees.Take(18))
        {
            var status = statuses[requestIndex % statuses.Length];
            var managerId = employee.ManagerId ?? managers[0].Id;
            var managerName = managers.FirstOrDefault(m => m.Id == managerId)?.Name ?? "Manager";
            var categoryId = categoryPool[requestIndex % categoryPool.Count];
            var template = requestTemplates[requestIndex % requestTemplates.Length];

            var request = new Request
            {
                EmployeeId = employee.Id,
                Subject = template.Subject,
                Description = template.Description,
                Amount = 150 + (requestIndex * 55),
                CategoryId = status == RequestStatus.Paid ? categoryId : null,
                DateOfExpense = now.AddDays(-(requestIndex + 2)).Date,
                CreatedAt = now.AddDays(-(requestIndex + 1)),
                Status = status,
                CreatedBy = employee.Id.ToString(),
                CreatedDate = now.AddDays(-(requestIndex + 1))
            };

            context.Requests.Add(request);
            context.SaveChanges();

            context.StatusHistory.Add(new StatusHistory
            {
                RequestId = request.Id,
                FromStatus = RequestStatus.Draft,
                ToStatus = RequestStatus.Submitted,
                ChangedBy = employee.Id.ToString(),
                Remarks = "Seeded submission",
                ChangedAt = request.CreatedAt,
                CreatedBy = "System",
                CreatedDate = request.CreatedAt
            });

            if (status == RequestStatus.Approved || status == RequestStatus.Paid)
            {
                context.ApprovedItems.Add(new Approved
                {
                    RequestId = request.Id,
                    TotalAmount = request.Amount,
                    CategoryId = status == RequestStatus.Paid ? categoryId : categoryPool[(requestIndex + 1) % categoryPool.Count],
                    Status = status == RequestStatus.Paid ? ApprovedStatus.Paid : ApprovedStatus.Pending,
                    CreatedBy = managerName,
                    CreatedDate = request.CreatedAt.AddHours(2),
                    UpdatedBy = status == RequestStatus.Paid ? finance.Name : null,
                    UpdatedDate = status == RequestStatus.Paid ? request.CreatedAt.AddDays(1) : null
                });

                context.StatusHistory.Add(new StatusHistory
                {
                    RequestId = request.Id,
                    FromStatus = RequestStatus.Submitted,
                    ToStatus = RequestStatus.Approved,
                    ChangedBy = managerName,
                    Remarks = "Approved by manager",
                    ChangedAt = request.CreatedAt.AddHours(2),
                    CreatedBy = "System",
                    CreatedDate = request.CreatedAt.AddHours(2)
                });
            }

            if (status == RequestStatus.Rejected)
            {
                context.RejectedItems.Add(new Rejected
                {
                    RequestId = request.Id,
                    ManagerId = managerId,
                    Comment = "Rejected due to missing justification",
                    CreatedBy = managerId.ToString(),
                    CreatedDate = request.CreatedAt.AddHours(3)
                });

                context.StatusHistory.Add(new StatusHistory
                {
                    RequestId = request.Id,
                    FromStatus = RequestStatus.Submitted,
                    ToStatus = RequestStatus.Rejected,
                    ChangedBy = managerId.ToString(),
                    Remarks = "Rejected by manager",
                    ChangedAt = request.CreatedAt.AddHours(3),
                    CreatedBy = "System",
                    CreatedDate = request.CreatedAt.AddHours(3)
                });
            }

            if (status == RequestStatus.Paid)
            {
                context.FinanceStatuses.Add(new FinanceStatus
                {
                    RequestId = request.Id,
                    Status = FinanceStatusEnum.Paid,
                    ProcessedBy = finance.Name,
                    PaymentDate = request.CreatedAt.AddDays(1),
                    CreatedBy = finance.Name,
                    CreatedDate = request.CreatedAt.AddDays(1)
                });

                context.StatusHistory.Add(new StatusHistory
                {
                    RequestId = request.Id,
                    FromStatus = RequestStatus.Approved,
                    ToStatus = RequestStatus.Paid,
                    ChangedBy = finance.Name,
                    Remarks = "Paid by finance",
                    ChangedAt = request.CreatedAt.AddDays(1),
                    CreatedBy = "System",
                    CreatedDate = request.CreatedAt.AddDays(1)
                });
            }

            context.SaveChanges();
            requestIndex++;
        }
    }

    private static string ToCorporateEmail(string name)
    {
        var parts = name
            .ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 0)
        {
            return "user@gyansys.com";
        }

        if (parts.Length == 1)
        {
            return $"{parts[0]}@gyansys.com";
        }

        return $"{parts[0]}.{parts[^1]}@gyansys.com";
    }
}
