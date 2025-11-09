import type { ProductResponse } from "@models/modelResponse/ProductResponse";
import type { PaginationResponse } from "@models/modelResponse/PaginationResponse";
import { httpGet, httpPut, httpPost } from "@utils/http";
import type { ProductRequest } from "@models/modelRequest/ProductRequest";

interface GetProductsByCategoryParams {
  categoryId: number;
  subcategoryId?: number;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

interface GetProductsBySubcategoriesParams {
  categoryId: number;
  subcategoryIds: number[];
  searchTerm?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

class ProductServices {
  async getAllProductAsync(): Promise<ProductResponse[]> {
    const response = await httpGet<ProductResponse[]>("products");
    return response;
  }

  async getProductByIdAsync(
    productId: number,
    includeInactive: boolean = false
  ): Promise<ProductResponse> {
    const url = `products/getProductById?id=${productId}${
      includeInactive ? "&includeInactive=true" : ""
    }`;
    const response = await httpGet<ProductResponse>(url);
    return response;
  }

  async searchProductsAsync(searchTerm: string): Promise<ProductResponse[]> {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await httpGet<ProductResponse[]>(
      `products?$filter=contains(name,'${encodedSearchTerm}') or contains(description,'${encodedSearchTerm}')&$top=5`
    );
    return response;
  }

  async getProductsByCategoryAsync(
    categoryId: number
  ): Promise<ProductResponse[]> {
    const response = await httpGet<ProductResponse[]>(
      `products?$filter=categoryId eq ${categoryId}`
    );
    return response;
  }

  async getProductsByCategory(
    params: GetProductsByCategoryParams
  ): Promise<PaginationResponse<ProductResponse>> {
    const q = new URLSearchParams();
    q.set("categoryId", String(params.categoryId));
    if (params?.subcategoryId != null)
      q.set("subcategoryId", String(params.subcategoryId));
    if (params?.searchTerm) q.set("searchTerm", params.searchTerm);
    if (params?.sortBy) q.set("sortBy", params.sortBy);
    const path = `products?${q.toString()}`;
    try {
      // Backend returns an array, not a pagination response, so we handle pagination client-side
      const allProducts = await httpGet<ProductResponse[]>(path);
      const pageSize = params.pageSize || 10;
      const currentPage = params.page || 1;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);

      return {
        data: paginatedProducts,
        currentPage: currentPage,
        totalPages: Math.ceil(allProducts.length / pageSize),
        totalItems: allProducts.length,
        itemsPerPage: pageSize,
        hasNextPage: endIndex < allProducts.length,
        hasPreviousPage: currentPage > 1,
      };
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        const pageSize = params.pageSize || 10;
        return {
          data: [],
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: pageSize,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
      throw err;
    }
  }

  async getProductsBySubcategories(
    params: GetProductsBySubcategoriesParams
  ): Promise<PaginationResponse<ProductResponse>> {
    const MAX_PAGE_SIZE = 1000;
    const results = await Promise.all(
      params.subcategoryIds.map((subcategoryId) =>
        this.getProductsByCategory({
          categoryId: params.categoryId,
          subcategoryId: subcategoryId,
          searchTerm: params.searchTerm,
          sortBy: params.sortBy,
          page: 1,
          pageSize: MAX_PAGE_SIZE,
        })
      )
    );

    const allProducts = results.flatMap((result) => result.data);
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );
    const startIndex = ((params.page || 1) - 1) * (params.pageSize || 8);
    const endIndex = startIndex + (params.pageSize || 8);
    const paginatedProducts = uniqueProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      currentPage: params.page || 1,
      totalPages: Math.ceil(uniqueProducts.length / (params.pageSize || 8)),
      totalItems: uniqueProducts.length,
      itemsPerPage: params.pageSize || 8,
      hasNextPage: endIndex < uniqueProducts.length,
      hasPreviousPage: (params.page || 1) > 1,
    };
  }

  async getProductsByShopIdAsync(shopId: number): Promise<ProductResponse[]> {
    const response = await httpGet<ProductResponse[]>(
      `products/shop/${shopId}`
    );
    return response;
  }

  async updateProductStatusAsync(
    productId: number,
    isActive: boolean
  ): Promise<void> {
    await httpPut<void, { productId: number; isActive: boolean }>(
      `products/${productId}/status`,
      {
        productId,
        isActive,
      }
    );
  }

  async updateProductAsync(
    productId: number,
    productData: Partial<ProductRequest>,
    image?: File
  ): Promise<void> {
    const formData = new FormData();

    // Required fields
    if (productData.name) formData.append("name", productData.name);
    if (productData.description)
      formData.append("description", productData.description);
    if (productData.categoryId !== undefined)
      formData.append("categoryId", productData.categoryId.toString());
    if (productData.shopId !== undefined)
      formData.append("shopId", productData.shopId.toString());

    // Optional fields
    if (
      productData.subcategoryId !== undefined &&
      productData.subcategoryId !== null
    )
      formData.append("subcategoryId", productData.subcategoryId.toString());
    if (productData.details) formData.append("details", productData.details);

    // Product Variants
    if (productData.variants && productData.variants.length > 0) {
      formData.append("variants", JSON.stringify(productData.variants));
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      // Don't set Content-Type header manually - browser will set it with boundary for FormData
      await httpPut<void, FormData>(`products/${productId}`, formData);
    } catch (error: unknown) {
      throw error;
    }
  }

  async createProductAsync(
    productData: Partial<ProductRequest>,
    image?: File
  ): Promise<void> {
    const formData = new FormData();

    // Required fields
    if (productData.name) formData.append("name", productData.name);
    if (productData.description)
      formData.append("description", productData.description);
    if (productData.categoryId !== undefined)
      formData.append("categoryId", productData.categoryId.toString());
    if (productData.shopId !== undefined)
      formData.append("shopId", productData.shopId.toString());

    // Optional fields
    if (
      productData.subcategoryId !== undefined &&
      productData.subcategoryId !== null
    )
      formData.append("subcategoryId", productData.subcategoryId.toString());
    if (productData.details) formData.append("details", productData.details);

    // Product Variants and Storages
    if (productData.variants && productData.variants.length > 0) {
      formData.append("variants", JSON.stringify(productData.variants));
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      await httpPost<void, FormData>("products", formData);
    } catch (error: unknown) {
      throw error;
    }
  }
}
export const productServices = new ProductServices();
