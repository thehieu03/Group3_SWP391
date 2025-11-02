namespace Mmo_Domain.ModelRequest;

public class UpdateAccountRoleRequest
{
    public int UserId { get; set; }
    public List<int> RoleIds { get; set; } = new List<int>();
    public bool ReplaceAll { get; set; } = false; // true = thay thế tất cả, false = chỉ thêm
}
