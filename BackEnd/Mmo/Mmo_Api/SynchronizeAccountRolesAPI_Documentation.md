# Synchronize Account Roles API Documentation

## Endpoint

**PUT** `/api/accounts/{userId}/role`

## Description

API để **synchronize** roles của một account. Roles cuối cùng sẽ chính xác bằng với list mà frontend gửi về. Chỉ Admin mới có thể thực hiện thao tác này.

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
  "roleIds": [1, 3]
}
```

### Request Body Schema

- `userId` (int): ID của user (phải khớp với userId trong URL)
- `roleIds` (int[]): Mảng các role ID cuối cùng mà user sẽ có

## Behavior

### 1. Kiểm tra list null

- Nếu `roleIds` là null → Trả về "No roles to update" (không thực hiện gì)

### 2. Kiểm tra account tồn tại

- Nếu account không tồn tại → Trả về 404 "User not found"

### 3. Logic Synchronize Roles

- **Lấy roles hiện tại** của user từ database
- **So sánh** với `roleIds` trong request
- **Thêm** các roles có trong `roleIds` nhưng chưa có trong database
- **Xóa** các roles có trong database nhưng không có trong `roleIds`
- **Kết quả**: Roles cuối cùng sẽ chính xác bằng với `roleIds` từ frontend

### 4. Xử lý đặc biệt

- **Nếu list rỗng `[]`**: Xóa tất cả roles của user
- **Nếu xóa role "seller" (roleId = 2)**: Tự động deactivate tất cả shops của user

## Ví dụ cụ thể

### Ví dụ 1: User có 2 roles, frontend gửi 1 role

- **Database hiện tại**: User có roles `[1, 2]` (Customer, Seller)
- **Frontend gửi**: `[1]` (chỉ Customer)
- **Kết quả**: User chỉ còn role `[1]` (Customer), role Seller bị xóa
- **Shops**: Tất cả shops của user bị deactivate

### Ví dụ 2: User có 1 role, frontend gửi 2 roles

- **Database hiện tại**: User có role `[1]` (Customer)
- **Frontend gửi**: `[1, 2]` (Customer, Seller)
- **Kết quả**: User có roles `[1, 2]` (Customer, Seller)

### Ví dụ 3: Frontend gửi list rỗng

- **Database hiện tại**: User có roles `[1, 2]` (Customer, Seller)
- **Frontend gửi**: `[]` (rỗng)
- **Kết quả**: User không còn role nào, tất cả shops bị deactivate

## Response

### Success Response (200 OK)

```json
{
  "message": "Account roles updated successfully"
}
```

### Special Cases

```json
{
  "message": "No roles to update"
}
```

```json
{
  "message": "All roles removed successfully"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "message": "Invalid user ID"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

## Example Usage

### Synchronize roles (chỉ giữ Customer)

```http
PUT /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": [1]
}
```

### Synchronize roles (Customer + Seller)

```http
PUT /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": [1, 2]
}
```

### Xóa tất cả roles

```http
PUT /api/accounts/123/role
Authorization: Bearer [admin_token]
Content-Type: application/json

{
    "userId": 123,
    "roleIds": []
}
```

## Notes

- **Synchronize Mode**: Roles cuối cùng = chính xác với `roleIds` từ frontend
- **Không duplicate**: Tự động loại bỏ roles trùng lặp
- **Auto deactivate shops**: Khi xóa role seller
- **Null safety**: Nếu `roleIds` null thì không làm gì
- **Empty list**: Nếu `roleIds` rỗng thì xóa tất cả roles

## Technical Implementation

- Sử dụng **Dapper** để xử lý raw SQL queries
- **Synchronize logic**: So sánh roles hiện tại vs roles mới
- **Bulk operations**: Thêm và xóa roles trong một transaction
- **Shop deactivation**: Tự động khi xóa seller role
- **Performance**: Sử dụng bulk insert/delete cho hiệu suất tốt
