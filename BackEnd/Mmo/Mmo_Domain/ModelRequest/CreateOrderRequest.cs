namespace Mmo_Domain.ModelRequest;

public class CreateOrderRequest
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

