using System.Collections.Concurrent;

namespace ExpenseTracker.Services;

public class TokenSessionStore : ITokenSessionStore
{
    private readonly ConcurrentDictionary<int, SessionInfo> _sessions = new();

    public bool TryCreateSession(int employeeId, string jti, DateTime expiresAtUtc)
    {
        CleanupExpired();

        if (_sessions.TryGetValue(employeeId, out var existing) && existing.ExpiresAtUtc > DateTime.UtcNow)
        {
            return false;
        }

        _sessions[employeeId] = new SessionInfo(jti, expiresAtUtc);
        return true;
    }

    public bool IsSessionValid(int employeeId, string jti)
    {
        CleanupExpired();

        return _sessions.TryGetValue(employeeId, out var info)
               && info.Jti == jti
               && info.ExpiresAtUtc > DateTime.UtcNow;
    }

    public void RemoveSession(int employeeId, string? jti = null)
    {
        if (jti == null)
        {
            _sessions.TryRemove(employeeId, out _);
            return;
        }

        if (_sessions.TryGetValue(employeeId, out var existing) && existing.Jti == jti)
        {
            _sessions.TryRemove(employeeId, out _);
        }
    }

    private void CleanupExpired()
    {
        var now = DateTime.UtcNow;
        foreach (var kvp in _sessions)
        {
            if (kvp.Value.ExpiresAtUtc <= now)
            {
                _sessions.TryRemove(kvp.Key, out _);
            }
        }
    }

    private sealed record SessionInfo(string Jti, DateTime ExpiresAtUtc);
}
