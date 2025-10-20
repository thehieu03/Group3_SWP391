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
}
