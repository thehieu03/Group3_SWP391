namespace Mmo_Domain.ModelResponse;

public class SubcategoryResponse
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public bool? IsActive { get; set; }
}


