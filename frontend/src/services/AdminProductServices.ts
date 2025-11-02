import { httpGet, httpPost, httpPut, httpDelete } from "@utils/http.ts";
import type {
  ProductRequest,
  ProductUpdateRequest,
  ProductListRequest,
} from "@/models/modelRequest/ProductRequest";
import type {
  AdminProductResponse,
  AdminProductListResponse,
  AdminProductStatsResponse,
} from "@/models/modelResponse/AdminProductResponse";

class AdminProductServices {
  async getProductsAsync(
    params: ProductListRequest = {}
  ): Promise<AdminProductListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.shopId) queryParams.append("shopId", params.shopId.toString());
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `admin/products${queryString ? `?${queryString}` : ""}`;

    return await httpGet<AdminProductListResponse>(url);
  }

  // Lấy thông tin chi tiết sản phẩm
  async getProductByIdAsync(id: number): Promise<AdminProductResponse> {
    return await httpGet<AdminProductResponse>(`admin/products/${id}`);
  }

  // Tạo sản phẩm mới
  async createProductAsync(
    productData: ProductRequest
  ): Promise<AdminProductResponse> {
    return await httpPost<AdminProductResponse, ProductRequest>(
      "admin/products",
      productData
    );
  }

  // Cập nhật sản phẩm
  async updateProductAsync(
    id: number,
    productData: ProductUpdateRequest
  ): Promise<AdminProductResponse> {
    return await httpPut<AdminProductResponse, ProductUpdateRequest>(
      `admin/products/${id}`,
      productData
    );
  }

  // Xóa sản phẩm
  async deleteProductAsync(id: number): Promise<void> {
    return await httpDelete<void>(`admin/products/${id}`);
  }

  // Kích hoạt/vô hiệu hóa sản phẩm
  async toggleProductStatusAsync(
    id: number,
    isActive: boolean
  ): Promise<AdminProductResponse> {
    return await httpPut<AdminProductResponse, { isActive: boolean }>(
      `admin/products/${id}/status`,
      { isActive }
    );
  }

  // Lấy thống kê sản phẩm
  async getProductStatsAsync(): Promise<AdminProductStatsResponse> {
    return await httpGet<AdminProductStatsResponse>("admin/products/stats");
  }

  // Lấy danh sách categories (để filter)
  async getCategoriesAsync(): Promise<{ id: number; name: string }[]> {
    return await httpGet<{ id: number; name: string }[]>("admin/categories");
  }

  // Lấy danh sách shops (để filter)
  async getShopsAsync(): Promise<{ id: number; name: string }[]> {
    return await httpGet<{ id: number; name: string }[]>("admin/shops");
  }
}

export const adminProductServices = new AdminProductServices();
