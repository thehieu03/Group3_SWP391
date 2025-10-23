# Shop Management API Documentation

## Overview

API quản lý trạng thái Shop cho phép Admin ban/unban shops và xem thông tin chi tiết về shops.

## Endpoints

### 1. Get All Shops

**GET** `/api/shops`

**Description**: Lấy danh sách tất cả shops với hỗ trợ OData

**Authorization**: Admin Only

**OData Support**:

- `$filter`: Lọc theo điều kiện
- `$orderby`: Sắp xếp
- `$top`: Giới hạn số lượng
- `$skip`: Bỏ qua số lượng
- `$count`: Đếm tổng số

**Query Examples**:

```
GET /api/shops?$filter=isActive eq true
GET /api/shops?$filter=contains(name,'Tech')
GET /api/shops?$orderby=createdAt desc
GET /api/shops?$top=10&$skip=0
```

**Response**:

```json
[
  {
    "id": 1,
    "name": "Tech Store",
    "description": "Chuyên cung cấp tài khoản phần mềm",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "ownerUsername": "admin",
    "productCount": 15,
    "complaintCount": 2
  }
]
```

### 2. Get Shop by ID

**GET** `/api/shops/{id}`

**Description**: Lấy thông tin chi tiết của một shop

**Authorization**: Admin Only

**Parameters**:

- `id` (int): ID của shop

**Response**:

```json
{
  "id": 1,
  "name": "Tech Store",
  "description": "Chuyên cung cấp tài khoản phần mềm",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "ownerUsername": "admin",
  "productCount": 15,
  "complaintCount": 2
}
```

### 3. Update Shop Status

**PUT** `/api/shops/{shopId}/status`

**Description**: Ban hoặc unban shop

**Authorization**: Admin Only

**Request Body**:

```json
{
  "shopId": 1,
  "isActive": false
}
```

**Response Success**:

```json
{
  "message": "Shop banned successfully"
}
```

**Response Error**:

```json
{
  "message": "Shop not found"
}
```

## Request/Response Models

### UpdateShopStatusRequest

```csharp
public class UpdateShopStatusRequest
{
    public int ShopId { get; set; }
    public bool IsActive { get; set; }
}
```

### ShopResponse

```csharp
public class ShopResponse
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? OwnerUsername { get; set; }
    public int? ProductCount { get; set; }
    public int? ComplaintCount { get; set; }
}
```

## Business Logic

### Ban Shop (isActive = false)

- Cập nhật `isActive = false` trong bảng `shops`
- Cập nhật `updatedAt` với thời gian hiện tại
- Ghi log audit: `[AUDIT] Shop {shopId} ({shopName}) BANNED at {timestamp}`

### Unban Shop (isActive = true)

- Cập nhật `isActive = true` trong bảng `shops`
- Cập nhật `updatedAt` với thời gian hiện tại
- Ghi log audit: `[AUDIT] Shop {shopId} ({shopName}) UNBANNED at {timestamp}`

### ComplaintCount

- Được tính từ số lượng `Replies` của shop
- Hiển thị số lượng khiếu nại/phản hồi của shop

## OData Query Examples

### Filter by Status

```
# Active shops only
GET /api/shops?$filter=isActive eq true

# Banned shops only
GET /api/shops?$filter=isActive eq false
```

### Search by Name

```
# Shops with "Tech" in name
GET /api/shops?$filter=contains(name,'Tech')

# Shops with "Store" in name
GET /api/shops?$filter=contains(name,'Store')
```

### Ordering

```
# Order by creation date (newest first)
GET /api/shops?$orderby=createdAt desc

# Order by name (alphabetical)
GET /api/shops?$orderby=name asc
```

### Pagination

```
# First 10 shops
GET /api/shops?$top=10&$skip=0

# Next 10 shops
GET /api/shops?$top=10&$skip=10
```

### Combined Queries

```
# Active shops with "Tech" in name, ordered by creation date, first 5
GET /api/shops?$filter=isActive eq true and contains(name,'Tech')&$orderby=createdAt desc&$top=5
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Request body cannot be null"
}
```

```json
{
  "message": "Shop ID in URL and request body must match"
}
```

```json
{
  "message": "Invalid shop ID"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden"
}
```

### 404 Not Found

```json
{
  "message": "Shop not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Failed to update shop status"
}
```

## Frontend Integration

### JavaScript/TypeScript

```javascript
// Get all shops
const getShops = async (filters = "") => {
  const response = await fetch(`/api/shops${filters ? "?" + filters : ""}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
};

// Get active shops
const getActiveShops = () => getShops("$filter=isActive eq true");

