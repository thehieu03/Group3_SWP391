using System.Text.Json.Serialization;

namespace Mmo_Application.Services.Interface;

public interface ISePayService
{
    Task<List<SePayTransaction>> GetTransactionsAsync(DateTime fromDate, DateTime toDate);
    Task<bool> VerifyTransactionAsync(string referenceCode, decimal amount, DateTime createdAt);
}

public class SePayTransaction
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }
    
    [JsonPropertyName("bank_brand_name")]
    public string? BankBrandName { get; set; }
    
    [JsonPropertyName("account_number")]
    public string? AccountNumber { get; set; }
    
    [JsonPropertyName("transaction_date")]
    public string? TransactionDate { get; set; }
    
    [JsonPropertyName("amount_out")]
    public string? AmountOut { get; set; }
    
    [JsonPropertyName("amount_in")]
    public string? AmountIn { get; set; }
    
    [JsonPropertyName("accumulated")]
    public string? Accumulated { get; set; }
    
    [JsonPropertyName("transaction_content")]
    public string? TransactionContent { get; set; }
    
    [JsonPropertyName("reference_number")]
    public string? ReferenceNumber { get; set; }
    
    [JsonPropertyName("code")]
    public string? Code { get; set; }
    
    [JsonPropertyName("sub_account")]
    public string? SubAccount { get; set; }
    
    [JsonPropertyName("bank_account_id")]
    public string? BankAccountId { get; set; }
}

