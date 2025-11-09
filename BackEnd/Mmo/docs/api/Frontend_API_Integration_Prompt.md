# Frontend API Integration Prompt

## Yêu cầu: Tích hợp các API endpoints sau vào Frontend

### 1. Get Product Variants By Product ID

**Endpoint:** `GET /api/product-variants/product/{productId}`

**Description:** Lấy danh sách tất cả các biến thể (variants) của một sản phẩm

**Request:**
- Method: GET
- Path Parameter: `productId` (integer)
- Headers: None required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "productId": 1,
    "name": "256GB - Titanium Blue",
    "price": 999.99,
    "stock": 50,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-20T14:45:00"
  },
  {
    "id": 2,
    "productId": 1,
    "name": "512GB - Titanium Blue",
    "price": 1199.99,
    "stock": 30,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-20T14:45:00"
  }
]
```

**Error Response (404 Not Found):**
```json
{
  "message": "No product variants found for product ID 1"
}
```

**Error Response (500 Internal Server Error):**
```json
"Internal server error: [error message]"
```

**Example Usage:**
```javascript
// Fetch product variants
const response = await fetch(`/api/product-variants/product/${productId}`);
const variants = await response.json();
```

---

### 2. Get Product By ID

**Endpoint:** `GET /api/products/getProductById?id={id}`

**Description:** Lấy thông tin chi tiết của một sản phẩm theo ID

**Request:**
- Method: GET
- Query Parameter: `id` (integer)
- Headers: None required

**Response (200 OK):**
```json
{
  "id": 1,
  "shopId": 5,
  "categoryId": 2,
  "subcategoryId": 3,
  "name": "iPhone 15 Pro Max",
  "description": "Latest iPhone with advanced features",
  "imageUrl": "/Images/Products/iphone15.jpg",
  "isActive": true,
  "details": "256GB, Titanium Blue",
  "fee": 0.05,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:45:00",
  "shopName": "Tech Store",
  "categoryName": "Electronics",
  "subcategoryName": "Smartphones",
  "minPrice": 999.99,
  "maxPrice": 1299.99,
  "totalStock": 150,
  "totalSold": 45,
  "averageRating": 4.5,
  "reviewCount": 23,
  "complaintRate": 0.02
}
```

**Error Response (404 Not Found):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404
}
```

**Example Usage:**
```javascript
const response = await fetch(`/api/products/getProductById?id=${productId}`);
const product = await response.json();
```

---

### 3. Get Feedbacks By Product ID

**Endpoint:** `GET /api/feedbacks/product/{productId}`

**Description:** Lấy tất cả các đánh giá (feedbacks) của một sản phẩm, sắp xếp theo thời gian (mới nhất trước)

**Request:**
- Method: GET
- Path Parameter: `productId` (integer)
- Headers: None required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "accountId": 5,
    "orderId": 10,
    "productId": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt!",
    "createdAt": "2024-01-15T10:30:00",
    "accountUsername": "user123",
    "accountEmail": "user@example.com"
  },
  {
    "id": 2,
    "accountId": 6,
    "orderId": 11,
    "productId": 1,
    "rating": 4,
    "comment": "Tốt nhưng giá hơi cao",
    "createdAt": "2024-01-14T15:20:00",
    "accountUsername": "user456",
    "accountEmail": "user456@example.com"
  }
]
```

**Error Response (404 Not Found):**
```json
{
  "message": "No feedbacks found for product ID 1"
}
```

**Error Response (500 Internal Server Error):**
```json
"Internal server error: [error message]"
```

**Example Usage:**
```javascript
const response = await fetch(`/api/feedbacks/product/${productId}`);
const feedbacks = await response.json();
```

---

### 4. Get Shop By Account ID

**Endpoint:** `GET /api/shops/account/{accountId}`

**Description:** Lấy thông tin shop của một tài khoản (account)

**Request:**
- Method: GET
- Path Parameter: `accountId` (integer)
- Headers: None required

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Store",
  "description": "Cửa hàng điện tử uy tín",
  "status": "APPROVED",
  "ownerUsername": "seller123",
  "productCount": 25,
  "complaintCount": 2,
  "identificationFurl": "/Images/Shops/identification_front.jpg",
  "identificationBurl": "/Images/Shops/identification_back.jpg",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:45:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "No shop found for account ID 5"
}
```

