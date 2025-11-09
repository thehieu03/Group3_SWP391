## Accounts API - Thay đổi liên quan ảnh (base64 → URL)

### 1) Cập nhật hồ sơ người dùng (Upload avatar)

- Endpoint: `PUT /api/accounts/profile`
- Auth: Bearer token
- Yêu cầu: `multipart/form-data`
- Trường form:
  - `username` (string, optional)
  - `phone` (string, optional)
  - `avatar` (file, optional)

Request (ví dụ curl):

```bash
curl -X PUT "${API_BASE}/api/accounts/profile" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "username=john" \
  -F "phone=0123456789" \
  -F "avatar=@/path/to/image.jpg"
```

Response:

```json
{
  "message": "Profile updated successfully"
}
```

Thay đổi so với trước:

- Trước: FE có thể gửi avatar dạng base64 trong JSON.
- Nay: FE gửi file ảnh qua `multipart/form-data` (không còn base64). BE lưu file và sau đó cung cấp URL ảnh qua các API đọc tài khoản.

Ảnh hiển thị:

- Sau khi cập nhật, gọi API lấy thông tin tài khoản để nhận `imageUrl` (đường dẫn tương đối, ví dụ `/Images/Accounts/xxx.jpg`).
- Nếu FE khác origin: dùng `${API_BASE}${imageUrl}`.

---

### 2) Đăng nhập/Đăng ký Google

- Endpoint: `POST /api/accounts/google`
- Body (JSON) tối thiểu: `googleId`, `email`, `username`, `image` (URL, optional)

Request (ví dụ):

```json
{
  "googleId": "1234567890",
  "email": "john@example.com",
  "username": "John",
  "image": "https://lh3.googleusercontent.com/a/....=s96-c"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3600
}
```

Thay đổi so với trước:

- Trước: FE có thể gửi ảnh base64.
- Nay: FE chỉ cần gửi URL ảnh của Google trong field `image`. BE sẽ tải, lưu vào `Images/Accounts` và các API đọc tài khoản sau đó sẽ trả `imageUrl` (URL tương đối).

---

### 3) Lấy danh sách/từng tài khoản (UserResponse)

- Ví dụ: `GET /api/accounts` (OData), hoặc các endpoint trả `UserResponse`

Response (ví dụ - mới):

```json
{
  "id": 12,
  "username": "john",
  "email": "john@example.com",
  "imageUrl": "/Images/Accounts/2b1f...a7.jpg",
  "imageUploadedAt": "2025-11-05T12:34:56Z",
  "roles": ["USER"]
}
```

Thay đổi so với trước:

- Trước: ảnh có thể là base64.
- Nay: `imageUrl` là đường dẫn URL tương đối đến file ảnh đã lưu.
