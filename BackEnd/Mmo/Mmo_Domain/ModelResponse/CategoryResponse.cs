using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelResponse;

public class CategoryResponse
{
    public uint Id { get; set; }

    public string Name { get; set; } = null!;

    public bool? IsActive { get; set; }
}
