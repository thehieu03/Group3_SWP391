namespace Mmo_Domain.ModelRequest;

public class SupportTicketRequest
{
    [EmailAddress] public string Email { get; set; } = null!;
    [Phone] public string? Phone { get; set; }
    [Required] [MaxLength(100)] public string Title { get; set; } = null!;
    [Required] [MaxLength(500)] public string Content { get; set; } = null!;
}