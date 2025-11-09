# 🔧 Backend Fix: Avatar Base64 không được trả về

## 📋 Vấn đề

API `GET /api/auth/me` không trả về field `avatarBase64` sau khi frontend update profile với avatar.

---

## ✅ Đã sửa

### 1. **Thêm JsonPropertyName attribute**

**File:** `Mmo_Domain/ModelResponse/AccountResponse.cs`

```csharp
using System.Text.Json.Serialization;

public class AccountResponse
{
    // ... other properties

    [JsonPropertyName("avatarBase64")]
    public string? AvatarBase64 { get; set; }

    // ... other properties
}
```

**Lý do:** Đảm bảo property được serialize với tên `avatarBase64` (camelCase) thay vì `AvatarBase64` (PascalCase).

---

### 2. **Cấu hình JSON CamelCase Naming Policy**

**File:** `Mmo_Api/Boostraping/RegisterMiddleware.cs`

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    })
    .AddOData(options => { /* ... */ });
```

**Lý do:** Đảm bảo tất cả properties được serialize với camelCase naming convention, phù hợp với JavaScript/TypeScript frontend.

---

### 3. **Logic convert avatar đã có sẵn**

**File:** `Mmo_Api/Api/AuthController.cs`

```csharp
// Convert Image (byte[]) to base64 string
string? avatarBase64 = null;
if (account.Image != null && account.Image.Length > 0)
{
    avatarBase64 = Convert.ToBase64String(account.Image);
}

var userResponse = new AccountResponse
{
    // ... other properties
    AvatarBase64 = avatarBase64, // ✅ Đã set
    // ... other properties
};
```

**Lý do:** Logic này đã có từ trước, đảm bảo convert `account.Image` (byte[]) thành base64 string.

---

## 🧪 Testing Steps

### Step 1: Rebuild & Restart Backend

```bash
# Clean và rebuild project
dotnet clean
dotnet build

# Restart API server
dotnet run --project Mmo_Api
```

---

### Step 2: Test API với Postman/curl

**Request:**

```bash
curl -X GET "http://localhost:5134/api/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "id": 17,
  "username": "Hieu Nguyen The",
  "email": "hieunthe171211@gmail.com",
  "phone": "0926278500",
  "balance": 0,
  "avatar": null,
  "avatarBase64": "iVBORw0KGgoAAAANSUhEUgAA...", // ← Phải có field này
  "isActive": true,
  "createdAt": "2025-10-29T14:14:19",
  "roles": ["CUSTOMER"]
}
```

---

### Step 3: Verify với User có avatar

1. **Upload avatar trước:**

   ```bash
   curl -X PUT "http://localhost:5134/api/accounts/profile" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "avatar=@/path/to/image.jpg"
   ```

2. **Gọi GET /api/auth/me:**

   ```bash
   curl -X GET "http://localhost:5134/api/auth/me" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Kiểm tra response có `avatarBase64`** không null.

---

### Step 4: Verify với User chưa có avatar

1. **Gọi GET /api/auth/me với user chưa upload avatar**
2. **Kiểm tra response có `avatarBase64: null`**

---

## 🔍 Debug Checklist

Nếu vẫn không thấy `avatarBase64` trong response:

### ✅ Check 1: Code đã được rebuild chưa?

```bash
# Check bin/Debug folder có file .dll mới nhất không
ls -la Mmo_Api/bin/Debug/net8.0/
```

**Fix:** Rebuild project và restart server.

---

### ✅ Check 2: Account có Image data không?

Thêm debug log trong `AuthController.GetCurrentUser()`:

```csharp
var account = await _accountServices.GetByIdAsync(userId);

// Debug: Check Image data
Console.WriteLine($"[DEBUG] Account Image: {(account.Image != null ? $"Length={account.Image.Length}" : "NULL")}");

if (account.Image != null && account.Image.Length > 0)
{
    avatarBase64 = Convert.ToBase64String(account.Image);
    Console.WriteLine($"[DEBUG] Avatar Base64 Length: {avatarBase64.Length}");
}
```

**Expected:** Console log hiển thị Image length > 0 và Base64 length > 0.

---

