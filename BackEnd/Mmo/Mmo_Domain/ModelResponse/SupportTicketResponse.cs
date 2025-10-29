namespace Mmo_Domain.ModelResponse;

public class SupportTicketResponse
{
    public int Id { get; set; }
    public int? AccountId { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public string Status { get; set; } = "OPEN";
    public AccountMiniResponse? Account { get; set; }
}

public class AccountMiniResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
}


