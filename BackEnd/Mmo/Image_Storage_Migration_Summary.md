# ✅ Image Storage Migration Summary

## 📋 Tổng quan

Đã chuyển đổi hoàn toàn từ lưu trữ hình ảnh dạng **byte[] (base64)** sang **ImageUrl (string)** với cấu trúc folder riêng biệt.

---

## ✅ Folder Structure

```
Mmo_Api/
└── Images/
    ├── Accounts/    # User avatars
    ├── Products/    # Product images
    └── Shops/       # Shop identification images (CMND/CCCD)
```

---

## ✅ Models Updated

### Account Model

```csharp
// Before: byte[]? Image
// After:
public string? ImageUrl { get; set; }
public DateTime? ImageUploadedAt { get; set; }

// Before: byte[]? IdentificationF, byte[]? IdentificationB
// After:
public string? IdentificationFurl { get; set; }
public DateTime? IdentificationFuploadedAt { get; set; }
public string? IdentificationBurl { get; set; }
public DateTime? IdentificationBuploadedAt { get; set; }
```

### Product Model

```csharp
// Before: byte[]? Image
// After:
public string? ImageUrl { get; set; }
public DateTime? ImageUploadedAt { get; set; }
```

### Imagemessage Model

```csharp
// Before: byte[] Image
// After:
public string ImageUrl { get; set; } = null!;
```

---

## ✅ Code Updated

### 1. **AccountController - UpdateProfile**

- ✅ Lưu avatar vào folder `Images/Accounts/`
- ✅ Xóa logic base64 conversion
- ✅ Trả về `ImageUrl` thay vì `avatarBase64`

**Before:**

```csharp
account.Image = ms.ToArray(); // byte[]
```

**After:**

```csharp
var imageUrl = await _imageService.SaveImageFromStreamAsync(
    avatar.OpenReadStream(),
    avatar.FileName,
    "Accounts"
);
account.ImageUrl = imageUrl;
account.ImageUploadedAt = DateTime.UtcNow;
```

---

### 2. **AccountController - Google Login**

- ✅ Download Google avatar và lưu vào `Images/Accounts/`
- ✅ Lưu URL thay vì byte[]

**After:**

```csharp
var imageBytes = await HelperImage.DownloadImageFromUrlAsync(request.Image);
imageUrl = await _imageService.SaveImageAsync(imageBytes, $"{request.GoogleId}_avatar.jpg", "Accounts");
account.ImageUrl = imageUrl;
```

---

### 3. **AuthController - GetCurrentUser**

- ✅ Xóa logic convert base64
- ✅ Trả về `ImageUrl` trực tiếp

**Before:**

```csharp
string? avatarBase64 = null;
if (account.Image != null && account.Image.Length > 0)
{
    avatarBase64 = Convert.ToBase64String(account.Image);
}
AvatarBase64 = avatarBase64;
```

**After:**

```csharp
ImageUrl = account.ImageUrl; // Direct URL
```

---

### 4. **TokenServices - GenerateTokensAsync**

- ✅ Xóa logic convert base64
- ✅ Trả về `ImageUrl` trực tiếp

**After:**

```csharp
User = new AccountResponse
{
    // ...
    ImageUrl = account.ImageUrl, // Direct URL
    // ...
}
```

---

### 5. **ShopController - RegisterShop**

- ✅ Lưu identification images vào folder `Images/Shops/`
- ✅ Lưu URL thay vì byte[]

**After:**

```csharp
var identificationFurl = await _imageService.SaveImageFromStreamAsync(
    identificationF.OpenReadStream(),
    identificationF.FileName,
    "Shops"
);

var identificationBurl = await _imageService.SaveImageFromStreamAsync(
    identificationB.OpenReadStream(),
    identificationB.FileName,
    "Shops"
);

account.IdentificationFurl = identificationFurl;
account.IdentificationBurl = identificationBurl;
account.IdentificationFuploadedAt = DateTime.UtcNow;
account.IdentificationBuploadedAt = DateTime.UtcNow;
```

---

### 6. **ProductsController - CreateProduct**

- ✅ Lưu product images vào folder `Images/Products/`
- ✅ Đã có sẵn logic đúng

```csharp
var imageUrl = await _imageService.SaveImageFromStreamAsync(
    image.OpenReadStream(),
    image.FileName,
    "Products"
);
productAdd.ImageUrl = imageUrl;
productAdd.ImageUploadedAt = DateTime.UtcNow;
```

---

### 7. **AccountResponse**

