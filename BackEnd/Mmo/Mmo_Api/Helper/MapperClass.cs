using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Helper;

public class MapperClass : Profile
{
    public MapperClass()
    {
        CreateMap<RoleRequest, Role>().ReverseMap();
        CreateMap<Category,CategoryResponse>().ReverseMap();
        CreateMap<Category, CategoryRequest>().ReverseMap();
        CreateMap<Product, ProductResponse>().ReverseMap();
        CreateMap<Product, ProductRequest>().ReverseMap();
        CreateMap<Productvariant, ProductVariantResponse>().ReverseMap();
        CreateMap<Shop, ShopResponse>().ReverseMap();
    }
}