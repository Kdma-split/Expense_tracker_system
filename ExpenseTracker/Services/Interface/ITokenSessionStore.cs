namespace ExpenseTracker.Services;

public interface ITokenSessionStore
{
    bool TryCreateSession(int employeeId, string jti, DateTime expiresAtUtc);
    bool IsSessionValid(int employeeId, string jti);
    void RemoveSession(int employeeId, string? jti = null);
}
