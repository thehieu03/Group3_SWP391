namespace Mmo_Application.Services;

public class SupportticketServices : BaseServices<Supportticket>, ISupportticketServices
{
    public SupportticketServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<(IEnumerable<Supportticket> items, int total)> GetPagedAsync(
        int page, int limit, string? search, string? status, DateTime? from, DateTime? to, int? accountId)
    {
        var query = _unitOfWork.GenericRepository<Supportticket>()
            .Get(includeProperties: "Account");

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => (t.Title ?? "").Contains(search)
                                      || (t.Content ?? "").Contains(search)
                                      || (t.Email ?? "").Contains(search));
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }
        if (from.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= from.Value);
        }
        if (to.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= to.Value);
        }
        if (accountId.HasValue)
        {
            query = query.Where(t => t.AccountId == accountId.Value);
        }

        var total = query.Count();
        var skip = (page - 1) * limit;
        var items = query.OrderByDescending(t => t.CreatedAt)
            .Skip(skip).Take(limit).ToList();

        return (items, total);
    }

    public async Task<Supportticket?> GetByIdWithAccountAsync(int id)
    {
        var query = _unitOfWork.GenericRepository<Supportticket>()
            .Get(t => t.Id == id, includeProperties: "Account");
        return await query.FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var ticket = await GetByIdAsync(id);
        if (ticket == null) return false;
        ticket.Status = status;
        return await _unitOfWork.SaveChangeAsync() > 0;
    }

    public async Task<(int total, int pending, int processing, int closed)> GetStatsAsync()
    {
        var all = (await GetAllAsync()).ToList();
        var total = all.Count;
        var pending = all.Count(t => t.Status == "PENDING");
        var processing = all.Count(t => t.Status == "PROCESSING");
        var closed = all.Count(t => t.Status == "CLOSED");
        return (total, pending, processing, closed);
    }

    public Task<bool> ReplyAsync(int id, string message, int adminAccountId)
    {
        // Hiện chưa có bảng log hội thoại; có thể tích hợp sau
        return Task.FromResult(true);
    }

    public IQueryable<Supportticket> GetQueryableWithAccount()
    {
        return _unitOfWork.GenericRepository<Supportticket>()
            .Get(includeProperties: "Account");
    }
}