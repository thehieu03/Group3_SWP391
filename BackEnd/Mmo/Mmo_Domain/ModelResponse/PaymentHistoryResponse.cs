namespace Mmo_Domain.ModelResponse;

public class PaymentHistoryResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = null!;
    public decimal Amount { get; set; }
    public string PaymentDescription { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class PaymentHistorySummary
{
    public decimal TotalBalance { get; set; }
    public List<PaymentHistoryResponse> Transactions { get; set; } = new();
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public int ItemsPerPage { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}
