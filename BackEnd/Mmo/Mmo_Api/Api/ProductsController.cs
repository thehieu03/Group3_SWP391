using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Api
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductServices _productServices;
        private readonly IMapper _mapper;

        public ProductsController(IProductServices productServices, IMapper mapper)
        {
            _productServices = productServices;
            _mapper = mapper;
        }

        [HttpGet]
        [EnableQuery]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProducts()
        {
            try
            {
                var products = await _productServices.GetAllAsync();
                if (products == null || !products.Any())
                {
                    return NotFound("No products found.");
                }
                var dataResponse = _mapper.Map<List<ProductResponse>>(products);
                return Ok(dataResponse);
            }
            catch (Exception)
            {
                return NotFound();
                throw;
            }
        }
    }
}