// Get banned shops
const getBannedShops = () => getShops("$filter=isActive eq false");

// Search shops by name
const searchShops = (searchTerm) =>
  getShops(`$filter=contains(name,'${searchTerm}')`);

// Ban shop
const banShop = async (shopId) => {
  const response = await fetch(`/api/shops/${shopId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shopId: shopId,
      isActive: false,
    }),
  });
  return await response.json();
};

// Unban shop
const unbanShop = async (shopId) => {
  const response = await fetch(`/api/shops/${shopId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shopId: shopId,
      isActive: true,
    }),
  });
  return await response.json();
};
```

### React Component Example

```jsx
const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'banned'

  const fetchShops = async () => {
    setLoading(true);
    try {
      let filterQuery = "";
      if (filter === "active") {
        filterQuery = "$filter=isActive eq true";
      } else if (filter === "banned") {
        filterQuery = "$filter=isActive eq false";
      }

      const data = await getShops(filterQuery);
      setShops(data);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (shopId, isActive) => {
    try {
      if (isActive) {
        await unbanShop(shopId);
      } else {
        await banShop(shopId);
      }
      await fetchShops(); // Refresh list
    } catch (error) {
      console.error("Error updating shop status:", error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [filter]);

  return (
    <div>
      <div className="filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All Shops
        </button>
        <button
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active Shops
        </button>
        <button
          className={filter === "banned" ? "active" : ""}
          onClick={() => setFilter("banned")}
        >
          Banned Shops
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="shops-list">
          {shops.map((shop) => (
            <div key={shop.id} className="shop-card">
              <h3>{shop.name}</h3>
              <p>{shop.description}</p>
              <div className="shop-info">
                <span>Owner: {shop.ownerUsername}</span>
                <span>Products: {shop.productCount}</span>
                <span>Complaints: {shop.complaintCount}</span>
                <span
                  className={`status ${shop.isActive ? "active" : "banned"}`}
                >
                  {shop.isActive ? "Active" : "Banned"}
                </span>
              </div>
              <button
                onClick={() => updateShopStatus(shop.id, !shop.isActive)}
                className={shop.isActive ? "ban-btn" : "unban-btn"}
              >
                {shop.isActive ? "Ban Shop" : "Unban Shop"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Security Features

### Authorization

- Chỉ Admin mới có quyền truy cập tất cả endpoints
- Sử dụng JWT token để xác thực
- Policy `AdminOnly` được áp dụng

### Validation

- Kiểm tra shop tồn tại trước khi cập nhật
- Validate shopId phải là số dương
- Kiểm tra shopId trong URL và body phải khớp
- Sanitize input để tránh SQL injection

### Audit Logging

- Ghi log mọi thay đổi trạng thái shop
- Format: `[AUDIT] Shop {shopId} ({shopName}) {ACTION} at {timestamp}`
- Log được ghi vào console

## Performance Considerations

### Database Indexing

- Index trên `isActive` field để filter nhanh
- Index trên `name` field để search nhanh
- Index trên `createdAt` field để orderby nhanh

### OData Optimization

- Sử dụng OData để giảm data transfer
- Client có thể filter/sort/paginate ở server
- Giảm tải cho database

### Caching

- Có thể cache danh sách shops
- Invalidate cache khi có thay đổi trạng thái

## Monitoring & Alerting

### Logs to Monitor

- `[AUDIT]` logs cho mọi thay đổi trạng thái
- `[ERROR]` logs cho các lỗi cập nhật
- Response time của API

### Metrics to Track

- Số lượng shops bị ban/unban per day
- Thời gian response của API
- Error rate của API
- OData query performance

## Troubleshooting

### Common Issues

#### 1. Shop not found (404)

- **Cause**: Shop ID không tồn tại trong database
- **Solution**: Kiểm tra shop ID có đúng không

#### 2. Forbidden (403)

- **Cause**: Token không có quyền Admin
- **Solution**: Kiểm tra token và role của user

#### 3. OData query error

- **Cause**: Syntax OData không đúng
- **Solution**: Kiểm tra cú pháp OData query

#### 4. Failed to update (500)

- **Cause**: Lỗi database hoặc connection
- **Solution**: Kiểm tra database connection và logs

## Changelog

### Version 1.0.0

- ✅ Initial implementation
- ✅ Ban/Unban shop functionality
- ✅ OData support for filtering/sorting/pagination
- ✅ Admin authorization
- ✅ Input validation
- ✅ Audit logging
- ✅ Error handling
- ✅ ComplaintCount mapping
- ✅ API documentation
