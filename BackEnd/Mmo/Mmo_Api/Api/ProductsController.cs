<<<<<<< Updated upstream
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
=======
﻿using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
>>>>>>> Stashed changes

namespace Mmo_Api.Api;

[Route("api/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductServices _productServices;
    private readonly IProductVariantServices _productVariantServices;
    private readonly ICategoryServices _categoryServices;
    private readonly IShopServices _shopServices; // ✅ Thêm service cho Shop
    private readonly IMapper _mapper;

    public ProductsController(
        IProductServices productServices,
        IProductVariantServices productVariantServices,
        ICategoryServices categoryServices,
        IShopServices shopServices, // ✅ Inject thêm
        IMapper mapper)
    {
        _productServices = productServices;
        _productVariantServices = productVariantServices;
        _categoryServices = categoryServices;
        _shopServices = shopServices; // ✅ Gán
        _mapper = mapper;
    }

    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProduct([FromQuery] int? categoryId,
        [FromQuery] int? subcategoryId, [FromQuery] string? searchTerm, [FromQuery] string? sortBy)
    {
<<<<<<< Updated upstream
        var products = await _productServices.GetAllWithRelatedAsync();

        //category filter
        if (categoryId.HasValue)
        {
            products = products.Where(p => p.CategoryId == (uint?)categoryId.Value);
        }

        //subcategory filter
        if (subcategoryId.HasValue)
        {
            products = products.Where(p => p.SubcategoryId == (uint?)subcategoryId.Value);
        }

        //search filter
        if (!string.IsNullOrEmpty(searchTerm))
        {
            products = products.Where(p => p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        if (!products.Any())
=======
        var resultProduct = await _productServices.GetAllAsync();
        if (!resultProduct.Any())
>>>>>>> Stashed changes
        {
            return NotFound();
        }

<<<<<<< Updated upstream
        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(products);

        if (!string.IsNullOrEmpty(sortBy))
        {
            switch (sortBy.ToLower())
            {
                case "price_asc":
                    // sort by minPrice, then default by name
                    resultResponse = resultResponse
                        .OrderBy(p => p.MinPrice ?? 0)
                        .ThenBy(p => p.Name);
                    break;
                case "price_desc":
                    // Sort by MaxPrice, then default by name
                    resultResponse = resultResponse
                        .OrderByDescending(p => p.MaxPrice ?? 0)
                        .ThenBy(p => p.Name);
                    break;
                case "name_asc":
                    resultResponse = resultResponse.OrderBy(p => p.Name);
                    break;
                case "name_desc":
                    resultResponse = resultResponse.OrderByDescending(p => p.Name);
                    break;
                case "rating_desc":
                    resultResponse = resultResponse.OrderByDescending(p => p.AverageRating);
                    break;
            }
        }

=======
        // ✅ Load ProductVariants
        var variants = await _productVariantServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Productvariants = variants
                .Where(v => v.ProductId == product.Id)
                .ToList();
        }

        // ✅ Load Category
        var categories = await _categoryServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Category = categories.FirstOrDefault(c => c.Id == product.CategoryId);
        }

        // ✅ Load Shop
        var shops = await _shopServices.GetAllAsync();
        foreach (var product in resultProduct)
        {
            product.Shop = shops.FirstOrDefault(s => s.Id == product.ShopId);
        }

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(resultProduct);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
        // ✅ Load ProductVariants
        var variants = await _productVariantServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Productvariants = variants
                .Where(v => v.ProductId == product.Id)
                .ToList();
        }

        // ✅ Load Category
        var categories = await _categoryServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Category = categories.FirstOrDefault(c => c.Id == product.CategoryId);
        }

        // ✅ Load Shop
        var shops = await _shopServices.GetAllAsync();
        foreach (var product in filteredProducts)
        {
            product.Shop = shops.FirstOrDefault(s => s.Id == product.ShopId);
        }

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
        // ✅ Load ProductVariants
        var allVariants = await _productVariantServices.GetAllAsync();
        productResult.Productvariants = allVariants.Where(v => v.ProductId == id).ToList();

        // ✅ Load Category
        var categories = await _categoryServices.GetAllAsync() ?? new List<Category>();
        productResult.Category = categories.FirstOrDefault(c => c.Id == productResult.CategoryId);

        // ✅ Load Shop
        var shops = await _shopServices.GetAllAsync() ?? new List<Shop>();
        productResult.Shop = shops.FirstOrDefault(s => s.Id == productResult.ShopId);

>>>>>>> Stashed changes
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