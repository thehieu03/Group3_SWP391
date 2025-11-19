using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mmo_Application.Services.Interface;

namespace Mmo_Application.Services;

public class SePayService : ISePayService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SePayService> _logger;

    public SePayService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<SePayService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    private HttpClient CreateHttpClient()
    {
        var httpClient = _httpClientFactory.CreateClient();
        var apiKey = _configuration["SePay:ApiKey"] ?? "";
        var apiUrl = _configuration["SePay:ApiUrl"] ?? "https://my.sepay.vn/userapi/";
        
        if (!apiUrl.EndsWith("/"))
        {
            apiUrl += "/";
        }
        
        httpClient.BaseAddress = new Uri(apiUrl);
        
        if (!string.IsNullOrEmpty(apiKey))
        {
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }
        
        return httpClient;
    }

    public async Task<List<SePayTransaction>> GetTransactionsAsync(DateTime fromDate, DateTime toDate)
    {
        using var httpClient = CreateHttpClient();
        try
        {
            var accountNumber = _configuration["SePay:AccountNumber"] ?? "";
            
            var queryParams = new List<string>();
            if (!string.IsNullOrEmpty(accountNumber))
            {
                queryParams.Add($"account_number={Uri.EscapeDataString(accountNumber)}");
            }
            queryParams.Add($"transaction_date_min={fromDate:yyyy-MM-dd}");
            queryParams.Add($"transaction_date_max={toDate:yyyy-MM-dd}");
            queryParams.Add("limit=5000");
            
            var queryString = string.Join("&", queryParams);
            var endpoint = $"transactions/list?{queryString}";
            
            var response = await httpClient.GetAsync(endpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var jsonContent = await response.Content.ReadAsStringAsync();
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var result = JsonSerializer.Deserialize<SePayApiResponse>(jsonContent, options);
                
                if (result?.Status == 200 && result.Transactions != null)
                {
                    return result.Transactions;
                }
                
                return new List<SePayTransaction>();
            }
            
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.LogError("SePay API authentication failed (401 Unauthorized)");
            }
            
            return new List<SePayTransaction>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching transactions from SePay");
            return new List<SePayTransaction>();
        }
    }

    public async Task<bool> VerifyTransactionAsync(string referenceCode, decimal amount, DateTime createdAt)
    {
        var fromDate = createdAt.AddHours(-2);
        var toDate = DateTime.Now;
        
        return await VerifyTransactionAsync(referenceCode, amount, fromDate, toDate);
    }

    /// <summary>
    /// Verify transaction bằng cách query SePay API và match với reference code + amount
    /// Sử dụng cùng logic match như PaymentPollingService: exact match, partial match, content match
    /// </summary>
    private async Task<bool> VerifyTransactionAsync(string referenceCode, decimal amount, DateTime fromDate, DateTime toDate)
    {
        using var httpClient = CreateHttpClient();
        try
        {
            var accountNumber = _configuration["SePay:AccountNumber"] ?? "";
            
            var queryParams = new List<string>();
            if (!string.IsNullOrEmpty(accountNumber))
            {
                queryParams.Add($"account_number={Uri.EscapeDataString(accountNumber)}");
            }
            queryParams.Add($"transaction_date_min={fromDate:yyyy-MM-dd}");
            queryParams.Add($"transaction_date_max={toDate:yyyy-MM-dd}");
            queryParams.Add("limit=5000");
            
            var queryString = string.Join("&", queryParams);
            var endpoint = $"transactions/list?{queryString}";
            
            var response = await httpClient.GetAsync(endpoint);
            
            // Xử lý rate limit: SePay trả về header x-sepay-userapi-retry-after với số giây cần đợi
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                var retryAfterHeader = response.Headers.GetValues("x-sepay-userapi-retry-after").FirstOrDefault();
                var retryAfterSeconds = 1;
                
                if (!string.IsNullOrEmpty(retryAfterHeader) && int.TryParse(retryAfterHeader, out var retryAfterValue))
                {
                    retryAfterSeconds = retryAfterValue;
                }
                
                await Task.Delay(TimeSpan.FromSeconds(retryAfterSeconds));
                response = await httpClient.GetAsync(endpoint);
            }
            
            SePayApiResponse? result = null;
            if (response.IsSuccessStatusCode)
            {
                var jsonContent = await response.Content.ReadAsStringAsync();
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                result = JsonSerializer.Deserialize<SePayApiResponse>(jsonContent, options);
                
                if (result?.Status == 200 && result.Transactions != null)
                {
                    // Sử dụng cùng logic match như PaymentPollingService
                    // Match theo thứ tự: exact reference -> partial reference -> transaction content
                    var referenceVariations = GenerateReferenceVariations(referenceCode);
                    
                    // Cách 1: Match exact reference number
                    foreach (var refVariation in referenceVariations)
                    {
                        var matchingByRef = result.Transactions.FirstOrDefault(t => 
                            !string.IsNullOrEmpty(t.ReferenceNumber) &&
                            t.ReferenceNumber.Trim().Equals(refVariation.Trim(), StringComparison.OrdinalIgnoreCase) && 
                            !string.IsNullOrEmpty(t.AmountIn) &&
                            decimal.TryParse(t.AmountIn, out var amountIn1) &&
                            Math.Abs(amountIn1 - amount) < 0.01m);
                        
                        if (matchingByRef != null)
                        {
                            return true;
                        }
                    }
                    
                    // Cách 2: Match partial reference (8, 10, 15 ký tự cuối)
                    var partialRefs = new List<string>();
                    if (referenceCode.Length > 15)
                    {
                        partialRefs.Add(referenceCode.Substring(referenceCode.Length - 15));
                    }
                    if (referenceCode.Length > 10)
                    {
                        partialRefs.Add(referenceCode.Substring(referenceCode.Length - 10));
                    }
                    if (referenceCode.Length > 8)
                    {
                        partialRefs.Add(referenceCode.Substring(referenceCode.Length - 8));
                    }
                    
                    foreach (var partialRef in partialRefs)
                    {
                        var matchingByPartialRef = result.Transactions.FirstOrDefault(t => 
                            !string.IsNullOrEmpty(t.ReferenceNumber) &&
                            (t.ReferenceNumber.Contains(partialRef) || partialRef.Contains(t.ReferenceNumber)) && 
                            !string.IsNullOrEmpty(t.AmountIn) &&
                            decimal.TryParse(t.AmountIn, out var amountIn2) &&
                            Math.Abs(amountIn2 - amount) < 0.01m);
                        
                        if (matchingByPartialRef != null)
                        {
                            return true;
                        }
                    }
                    
                    // Cách 3: Match trong transaction content
                    foreach (var refVariation in referenceVariations)
                    {
                        var matchingByContent = result.Transactions.FirstOrDefault(t => 
                            !string.IsNullOrEmpty(t.AmountIn) &&
                            decimal.TryParse(t.AmountIn, out var amountIn3) &&
                            Math.Abs(amountIn3 - amount) < 0.01m &&
                            !string.IsNullOrEmpty(t.TransactionContent) &&
                            (t.TransactionContent.Contains(referenceCode, StringComparison.OrdinalIgnoreCase) ||
                             t.TransactionContent.Contains(refVariation, StringComparison.OrdinalIgnoreCase)));
                        
                        if (matchingByContent != null)
                        {
                            return true;
                        }
                    }
                    
                }
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.LogError("SePay API authentication failed (401 Unauthorized)");
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying transaction with SePay");
            return false;
        }
    }

    private List<string> GenerateReferenceVariations(string referenceCode)
    {
        var variations = new List<string> { referenceCode };
        
        if (referenceCode.StartsWith("DEP", StringComparison.OrdinalIgnoreCase))
        {
            variations.Add(referenceCode.Substring(3));
        }
        
        var numericPart = new string(referenceCode.Where(char.IsDigit).ToArray());
        if (!string.IsNullOrEmpty(numericPart) && numericPart != referenceCode)
        {
            variations.Add(numericPart);
        }
        
        if (referenceCode.Length > 3)
        {
            variations.Add(referenceCode.Substring(3));
        }
        
        if (referenceCode.Length >= 14)
        {
            variations.Add(referenceCode.Substring(referenceCode.Length - 14));
        }
        
        return variations.Distinct().ToList();
    }

    private class SePayApiResponse
    {
        public int? Status { get; set; }
        public string? Error { get; set; }
        public List<SePayTransaction>? Transactions { get; set; }
    }
}