**Error Response (500 Internal Server Error):**
```json
"Internal server error: [error message]"
```

**Example Usage:**
```javascript
const response = await fetch(`/api/shops/account/${accountId}`);
const shop = await response.json();
```

---

## Base URL

**Development:** `http://localhost:5134` (hoặc port tương ứng)

**Production:** [Cập nhật URL production khi deploy]

---

## TypeScript Interfaces (Recommended)

```typescript
// Product Variant Response
interface ProductVariantResponse {
  id: number;
  productId: number | null;
  name: string;
  price: number;
  stock: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Product Response
interface ProductResponse {
  id: number;
  shopId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
  details: string | null;
  fee: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  shopName: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  complaintRate: number;
}

// Feedback Response
interface FeedbackResponse {
  id: number;
  accountId: number | null;
  orderId: number | null;
  productId: number | null;
  rating: number | null;
  comment: string | null;
  createdAt: string | null;
  accountUsername: string | null;
  accountEmail: string | null;
}

// Shop Response
interface ShopResponse {
  id: number;
  name: string;
  description: string | null;
  status: string | null;
  ownerUsername: string;
  productCount: number | null;
  complaintCount: number | null;
  identificationFurl: string | null;
  identificationBurl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Error Response
interface ErrorResponse {
  message?: string;
  type?: string;
  title?: string;
  status?: number;
  traceId?: string;
}
```

---

## React/Next.js Example Implementation

```typescript
// hooks/useProductVariants.ts
import { useState, useEffect } from 'react';

export const useProductVariants = (productId: number) => {
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/product-variants/product/${productId}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setVariants([]);
            return;
          }
          throw new Error('Failed to fetch product variants');
        }
        
        const data = await response.json();
        setVariants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  return { variants, loading, error };
};

// hooks/useProduct.ts
export const useProduct = (productId: number) => {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/products/getProductById?id=${productId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return { product, loading, error };
};

// hooks/useFeedbacks.ts
export const useFeedbacks = (productId: number) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/feedbacks/product/${productId}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setFeedbacks([]);
            return;
          }
          throw new Error('Failed to fetch feedbacks');
        }
        
        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchFeedbacks();
    }
  }, [productId]);

  return { feedbacks, loading, error };
};

// hooks/useShop.ts
export const useShop = (accountId: number) => {
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/shops/account/${accountId}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setShop(null);
            return;
          }
          throw new Error('Failed to fetch shop');
        }
        
        const data = await response.json();
        setShop(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchShop();
    }
  }, [accountId]);

  return { shop, loading, error };
};
```

---

## Vue.js Example Implementation

```typescript
// composables/useProductVariants.ts
import { ref, computed } from 'vue';

export const useProductVariants = (productId: number) => {
  const variants = ref<ProductVariantResponse[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchVariants = async () => {
    try {
      loading.value = true;
      const response = await fetch(
        `${API_BASE_URL}/api/product-variants/product/${productId}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          variants.value = [];
          return;
        }
        throw new Error('Failed to fetch product variants');
      }
      
      variants.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  return {
    variants: computed(() => variants.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchVariants
  };
};
```

---

## Notes

1. **Error Handling:** Luôn kiểm tra `response.ok` trước khi parse JSON
2. **404 Handling:** Một số endpoints trả về 404 khi không tìm thấy dữ liệu, nên xử lý trường hợp này một cách graceful
3. **Loading States:** Nên hiển thị loading indicator khi đang fetch data
4. **Image URLs:** Các imageUrl trả về là relative paths, cần prepend base URL nếu cần
5. **Date Format:** Tất cả dates đều ở format ISO 8601, có thể dùng `new Date()` để parse
6. **CORS:** Đảm bảo backend đã cấu hình CORS cho frontend domain

---

## Testing

Test các endpoints với:
- Valid IDs (existing data)
- Invalid IDs (non-existent data)
- Edge cases (empty results, null values)
- Network errors
- Server errors (500)

