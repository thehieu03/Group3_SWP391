import { httpGet, httpPost, httpPut, httpDelete } from '../utils/http';

export interface SellerProduct {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  image: string | null;
  details: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  shopName?: string;
}

export interface SellerProductRequest {
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  image?: string; // base64 string
  details: string;
}

export interface SellerProductListRequest {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchProductName?: string;
  categoryId?: number;
  isApproved?: boolean;
}

export interface SellerProductListResponse {
  products: SellerProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class SellerProductServices {
  // Get all products for current seller's shop with pagination, search, sort, filter
  async getSellerProducts(shopId: number, params?: SellerProductListRequest): Promise<SellerProductListResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination params
    if (params?.pageNumber) {
      queryParams.append('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      queryParams.append('PageSize', params.pageSize.toString());
    }
    
    // Add search param
    if (params?.searchProductName) {
      queryParams.append('SearchProductName', params.searchProductName);
    }
    
    // Add category filter
    if (params?.categoryId) {
      queryParams.append('CategoryId', params.categoryId.toString());
    }
    
    // Add approval status filter
    if (params?.isApproved !== undefined) {
      queryParams.append('IsApproved', params.isApproved.toString());
    }
    
    // Add sort params
    if (params?.sortBy) {
      queryParams.append('SortBy', params.sortBy);
    }
    if (params?.sortDirection) {
      queryParams.append('SortDirection', params.sortDirection);
    }
    
    const response = await httpGet<SellerProductListResponse>(`products/seller/${shopId}?${queryParams.toString()}`);
    return response;
  }

  // Get a single product by ID
  async getProductById(id: number): Promise<SellerProduct> {
    const response = await httpGet<SellerProduct>(`products/getProductById?id=${id}`);
    return response;
  }

  // Create a new product
  async createProduct(product: SellerProductRequest): Promise<any> {
    // Convert base64 image string to byte array if exists
    let productData: any = {
      shopId: product.shopId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      details: product.details
    };

    if (product.image) {
      // Remove data:image prefix if exists
      const base64String = product.image.split(',')[1] || product.image;
      productData.image = base64String;
    }

    const response = await httpPost('products', productData);
    return response;
  }

  // Update an existing product
  async updateProduct(id: number, product: Partial<SellerProductRequest>): Promise<any> {
    let productData: any = {
      ...product
    };

    if (product.image) {
      const base64String = product.image.split(',')[1] || product.image;
      productData.image = base64String;
    }

    const response = await httpPut(`products/${id}`, productData);
    return response;
  }

  // Delete a product
  async deleteProduct(id: number): Promise<any> {
    const response = await httpDelete(`products/${id}`);
    return response;
  }

  // Convert File to base64 string
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

export const sellerProductServices = new SellerProductServices();