- ✅ Xóa `Avatar` (byte[])
- ✅ Xóa `AvatarBase64` (string)
- ✅ Chỉ còn `ImageUrl` (string)

**After:**

```csharp
public string? ImageUrl { get; set; }
```

---

### 8. **ShopResponse**

- ✅ Đổi từ `byte[]` sang `string` URL

**After:**

```csharp
public string? IdentificationFurl { get; set; }
public string? IdentificationBurl { get; set; }
```

---

### 9. **MapperClass**

- ✅ Update mapping cho ShopResponse

**After:**

```csharp
.ForMember(d => d.IdentificationFurl,
    opt => opt.MapFrom(src => src.Account != null ? src.Account.IdentificationFurl : null))
.ForMember(d => d.IdentificationBurl,
    opt => opt.MapFrom(src => src.Account != null ? src.Account.IdentificationBurl : null));
```

---

## ✅ ImageService Configuration

**Base Path:** `Mmo_Api/Images/`  
**Base URL:** `/Images/`

**Folders:**

- `Images/Accounts/` → URL: `/Images/Accounts/{filename}`
- `Images/Products/` → URL: `/Images/Products/{filename}`
- `Images/Shops/` → URL: `/Images/Shops/{filename}`

---

## ✅ Static Files Configuration

**Middleware:** `UseStaticFiles()` đã được enable

**Access URL Examples:**

- Avatar: `http://localhost:5134/Images/Accounts/avatar_abc123.jpg`
- Product: `http://localhost:5134/Images/Products/product_xyz789.jpg`
- Identification: `http://localhost:5134/Images/Shops/id_123456.jpg`

---

## 📝 Response Format

### GET /api/auth/me

```json
{
  "id": 17,
  "username": "User",
  "email": "user@example.com",
  "imageUrl": "/Images/Accounts/avatar_abc123.jpg", // ← URL string
  "isActive": true,
  "roles": ["CUSTOMER"]
}
```

### POST /api/auth/login

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": 17,
    "imageUrl": "/Images/Accounts/avatar_abc123.jpg",  // ← URL string
    ...
  }
}
```

### GET /api/shops

```json
{
  "id": 1,
  "name": "Shop Name",
  "identificationFurl": "/Images/Shops/id_front_123.jpg",  // ← URL string
  "identificationBurl": "/Images/Shops/id_back_123.jpg",    // ← URL string
  ...
}
```

---

## ✅ Benefits

1. **Performance:**

   - ✅ Không cần load toàn bộ image vào memory
   - ✅ CDN support
   - ✅ Browser caching

2. **Scalability:**

   - ✅ Database nhỏ hơn (không lưu BLOB)
   - ✅ Có thể migrate sang cloud storage (S3, Azure Blob)

3. **Maintainability:**
   - ✅ Dễ quản lý và backup images
   - ✅ Dễ xóa và thay thế images

---

## 🧪 Testing

### Test 1: Upload Avatar

```bash
PUT /api/accounts/profile
Content-Type: multipart/form-data
- avatar: <image file>

Expected:
- ImageUrl: "/Images/Accounts/avatar_xxx.jpg"
- File exists in: Mmo_Api/Images/Accounts/
```

### Test 2: Access Image

```bash
GET http://localhost:5134/Images/Accounts/avatar_xxx.jpg

Expected:
- Image file được serve thành công
```

### Test 3: Register Shop

```bash
POST /api/shops/register
- identificationF: <image file>
- identificationB: <image file>

Expected:
- IdentificationFurl: "/Images/Shops/xxx.jpg"
- IdentificationBurl: "/Images/Shops/xxx.jpg"
```

---

## ⚠️ Important Notes

1. **Static Files:**

   - ✅ `UseStaticFiles()` middleware đã được enable
   - ✅ Images accessible tại `/Images/{folder}/{filename}`

2. **File Deletion:**

   - ✅ Old images tự động được delete khi update
   - ✅ ImageService có logic delete trong `DeleteImage()`

3. **Database Migration:**
   - ✅ Models đã được update
   - ✅ Cần chạy migration để thêm columns mới vào database

---

## 📊 Summary

**Before:**

- ❌ Lưu images dạng byte[] trong database
- ❌ Convert sang base64 để trả về
- ❌ Tốn memory và database size

**After:**

- ✅ Lưu images vào file system (Images folder)
- ✅ Lưu URL string trong database
- ✅ Trả về URL trực tiếp
- ✅ Performance tốt hơn, scalable hơn

---

**Status:** ✅ **COMPLETED**

**All code updated to use ImageUrl instead of byte[] base64!**