### ✅ Check 3: Property được set đúng không?

Thêm debug log:

```csharp
var userResponse = new AccountResponse
{
    // ... other properties
    AvatarBase64 = avatarBase64,
    // ... other properties
};

// Debug: Verify property value
Console.WriteLine($"[DEBUG] UserResponse.AvatarBase64: {(userResponse.AvatarBase64 != null ? $"Length={userResponse.AvatarBase64.Length}" : "NULL")}");

return Ok(userResponse);
```

**Expected:** Console log hiển thị AvatarBase64 có giá trị.

---

### ✅ Check 4: JSON Serialization có hoạt động không?

Thử serialize thủ công để test:

```csharp
var json = System.Text.Json.JsonSerializer.Serialize(userResponse, new System.Text.Json.JsonSerializerOptions
{
    PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
    WriteIndented = true
});

Console.WriteLine($"[DEBUG] Serialized JSON: {json}");
```

**Expected:** JSON string có field `"avatarBase64"`.

---

### ✅ Check 5: Database có data không?

Query trực tiếp database:

```sql
SELECT id, username,
       CASE
           WHEN image IS NULL THEN 'NULL'
           WHEN LENGTH(image) = 0 THEN 'EMPTY'
           ELSE CONCAT('Length: ', LENGTH(image))
       END as image_status
FROM accounts
WHERE id = 17;
```

**Expected:** image_status phải là "Length: XXXX" (với XXXX > 0).

---

## 🚨 Common Issues & Solutions

### Issue 1: Property name vẫn là PascalCase trong response

**Symptom:** Response có `"AvatarBase64"` thay vì `"avatarBase64"`

**Solution:**

- ✅ Đã thêm `[JsonPropertyName("avatarBase64")]` - Kiểm tra lại code
- ✅ Đã config `PropertyNamingPolicy.CamelCase` - Kiểm tra lại

**Verify:** Rebuild và restart server.

---

### Issue 2: avatarBase64 luôn là null

**Symptom:** Field có trong response nhưng giá trị là `null`

**Possible Causes:**

1. `account.Image` là `null` hoặc empty
2. Logic convert không chạy

**Solution:**

- Check database có Image data không
- Thêm debug log như ở Check 2 ở trên

---

### Issue 3: Field không có trong response

**Symptom:** Response không có field `avatarBase64` hoàn toàn

**Possible Causes:**

1. Code chưa được rebuild
2. Property không được serialize (có `[JsonIgnore]` attribute?)

**Solution:**

- Rebuild project
- Check xem có `[JsonIgnore]` trên property `AvatarBase64` không
- Verify JsonPropertyName attribute đã được apply

---

## 📝 Code Changes Summary

### Files Modified:

1. **Mmo_Domain/ModelResponse/AccountResponse.cs**

   - ✅ Thêm `using System.Text.Json.Serialization;`
   - ✅ Thêm `[JsonPropertyName("avatarBase64")]` attribute

2. **Mmo_Api/Boostraping/RegisterMiddleware.cs**

   - ✅ Thêm `.AddJsonOptions()` với CamelCase naming policy

3. **Mmo_Api/Api/AuthController.cs**
   - ✅ Logic convert avatar đã có sẵn (không cần sửa)

---

## ✅ Verification

Sau khi rebuild và restart, test:

```bash
# 1. Upload avatar
curl -X PUT "http://localhost:5134/api/accounts/profile" \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@test.jpg"

# 2. Get user info
curl -X GET "http://localhost:5134/api/auth/me" \
  -H "Authorization: Bearer TOKEN"
```

**Expected Result:**

```json
{
  "avatarBase64": "iVBORw0KGgoAAAANSUhEUgAA..." // ← Phải có field này với giá trị
}
```

---

## 📞 Next Steps

1. ✅ **Rebuild & Restart** backend server
2. ✅ **Test** với Postman/curl
3. ✅ **Verify** response có `avatarBase64`
4. ✅ **Deploy** lên environment nếu test OK
5. ✅ **Notify** frontend team để test integration

---

**Status:** ✅ **FIXED - Cần rebuild & test**

**Priority:** 🔴 **HIGH** - Avatar không hiển thị được
