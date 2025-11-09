namespace Mmo_Application.Services.Interface;

public interface ISupportticketServices : IBaseServices<Supportticket>
{
    Task<(IEnumerable<Supportticket> items, int total)> GetPagedAsync(
        int page,
        int limit,
        string? search,
        string? status,
        DateTime? from,
        DateTime? to,
        int? accountId);

    Task<Supportticket?> GetByIdWithAccountAsync(int id);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<(int total, int pending, int processing, int closed)> GetStatsAsync();
    Task<bool> ReplyAsync(int id, string message, int adminAccountId);
    IQueryable<Supportticket> GetQueryableWithAccount();
}
