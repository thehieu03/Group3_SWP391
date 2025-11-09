namespace Mmo_Domain.ModelRequest;

public class UpdateUserStatusRequest
{
    public int UserId { get; set; }
    public bool IsActive { get; set; }
}
