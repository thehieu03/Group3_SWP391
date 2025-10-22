# Account Management APIs Documentation

## Overview
Các API này cho phép Admin quản lý tài khoản người dùng trong hệ thống, bao gồm cập nhật và xóa tài khoản.

## Authentication
Tất cả các API đều yêu cầu JWT token với role ADMIN.

## APIs

### 1. Update Account
**Endpoint:** `PUT /api/accounts/{id}`

**Authorization:** Admin Only

**Description:** Cập nhật thông tin tài khoản người dùng

**Request Body:**
```json
{
  "id": 2,
  "username": "updated_user",
  "email": "updated@example.com", 
  "phone": "0901234567",
  "balance": 1000000,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "roles": ["USER"]
}
```

**Response Codes:**
- `200 OK`: Cập nhật thành công
- `400 Bad Request`: Dữ liệu không hợp lệ hoặc username/email đã tồn tại
- `401 Unauthorized`: Token không hợp lệ hoặc chưa đăng nhập
- `403 Forbidden`: Không có quyền ADMIN
- `404 Not Found`: Không tìm thấy tài khoản
- `500 Internal Server Error`: Lỗi server

### 2. Delete Account
**Endpoint:** `DELETE /api/accounts/{id}`

**Authorization:** Admin Only

**Description:** Xóa tài khoản người dùng

**Security Feature:** Admin không thể xóa chính tài khoản của mình

**Response Codes:**
- `200 OK`: Xóa thành công
- `400 Bad Request`: 
  - ID không hợp lệ
  - Admin cố gắng xóa chính mình
- `401 Unauthorized`: Token không hợp lệ hoặc chưa đăng nhập
- `403 Forbidden`: Không có quyền ADMIN
- `404 Not Found`: Không tìm thấy tài khoản
- `500 Internal Server Error`: Lỗi server

## Security Features

### 1. Admin Self-Delete Protection
- Admin không thể xóa chính tài khoản của mình
- API sẽ trả về lỗi `400 Bad Request` với message "Admin cannot delete their own account"

### 2. Authorization
- Tất cả API đều yêu cầu role ADMIN
- Sử dụng policy "AdminOnly" đã được cấu hình

### 3. Validation
- Kiểm tra ID hợp lệ (> 0)
- Kiểm tra username/email không trùng lặp
- Kiểm tra model validation

## Usage Examples

### Update Account
```bash
curl -X PUT "https://localhost:7000/api/accounts/2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 2,
    "username": "new_username",
    "email": "new@example.com",
    "phone": "0901234567",
    "balance": 1000000,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "roles": ["USER"]
  }'
```

### Delete Account
```bash
curl -X DELETE "https://localhost:7000/api/accounts/2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## Error Messages

| Error Code | Message | Description |
|------------|---------|-------------|
| 400 | "Invalid account ID" | ID không hợp lệ |
| 400 | "Admin cannot delete their own account" | Admin cố gắng xóa chính mình |
| 400 | "Update failed. Username or email may already exist" | Username/email đã tồn tại |
| 400 | "Failed to delete account" | Không thể xóa tài khoản |
| 401 | "Invalid token" | Token không hợp lệ |
| 403 | "Forbidden" | Không có quyền ADMIN |
| 404 | "Account not found" | Không tìm thấy tài khoản |
| 500 | "Internal server error: {message}" | Lỗi server |

## Notes
- API này chỉ dành cho Admin quản lý tài khoản người dùng
- Để cập nhật profile cá nhân, sử dụng API `PUT /api/accounts/profile`
- Tất cả thay đổi sẽ được ghi lại trong `UpdatedAt` field
