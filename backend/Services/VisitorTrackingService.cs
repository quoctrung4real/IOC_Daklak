using System.Collections.Concurrent;

namespace Backend.Services;

public class VisitorTrackingService
{
    private readonly ConcurrentDictionary<string, (DateTime LastSeen, bool IsBot)> _activeVisitors = new();
    private readonly TimeSpan _activeTimeout = TimeSpan.FromMinutes(5);

    public void UpdateVisitor(string visitorId, bool isBot)
    {
        _activeVisitors[visitorId] = (DateTime.UtcNow, isBot);
        Cleanup();
    }

    public (int ActiveTotal, int ActiveBots, int ActiveGuests) GetActiveCounts()
    {
        Cleanup();
        
        var now = DateTime.UtcNow;
        var active = _activeVisitors.Values.Where(v => now - v.LastSeen <= _activeTimeout).ToList();
        
        var total = active.Count;
        var bots = active.Count(v => v.IsBot);
        var guests = total - bots;

        return (total, bots, guests);
    }

    private void Cleanup()
    {
        var now = DateTime.UtcNow;
        var expiredKeys = _activeVisitors
            .Where(kvp => now - kvp.Value.LastSeen > _activeTimeout)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _activeVisitors.TryRemove(key, out _);
        }
    }
}
