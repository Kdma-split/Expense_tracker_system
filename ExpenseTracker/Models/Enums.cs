namespace ExpenseTracker.Models;

public enum ExpenseCategory
{
    Travel = 0,
    Food = 1,
    Certifications = 2,
    Miscellaneous = 3,
    Training = 4,
    Equipment = 5,
    Software = 6
}

public enum RequestStatus
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Rejected = 3,
    Paid = 4
}

public enum FinanceStatusEnum
{
    Pending = 0,
    Paid = 1,
    Rejected = 2
}

public enum ApprovedStatus
{
    Pending = 0,
    Paid = 1
}
