using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class UpdateStorageStatusRequest
{
    [Required]
    public int StorageId { get; set; }

    [Required]
    public bool Status { get; set; } // false = chưa bán, true = đã bán
}

