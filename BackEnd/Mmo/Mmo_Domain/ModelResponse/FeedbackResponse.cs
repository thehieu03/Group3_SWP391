namespace Mmo_Domain.ModelResponse;

public class FeedbackResponse
{
    public int Id { get; set; }

    public int? AccountId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? AccountUsername { get; set; }

    public string? AccountEmail { get; set; }
}

