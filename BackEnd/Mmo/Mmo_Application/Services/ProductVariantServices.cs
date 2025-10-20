using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Infrastructure.Unit;

namespace Mmo_Application.Services
{
    public class ProductVariantServices : BaseServices<Productvariant>, IProductVariantServices
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductVariantServices(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
    }
}
