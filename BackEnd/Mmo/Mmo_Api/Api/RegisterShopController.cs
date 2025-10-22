using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterShopController : ControllerBase
    {
        private readonly IShopServices _shopServices;
        private readonly IMapper _mapper;

        public RegisterShopController(IShopServices shopServices, IMapper mapper)
        {
            _shopServices = shopServices;
            _mapper = mapper;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RegisterShop([FromBody] RegisterShopRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Thi?u thông tin c?n thi?t.");

            var newShop = _mapper.Map<Shop>(request);
            newShop.IsActive = 1;
            newShop.CreatedAt = DateTime.Now;
            newShop.UpdatedAt = DateTime.Now;
            newShop.ReportCount = 0;

            var result = await _shopServices.AddAsync(newShop);
            if (result <= 0)
                return BadRequest("??ng ký c?a hàng th?t b?i.");

            var response = _mapper.Map<RegisterShopResponse>(newShop);
            return Ok(response);
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<RegisterShopResponse>>> GetAllShops()
        {
            var shops = await _shopServices.GetAllAsync();
            if (shops == null || !shops.Any())
                return NotFound();

            var response = _mapper.Map<IEnumerable<RegisterShopResponse>>(shops);
            return Ok(response);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RegisterShopResponse>> GetShopById(int id)
        {
            var shop = await _shopServices.GetByIdAsync(id);
            if (shop == null)
                return NotFound();

            var response = _mapper.Map<RegisterShopResponse>(shop);
            return Ok(response);
        }
    }
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
