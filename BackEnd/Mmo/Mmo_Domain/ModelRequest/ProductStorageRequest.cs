using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class AccountStorageItem
{
    [Required]
    public string Username { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    public bool Status { get; set; } = false; // false = chưa bán, true = đã bán
}

public class ProductStorageRequest
{
    [Required]
    public int ProductVariantId { get; set; }

    [Required]
    public List<AccountStorageItem> Accounts { get; set; } = new List<AccountStorageItem>();
}

