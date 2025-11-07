# API Quên Mật Khẩu

## Endpoint

```
POST /api/auth/forgot-password
```

## Request Body

```json
{
  "email": "string"
}
```

## Response Success (200 OK)

```json
{
  "message": "string"
}
```

## Response Error (400 Bad Request)

```json
{
  "message": "Email không hợp lệ hoặc không tồn tại"
}
```

## Response Error (500 Internal Server Error)

```json
{
  "message": "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau."
}
```

## Yêu cầu Backend

- Validate email format
- Kiểm tra email có tồn tại trong database
- Tạo mật khẩu mới ngẫu nhiên
- Cập nhật mật khẩu mới vào database
- Gửi mật khẩu mới qua email (Google/Gmail SMTP)
- Trả về message thành công hoặc lỗi
