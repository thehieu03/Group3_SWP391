namespace Mmo_Domain.ModelRequest;

public class UpdateProductStatusRequest
{
    public int ProductId { get; set; }
    public bool IsActive { get; set; }
}

