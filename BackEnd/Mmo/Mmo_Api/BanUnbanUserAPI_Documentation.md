# Ban/Unban User API Documentation

## Endpoint

**PUT** `/api/accounts/{userId}/status`

## Description

API để ban (khóa) hoặc unban (mở khóa) người dùng. Chỉ Admin mới có quyền thực hiện thao tác này.

## Authorization

- **Required**: Admin Only
- **Policy**: `AdminOnly`

## Parameters

### Path Parameters

- `userId` (int): ID của user cần ban/unban

### Request Body

```json
{
  "userId": 15,
  "isActive": false
}
```

### Request Body Schema

- `userId` (int): ID của user (phải khớp với userId trong URL)
- `isActive` (boolean):
  - `false` = Ban user (khóa tài khoản)
  - `true` = Unban user (mở khóa tài khoản)

## Business Logic

### Ban User (isActive = false)

- Cập nhật `isActive = false` trong bảng `accounts`
- Cập nhật `updatedAt` với thời gian hiện tại
- Ghi log audit: `[AUDIT] User {userId} BANNED at {timestamp}`

### Unban User (isActive = true)

- Cập nhật `isActive = true` trong bảng `accounts`
- Cập nhật `updatedAt` với thời gian hiện tại
- Ghi log audit: `[AUDIT] User {userId} UNBANNED at {timestamp}`

## Response

### Success Response (200 OK)

```json
{
  "message": "User banned successfully"
}
```

```json
{
  "message": "User unbanned successfully"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "message": "Request body cannot be null"
}
```

```json
{
  "message": "User ID in URL and request body must match"
}
```

```json
{
  "message": "Invalid user ID"
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden"
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
  "message": "Failed to update user status"
}
```

```json
{
  "message": "Internal server error: {error details}"
}
```

## Example Usage

### Ban User

```http
PUT /api/accounts/15/status
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "userId": 15,
  "isActive": false
}
```

**Response:**

```json
{
  "message": "User banned successfully"
}
```

### Unban User

```http
PUT /api/accounts/15/status
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "userId": 15,
  "isActive": true
}
```

**Response:**

```json
{
  "message": "User unbanned successfully"
}
```

## Test Cases

### Test Case 1: Ban user thành công

- **Input**: `{"userId": 15, "isActive": false}`
- **Expected**: 200 OK, `"User banned successfully"`
- **Database**: `isActive = false`, `updatedAt` updated

### Test Case 2: Unban user thành công

- **Input**: `{"userId": 15, "isActive": true}`
- **Expected**: 200 OK, `"User unbanned successfully"`
- **Database**: `isActive = true`, `updatedAt` updated

### Test Case 3: User không tồn tại

- **Input**: `{"userId": 999, "isActive": false}`
- **Expected**: 404 Not Found, `"User not found"`

### Test Case 4: Không có quyền (không phải Admin)

- **Input**: `{"userId": 15, "isActive": false}`
- **Expected**: 403 Forbidden

### Test Case 5: Request body null

- **Input**: `null`
- **Expected**: 400 Bad Request, `"Request body cannot be null"`

### Test Case 6: User ID không khớp

- **Input**: URL `/api/accounts/15/status`, Body `{"userId": 20, "isActive": false}`
- **Expected**: 400 Bad Request, `"User ID in URL and request body must match"`

## Security Features

### Authorization

- Chỉ Admin mới có quyền ban/unban users
- Sử dụng JWT token để xác thực
- Policy `AdminOnly` được áp dụng

### Validation

- Kiểm tra user tồn tại trước khi cập nhật
- Validate userId phải là số dương
- Kiểm tra userId trong URL và body phải khớp
- Sanitize input để tránh SQL injection

### Audit Logging

- Ghi log mọi thay đổi trạng thái user
- Format: `[AUDIT] User {userId} {ACTION} at {timestamp}`
- Log được ghi vào console (có thể mở rộng để ghi vào file)

## Database Schema

### Required Field

```sql
-- Bảng accounts cần có field:
ALTER TABLE accounts ADD COLUMN isActive BOOLEAN DEFAULT true;

-- Index cho performance:
CREATE INDEX idx_accounts_isactive ON accounts(isActive);
```

### Sample Data

```sql
-- User bình thường
INSERT INTO accounts (accountId, username, email, isActive, createdAt, updatedAt)
VALUES (15, 'testuser', 'test@example.com', true, NOW(), NOW());

-- User bị ban
UPDATE accounts SET isActive = false, updatedAt = NOW() WHERE accountId = 15;
```

## Frontend Integration

### JavaScript/TypeScript

```javascript
// Ban user
const banUser = async (userId) => {
  const response = await fetch(`/api/accounts/${userId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      isActive: false,
    }),
  });

  const result = await response.json();
  return result;
};

// Unban user
const unbanUser = async (userId) => {
  const response = await fetch(`/api/accounts/${userId}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      isActive: true,
    }),
  });

  const result = await response.json();
  return result;
};
```

### React Component Example

```jsx
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateUserStatus = async (userId, isActive) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          isActive: isActive,
        }),
      });

      if (response.ok) {
        // Refresh user list
        await fetchUsers();
        alert(
          isActive ? "User unbanned successfully" : "User banned successfully"
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {users.map((user) => (
        <div key={user.accountId}>
          <span>{user.username}</span>
          <button
            onClick={() => updateUserStatus(user.accountId, !user.isActive)}
            disabled={loading}
          >
            {user.isActive ? "Ban" : "Unban"}
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Performance Considerations

### Database Indexing

- Index trên `isActive` field để query nhanh
- Index trên `updatedAt` nếu cần sort theo thời gian

### Caching

- Có thể cache danh sách users để giảm database calls
- Invalidate cache khi có thay đổi trạng thái

### Rate Limiting

- Implement rate limiting để tránh spam ban/unban
- Giới hạn số lần ban/unban trong một khoảng thời gian

## Monitoring & Alerting

### Logs to Monitor

- `[AUDIT]` logs cho mọi thay đổi trạng thái
- `[ERROR]` logs cho các lỗi cập nhật
- Response time của API

### Metrics to Track

- Số lượng users bị ban/unban per day
- Thời gian response của API
- Error rate của API

## Troubleshooting

### Common Issues

#### 1. User not found (404)

- **Cause**: User ID không tồn tại trong database
- **Solution**: Kiểm tra user ID có đúng không

#### 2. Forbidden (403)

- **Cause**: Token không có quyền Admin
- **Solution**: Kiểm tra token và role của user

#### 3. Failed to update (500)

- **Cause**: Lỗi database hoặc connection
- **Solution**: Kiểm tra database connection và logs

#### 4. Invalid user ID (400)

- **Cause**: User ID <= 0 hoặc không phải số
- **Solution**: Validate input trước khi gửi request

## Changelog

### Version 1.0.0

- ✅ Initial implementation
- ✅ Ban/Unban functionality
- ✅ Admin authorization
- ✅ Input validation
- ✅ Audit logging
- ✅ Error handling
- ✅ API documentation
