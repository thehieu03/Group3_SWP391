using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Api;

[Route("api/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductServices _productServices;
    private readonly IProductVariantServices _productVariantServices;
    private readonly ICategoryServices _categoryServices;
    private readonly IShopServices _shopServices;
    private readonly IMapper _mapper;

    public ProductsController(
        IProductServices productServices,
        IProductVariantServices productVariantServices,
        ICategoryServices categoryServices,
        IShopServices shopServices,
        IMapper mapper)
    {
        _productServices = productServices;
        _productVariantServices = productVariantServices;
        _categoryServices = categoryServices;
        _shopServices = shopServices;
        _mapper = mapper;
    }

    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProduct()
    {
        var resultProduct = await _productServices.GetAllAsync();
        if (!resultProduct.Any())
        {
            return NotFound();
        }

        var variants = await _productVariantServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Productvariants = variants
                .Where(v => v.ProductId == product.Id)
                .ToList();
        }

        var categories = await _categoryServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Category = categories.FirstOrDefault(c => c.Id == product.CategoryId);
        }

        var shops = await _shopServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Shop = shops.FirstOrDefault(s => s.Id == product.ShopId);
        }

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(resultProduct);
        return Ok(resultResponse);
    }

    [HttpGet("{id}")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProductByCategoryId(int id)
    {
        var products = await _productServices.GetAllAsync();
        var filteredProducts = products.Where(p => p.CategoryId == (uint)id);
        if (!filteredProducts.Any())
        {
            return NotFound();
        }

        var variants = await _productVariantServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Productvariants = variants
                .Where(v => v.ProductId == product.Id)
                .ToList();
        }

        var categories = await _categoryServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Category = categories.FirstOrDefault(c => c.Id == product.CategoryId);
        }

        var shops = await _shopServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Shop = shops.FirstOrDefault(s => s.Id == product.ShopId);
        }

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(filteredProducts);
        return Ok(resultResponse);
    }

    [HttpGet("getProductById")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductResponse>> GetProductById([FromQuery] int id)
    {
        var productResult = await _productServices.GetByIdAsync(id);
        if (productResult == null)
        {
            return NotFound();
        }

        var allVariants = await _productVariantServices.GetAllAsync();
        productResult.Productvariants = allVariants.Where(v => v.ProductId == id).ToList();

        var categories = await _categoryServices.GetAllAsync() ?? new List<Category>();
        productResult.Category = categories.FirstOrDefault(c => c.Id == productResult.CategoryId);

        var shops = await _shopServices.GetAllAsync() ?? new List<Shop>();
        productResult.Shop = shops.FirstOrDefault(s => s.Id == productResult.ShopId);

        var productResponse = _mapper.Map<ProductResponse>(productResult);
        return Ok(productResponse);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequest productRequest)
    {
        if (productRequest == null || !ModelState.IsValid)
        {
            return BadRequest();
        }

        var productAdd = _mapper.Map<Product>(productRequest);
        var result = await _productServices.AddAsync(productAdd);
        return result > 0 ? Ok() : BadRequest();
    }
}
