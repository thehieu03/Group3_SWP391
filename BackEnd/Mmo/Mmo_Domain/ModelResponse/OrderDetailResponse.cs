namespace Mmo_Domain.ModelResponse;

public class OrderDetailResponse
{
    public int OrderId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductVariantName { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? Payload { get; set; }
    public List<AccountStorageInfo>? Accounts { get; set; }
}

public class AccountStorageInfo
{
    public int StorageId { get; set; }
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public bool Status { get; set; }
}

