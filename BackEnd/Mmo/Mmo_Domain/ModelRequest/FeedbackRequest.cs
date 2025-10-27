using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class FeedbackRequest
{
    [Required] public int OrderId { get; set; }
    [Required] public int ProductId { get; set; }
    public int? Rating { get; set; }
    [Required] public string Comment { get; set; }
}