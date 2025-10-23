# 🔍 Frontend Debug Checklist

## Hiện tại đang bị: **Lỗi trắng tinh**

### ✅ Các bước đã làm:
1. ✅ Sửa lỗi typo trong App.tsx (`requiredRolnpm es` → `requiredRoles`)
2. ✅ Tạo lại ProductApproval.tsx (file bị mất nội dung)
3. ✅ Tạo ProductApprovalSimple.tsx để debug
4. ✅ Tất cả files không có lỗi lint

### 🔍 Các bước debug:

#### Step 1: Check Console
```
1. Mở browser
2. Nhấn F12
3. Vào tab Console
4. Xem lỗi màu đỏ
```

**Các lỗi thường gặp:**
- ❌ `Cannot find module` → Lỗi import
- ❌ `Unexpected token` → Lỗi syntax
- ❌ `404` → Backend chưa chạy hoặc sai URL
- ❌ `401/403` → Lỗi authentication

#### Step 2: Test với Component đơn giản
```
1. Restart frontend: npm run dev
2. Login Admin
3. Vào Admin Panel
4. Click tab "Cấp quyền sản phẩm" (✅ icon)
5. Kiểm tra xem có thấy "Product Approval - Debug Version" không
```

**Nếu thấy:**
→ Vấn đề là ở component ProductApproval phức tạp
→ Chuyển sang Step 3

**Nếu KHÔNG thấy:**
→ Vấn đề là routing hoặc AdminPanel
→ Check console errors

#### Step 3: Chuyển sang version đầy đủ

Nếu version Simple chạy được, sửa lại AdminPanel.tsx:

```typescript
// Đổi từ:
import ProductApprovalSimple from './ProductApprovalSimple';

// Sang:
import ProductApproval from './ProductApproval';

// Và:
case 'products':
  return <ProductApproval />;
```

#### Step 4: Test API
```
1. Mở Network tab (F12 → Network)
2. Reload trang
3. Click tab "Cấp quyền sản phẩm"
4. Xem request gửi đến /api/products/pending
```

**Check:**
- ✅ Status 200 → OK
- ❌ Status 401 → Chưa login hoặc token hết hạn
- ❌ Status 403 → Không có quyền Admin
- ❌ Status 404 → Backend chưa chạy
- ❌ Status 500 → Lỗi server

### 🛠️ Quick Fixes:

#### Lỗi: Cannot find module ProductApproval
```bash
# Kiểm tra file tồn tại
ls src/pages/Admin/ProductApproval.tsx

# Nếu không có, tạo lại
# (File đã được tạo rồi)
```

#### Lỗi: Blank white screen
```bash
# 1. Clear cache
Ctrl + Shift + Delete → Clear cache

# 2. Hard reload
Ctrl + Shift + R

# 3. Restart dev server
npm run dev
```

#### Lỗi: API 404
```bash
# Check backend có chạy không
# Trong terminal backend:
cd D:\SWP_Fall25\New folder\BackEnd\Mmo
dotnet run --project Mmo_Api
```

### 📊 Test URLs:

**Frontend:**
- http://localhost:5173/ (hoặc port khác mà Vite hiển thị)
- http://localhost:5173/admin/dashboard
- http://localhost:5173/admin/product-approval

**Backend API:**
- http://localhost:5000/api/products/pending
- Test với Postman/Swagger

### 🎯 Mục tiêu:

1. ✅ Thấy component Simple render
2. ✅ Thấy component Full render  
3. ✅ Call API thành công
4. ✅ Hiển thị dữ liệu

### 📝 Ghi chú:

- ProductApprovalSimple: Component đơn giản để test routing
- ProductApproval: Component đầy đủ với API calls
- Nếu Simple OK nhưng Full lỗi → Vấn đề là ở API hoặc data handling

