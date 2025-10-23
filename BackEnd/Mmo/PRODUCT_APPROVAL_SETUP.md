# 📋 Hướng dẫn Setup và Test Product Approval

## ✅ Đã hoàn thành:

### Backend:
1. ✅ Thêm field `IsApproved` vào Product model
2. ✅ Thêm configuration vào AppDbContext
3. ✅ Tạo ProductApprovalRequest và ProductApprovalResponse
4. ✅ Implement ProductServices với 3 methods:
   - GetPendingProductsAsync (filter, search, sort, pagination)
   - ApproveProductAsync
   - RejectProductAsync
5. ✅ Tạo 3 API endpoints trong ProductsController:
   - GET /api/products/pending
   - PUT /api/products/{id}/approve
   - DELETE /api/products/{id}/reject

### Frontend:
1. ✅ Tạo ProductApprovalServices.tsx
2. ✅ Tạo ProductApproval.tsx component
3. ✅ Tạo ProductApproval.css
4. ✅ Thêm route /admin/product-approval
5. ✅ Thêm tab trong AdminPanel

---

## 🚀 Các bước để chạy:

### 1. Chạy Migration SQL:

```sql
USE your_database_name;

-- Add isApproved column
ALTER TABLE products 
ADD COLUMN isApproved TINYINT(1) DEFAULT 0 AFTER isActive;

-- Verify
DESCRIBE products;
```

### 2. (Optional) Thêm dữ liệu test:

```sql
-- Insert test products (thay đổi shopId và categoryId phù hợp với database của bạn)
INSERT INTO products (shopId, categoryId, name, description, isActive, isApproved, createdAt, updatedAt)
VALUES 
    (1, 1, 'Test Product 1', 'Sản phẩm test chờ duyệt', 1, 0, NOW(), NOW()),
    (1, 2, 'Test Product 2', 'Sản phẩm test thứ 2', 1, 0, NOW(), NOW()),
    (2, 1, 'Test Product 3', 'Sản phẩm test thứ 3', 1, 0, NOW(), NOW());

-- Check products
SELECT id, name, shopId, isActive, isApproved, createdAt 
FROM products 
WHERE isApproved = 0 
ORDER BY createdAt DESC;
```

### 3. Build Backend:

```bash
cd D:\SWP_Fall25\New folder\BackEnd\Mmo
dotnet clean
dotnet build
dotnet run --project Mmo_Api
```

### 4. Run Frontend:

```bash
cd D:\SWP_Fall25\New folder\frontend
npm install
npm run dev
```

---

## 🧪 Cách Test:

### 1. Login với tài khoản Admin

### 2. Truy cập Admin Panel:
- URL: `/admin/dashboard`
- Click vào tab "Cấp quyền sản phẩm" ✅

### 3. Test các chức năng:

#### a) Xem danh sách sản phẩm chờ duyệt:
- Bảng hiển thị:
  - ✅ Hình ảnh
  - ✅ Tên sản phẩm
  - ✅ Tên shop (và tên chủ shop)
  - ✅ Mô tả
  - ✅ Ngày tạo
  - ✅ Thao tác (Duyệt/Từ chối)

#### b) Tìm kiếm:
- ✅ Nhập tên sản phẩm → Click "Tìm kiếm"
- ✅ Nhập tên shop → Click "Tìm kiếm"

#### c) Sắp xếp:
- ✅ Click vào "Tên sản phẩm" để sort theo tên (asc/desc)
- ✅ Click vào "Ngày tạo" để sort theo ngày (asc/desc)

#### d) Phân trang:
- ✅ Click "Trước" / "Sau"
- ✅ Chọn số item/trang (5, 10, 20, 50)

#### e) Duyệt sản phẩm:
- ✅ Click nút "Duyệt"
- ✅ Confirm dialog
- ✅ Sản phẩm biến mất khỏi danh sách (isApproved = 1)

#### f) Từ chối sản phẩm:
- ✅ Click nút "Từ chối"
- ✅ Confirm dialog
- ✅ Sản phẩm bị xóa khỏi database

---

## 🔍 Debug nếu có lỗi:

### Frontend không hiển thị:
1. Mở Console (F12) xem có lỗi gì
2. Check Network tab xem API có được gọi không
3. Kiểm tra login đã có role ADMIN chưa

### Backend lỗi:
1. Check console output của backend
2. Verify database đã có column `isApproved`
3. Check appsettings.json connection string

### API không hoạt động:
1. Test trực tiếp bằng Postman/Swagger:
   - GET: http://localhost:5000/api/products/pending?pageNumber=1&pageSize=10
   - PUT: http://localhost:5000/api/products/1/approve
   - DELETE: http://localhost:5000/api/products/1/reject
2. Check Authorization header có JWT token

---

## 📊 SQL Queries hữu ích:

```sql
-- Xem tất cả sản phẩm chờ duyệt
SELECT p.id, p.name, s.name as shopName, p.isActive, p.isApproved, p.createdAt
FROM products p
LEFT JOIN shops s ON p.shopId = s.id
WHERE p.isApproved = 0 OR p.isApproved IS NULL
ORDER BY p.createdAt DESC;

-- Đếm số sản phẩm chờ duyệt
SELECT COUNT(*) as pending_count
FROM products
WHERE isApproved = 0 OR isApproved IS NULL;

-- Xem sản phẩm đã duyệt
SELECT p.id, p.name, s.name as shopName, p.isApproved, p.updatedAt
FROM products p
LEFT JOIN shops s ON p.shopId = s.id
WHERE p.isApproved = 1
ORDER BY p.updatedAt DESC;

-- Reset test data (set all products to pending)
UPDATE products SET isApproved = 0;
```

---

## 🎯 Kết quả mong đợi:

✅ Admin có thể xem tất cả sản phẩm chờ duyệt
✅ Tìm kiếm theo tên sản phẩm và tên shop
✅ Sort theo tên và ngày tạo (asc/desc)
✅ Phân trang hoạt động mượt mà
✅ Duyệt sản phẩm → isApproved = 1
✅ Từ chối sản phẩm → Product bị xóa
✅ UI đẹp, responsive, dễ sử dụng

---

## 📝 Notes:

- **IsActive = 1**: Sản phẩm đang hoạt động (luôn là true)
- **IsApproved = 0/NULL**: Sản phẩm chờ admin duyệt
- **IsApproved = 1**: Sản phẩm đã được admin duyệt

- Khi shop tạo sản phẩm mới:
  - Tự động set: `isActive = 1, isApproved = 0`
  
- Admin chỉ thấy sản phẩm có `isApproved = 0 hoặc NULL`

- Sau khi approve/reject, sản phẩm tự động biến mất khỏi danh sách pending

