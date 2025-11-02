# ⚠️ Vấn đề Backend - Avatar Base64 không được trả về

## 🔴 Vấn đề hiện tại

Sau khi frontend update profile với avatar, API `GET /api/auth/me` **KHÔNG trả về field `avatarBase64`**.

### Response hiện tại từ Backend:

```json
{
  "id": 17,
  "username": "Hieu Nguyen The",
  "email": "hieunthe171211@gmail.com",
  "phone": "0926278500",
  "balance": 0,
  "avatar": null, // ← Field byte array (không dùng được)
  "isActive": true,
  "createdAt": "2025-10-29T14:14:19",
  "roles": ["CUSTOMER"]
  // ❌ THIẾU field "avatarBase64"
}
```

### Response mong đợi:

```json
{
  "id": 17,
  "username": "Hieu Nguyen The",
  "email": "hieunthe171211@gmail.com",
  "phone": "0926278500",
  "balance": 0,
  "avatar": null,
  "avatarBase64": "iVBORw0KGgoAAAANSUhEUgAA...", // ← CẦN THÊM FIELD NÀY
  "isActive": true,
  "createdAt": "2025-10-29T14:14:19",
  "roles": ["CUSTOMER"]
}
```

---

## ✅ Giải pháp

Backend cần **sửa API `GET /api/auth/me`** để:

1. ✅ Lấy field `Image` (byte[]) từ database
2. ✅ Convert byte[] thành base64 string
3. ✅ Thêm field `avatarBase64` vào response

### Code C# cần thêm:

```csharp
[HttpGet("me")]
public async Task<IActionResult> GetCurrentUser()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    var account = await _accountService.GetByIdAsync(userId);

    if (account == null)
        return NotFound(new { message = "User not found" });

    // ✅ THÊM PHẦN NÀY: Convert Image (byte[]) to base64 string
    string avatarBase64 = null;
    if (account.Image != null && account.Image.Length > 0)
    {
        avatarBase64 = Convert.ToBase64String(account.Image);
        // Optional: Add data URI prefix (frontend sẽ tự thêm nếu cần)
        // avatarBase64 = $"data:image/jpeg;base64,{avatarBase64}";
    }

    var userResponse = new
    {
        id = account.Id,
        username = account.Username,
        email = account.Email,
        phone = account.Phone,
        balance = account.Balance,
        avatarBase64 = avatarBase64, // ✅ THÊM FIELD NÀY
        isActive = account.IsActive,
        createdAt = account.CreatedAt,
        roles = account.Roles.Select(r => r.Name).ToList()
    };

    return Ok(userResponse);
}
```

---

## 🧪 Kiểm tra sau khi sửa

1. **Upload avatar** qua `PUT /api/accounts/profile`
2. **Gọi `GET /api/auth/me`**
3. **Kiểm tra response có field `avatarBase64`** không null

**Expected:**

```json
{
  "avatarBase64": "iVBORw0KGgoAAAANSUhEUgAA..." // ← Phải có giá trị
}
```

---

## 📝 Lưu ý

- Field `avatar` (byte[]) có thể giữ nguyên để backward compatibility
- Field `avatarBase64` là **optional** (có thể null nếu user chưa có avatar)
- Base64 string **không cần data URI prefix** (frontend sẽ tự thêm)

---

## 🔗 Tài liệu tham khảo

Xem file `FRONTEND_READY_FOR_BACKEND_UPDATE.md` để biết frontend đã sẵn sàng như thế nào.

---

**Status:** ⚠️ **BLOCKED - Cần backend fix trước**

**Priority:** 🔴 **HIGH** - Avatar không hiển thị được sau khi upload
