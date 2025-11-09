namespace Mmo_Domain.ModelResponse;

public class DepositResponse
{
    public int TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

public class DepositStatusResponse
{
    public int TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? ReferenceCode { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class VerifyDepositResponse
{
    public int TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Processed { get; set; }
}

