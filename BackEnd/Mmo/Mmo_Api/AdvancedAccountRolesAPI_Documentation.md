# Advanced Account Roles Management API Documentation

## Endpoints

- **PUT** `/api/accounts/{userId}/role` - Thêm hoặc thay thế roles
- **DELETE** `/api/accounts/{userId}/role` - Xóa roles

## Description

API để quản lý roles của một account với khả năng thêm, thay thế và xóa roles. Chỉ Admin mới có thể thực hiện thao tác này.

## Authorization

- **Required**: Admin Only
- **Policy**: `AdminOnly`

## Parameters

### Path Parameters

- `userId` (int): ID của user cần cập nhật roles

### Request Body

```json
{
  "userId": 123,
  "roleIds": [2, 3],
  "replaceAll": false
}
```

### Request Body Schema

- `userId` (int): ID của user (phải khớp với userId trong URL)
- `roleIds` (int[]): Mảng các role ID cần thêm/xóa
- `replaceAll` (bool): true = thay thế tất cả roles, false = chỉ thêm roles mới (mặc định: false)

## Behavior

### PUT /api/accounts/{userId}/role

#### 1. Kiểm tra mảng role rỗng

- Nếu `roleIds` là null hoặc rỗng → Trả về "No roles to update" (không thực hiện gì)

#### 2. Kiểm tra account tồn tại

- Nếu account không tồn tại → Trả về 404 "User not found"

#### 3. Logic cập nhật roles

- **Nếu `replaceAll = false`** (mặc định):

  - Lấy danh sách roles hiện tại của user từ bảng `accountroles`
  - So sánh với `roleIds` trong request
  - **Chỉ thêm** các role chưa có (không xóa role cũ)
  - Nếu role đã tồn tại → Bỏ qua, không thêm lại

- **Nếu `replaceAll = true`**:
  - Xóa tất cả roles hiện tại của user
  - Thêm các roles mới từ `roleIds`

### DELETE /api/accounts/{userId}/role

#### 1. Kiểm tra mảng role rỗng

- Nếu `roleIds` là null hoặc rỗng → Trả về "No roles to remove" (không thực hiện gì)

#### 2. Kiểm tra account tồn tại

- Nếu account không tồn tại → Trả về 404 "User not found"

#### 3. Logic xóa roles

- Xóa các roles được chỉ định trong `roleIds`
- **Đặc biệt**: Nếu xóa role "seller" (roleId = 2), tự động deactivate tất cả shops của user

## Response

### Success Response (200 OK)

#### PUT Endpoint

```json
{
  "message": "Account roles updated successfully"
}
```

hoặc

```json
{
  "message": "Account roles replaced successfully"
}
```

#### DELETE Endpoint

```json
{
  "message": "Account roles removed successfully"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "message": "Invalid user ID"
}
```

```json
{
  "message": "User ID in URL and request body must match"
}
```

#### 401 Unauthorized

```json
{
  "message": "Invalid token"
}
```

#### 403 Forbidden

```json
{
  "message": "Access denied. Admin role required"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal server error: [error details]"
}
```

## Example Usage

### Thêm roles mới (không thay thế)

```http
PUT /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": [2, 3],
    "replaceAll": false
}
```

### Thay thế tất cả roles

```http
PUT /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": [1, 3],
    "replaceAll": true
}
```

### Xóa roles

```http
DELETE /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": [2]
}
```

## Notes

- API hỗ trợ cả **thêm** và **xóa** roles
- Nếu xóa role "seller", tất cả shops của user sẽ bị deactivate
- Mảng role rỗng sẽ không thực hiện thao tác gì
- Chỉ Admin mới có thể thực hiện thao tác này
- Sử dụng **Dapper** để tránh Entity Framework tracking issues với bảng không có primary key

## Technical Implementation

- Sử dụng **Dapper** để xử lý raw SQL queries
- Sử dụng `INSERT IGNORE` để tránh duplicate entries
- Sử dụng `DELETE` để xóa roles
- Raw SQL: `INSERT IGNORE INTO accountroles (accountId, roleId) VALUES (@accountId, @roleId)`
- Không cần thay đổi models được scaffold từ database
- Tránh hoàn toàn Entity Framework tracking issues

## Dapper Benefits

- **Performance**: Nhanh hơn Entity Framework cho raw SQL
- **Flexibility**: Linh hoạt với các query phức tạp
- **No Tracking**: Không có vấn đề tracking với bảng không có primary key
- **Simple**: Dễ sử dụng và maintain
