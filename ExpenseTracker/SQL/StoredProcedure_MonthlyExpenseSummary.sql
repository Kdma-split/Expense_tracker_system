-- Stored Procedure for Monthly Expense Summary by Category
-- Run this in your SQL Server database

IF OBJECT_ID('sp_GetMonthlyExpenseSummary', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetMonthlyExpenseSummary;
GO

CREATE PROCEDURE sp_GetMonthlyExpenseSummary
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        YEAR(r.CreatedAt) AS Year,
        MONTH(r.CreatedAt) AS Month,
        r.CategoryId,
        c.Name AS CategoryName,
        SUM(r.Amount) AS TotalAmount,
        COUNT(r.Id) AS RequestCount
    FROM Requests r
    INNER JOIN ExpenseCategories c ON c.Id = r.CategoryId
    WHERE YEAR(r.CreatedAt) = @Year 
        AND MONTH(r.CreatedAt) = @Month
    GROUP BY YEAR(r.CreatedAt), MONTH(r.CreatedAt), r.CategoryId, c.Name
    ORDER BY c.Name;
END
GO
