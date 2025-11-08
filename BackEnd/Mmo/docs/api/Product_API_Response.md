# Product API Response Documentation

## 1. Get Product By ID

**Endpoint:** `GET /api/products/getProductById?id={id}`

**Response Type:** `ProductResponse` (Single Object)

**Status Codes:**

- `200 OK` - Product found
- `404 Not Found` - Product not found

### Response Example (200 OK):

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

### Response Fields:

| Field             | Type      | Description                     |
| ----------------- | --------- | ------------------------------- |
| `id`              | uint      | Product ID                      |
| `shopId`          | uint?     | Shop ID that owns this product  |
| `categoryId`      | uint?     | Category ID                     |
| `subcategoryId`   | uint?     | Subcategory ID                  |
| `name`            | string    | Product name                    |
| `description`     | string?   | Product description             |
| `imageUrl`        | string?   | URL to product image            |
| `isActive`        | bool?     | Whether product is active       |
| `details`         | string?   | Additional product details      |
| `fee`             | decimal?  | Fee percentage                  |
| `createdAt`       | DateTime? | Creation timestamp              |
| `updatedAt`       | DateTime? | Last update timestamp           |
| `shopName`        | string?   | Name of the shop                |
| `categoryName`    | string?   | Name of the category            |
| `subcategoryName` | string?   | Name of the subcategory         |
| `minPrice`        | decimal?  | Minimum price from all variants |
| `maxPrice`        | decimal?  | Maximum price from all variants |
| `totalStock`      | int       | Total stock across all variants |
| `totalSold`       | int       | Total items sold                |
| `averageRating`   | double    | Average rating from feedbacks   |
| `reviewCount`     | int       | Number of reviews/feedbacks     |
| `complaintRate`   | double    | Complaint rate percentage       |

### Error Response (404 Not Found):

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "00-..."
}
```

---

## 2. Get Product Variants By Product ID

**Endpoint:** `GET /api/product-variants/product/{productId}`

**Response Type:** `IEnumerable<ProductVariantResponse>` (Array)

**Status Codes:**

- `200 OK` - Product variants found
- `404 Not Found` - No variants found for product ID
- `500 Internal Server Error` - Server error

### Response Example (200 OK):

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
  },
  {
    "id": 3,
    "productId": 1,
    "name": "1TB - Titanium Blue",
    "price": 1299.99,
    "stock": 20,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-20T14:45:00"
  }
]
```

### Response Fields (per variant):

| Field       | Type      | Description                         |
| ----------- | --------- | ----------------------------------- |
| `id`        | int       | Product variant ID                  |
| `productId` | int?      | Parent product ID                   |
| `name`      | string    | Variant name (e.g., "256GB - Blue") |
| `price`     | decimal   | Variant price                       |
| `stock`     | int?      | Available stock quantity            |
| `createdAt` | DateTime? | Creation timestamp                  |
| `updatedAt` | DateTime? | Last update timestamp               |

### Error Response (404 Not Found):

```json
{
  "message": "No product variants found for product ID 1"
}
```

### Error Response (500 Internal Server Error):

```json
"Internal server error: [error message]"
```

---

## Example Usage

### Get Product By ID:

```http
GET /api/products/getProductById?id=1
```

### Get Product Variants:

```http
GET /api/product-variants/product/1
```

---

## Notes

- All timestamps are in ISO 8601 format
- Prices are in decimal format (e.g., 999.99)
- The `ProductResponse` includes aggregated data from related entities (shop, category, variants, feedbacks)
- The `ProductVariantResponse` is a simple representation of product variants
- Empty arrays will return 404 Not Found for the variants endpoint
