using Mmo_Domain.ModelResponse;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Helper;

public class MapperClass : Profile
{
    public MapperClass()
    {
        CreateMap<RoleRequest, Role>().ReverseMap();
        CreateMap<Category,CategoryResponse>().ReverseMap();
        CreateMap<Category, CategoryRequest>().ReverseMap();

    }
}