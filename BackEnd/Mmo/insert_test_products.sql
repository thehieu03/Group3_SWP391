-- ============================================
-- Script để INSERT sản phẩm TEST cho Product Approval
-- ============================================

-- Lưu ý: Thay đổi shopId và categoryId phù hợp với database của bạn
-- Kiểm tra shopId và categoryId trước khi chạy

-- Step 1: Kiểm tra shops và categories có sẵn
SELECT 'Danh sách Shops:' as Info;
SELECT id, name FROM shops LIMIT 5;

SELECT 'Danh sách Categories:' as Info;
SELECT id, name FROM categories LIMIT 5;

-- ============================================
-- Step 2: Insert Test Products (Chờ duyệt)
-- ============================================

-- CÁCH 1: Sử dụng shopId và categoryId cụ thể
-- Uncomment và sửa ID phù hợp:

/*
INSERT INTO products (shopId, categoryId, name, description, details, isActive, isApproved, fee, createdAt, updatedAt)
VALUES 
    (1, 1, 'Tài khoản Facebook Cổ - Bảo Hành 1 Tháng', 
     'Tài khoản Facebook đã nuôi từ 2015, bảo hành 1 tháng, có avatar và bạn bè thật', 
     'Chi tiết: Tài khoản đã nuôi 8 năm, có 500+ bạn bè, đầy đủ thông tin cá nhân',
     1, 0, 0.05, NOW(), NOW()),
    
    (1, 1, 'Nick Facebook VIP - Friends 2000+', 
     'Tài khoản Facebook VIP, bạn bè 2000+, avatar đẹp, bảo hành trọn đời', 
     'Chi tiết: Tài khoản chất lượng cao, đã checkpoint về, bạn bè Việt Nam 100%',
     1, 0, 0.08, NOW(), NOW()),
    
    (2, 2, 'Tài Khoản Gmail Google Voice - US Number', 
     'Gmail kèm Google Voice số US thật, bảo hành 6 tháng', 
     'Chi tiết: Gmail đã verify phone, kèm số Google Voice US, có thể nhận SMS',
     1, 0, 0.10, NOW(), NOW()),
    
    (1, 1, 'Clone Facebook UID - Bạn Bè Thật 100%', 
     'Clone Facebook UID giá rẻ, bạn bè thật 100%, bảo hành 2 tuần', 
     'Chi tiết: Clone từ UID thật, bạn bè tương tác tốt, không checkpoint',
     1, 0, 0.03, NOW(), NOW()),
    
    (2, 3, 'Tài Khoản Instagram Verified - Tích Xanh', 
     'Instagram có tích xanh, followers 50k+, engagement rate cao', 
     'Chi tiết: Tài khoản đã verify, niche lifestyle, followers US/UK',
     1, 0, 0.15, NOW(), NOW());
*/

-- CÁCH 2: Insert động (lấy shopId và categoryId đầu tiên từ DB)
-- Uncomment để chạy:

/*
INSERT INTO products (shopId, categoryId, name, description, details, isActive, isApproved, fee, createdAt, updatedAt)
SELECT 
    s.id as shopId,
    c.id as categoryId,
    'Test Product - Chờ Admin Duyệt' as name,
    'Đây là sản phẩm test, cần admin duyệt trước khi hiển thị' as description,
    'Chi tiết sản phẩm test - Lorem ipsum dolor sit amet' as details,
    1 as isActive,
    0 as isApproved,
    0.05 as fee,
    NOW() as createdAt,
    NOW() as updatedAt
FROM 
    (SELECT id FROM shops LIMIT 1) s,
    (SELECT id FROM categories LIMIT 1) c;
*/

-- ============================================
-- Step 3: Insert nhiều sản phẩm test cùng lúc
-- ============================================

-- Uncomment để tạo 10 sản phẩm test:
/*
INSERT INTO products (shopId, categoryId, name, description, details, isActive, isApproved, fee, createdAt, updatedAt)
SELECT 
    (SELECT id FROM shops ORDER BY RAND() LIMIT 1) as shopId,
    (SELECT id FROM categories ORDER BY RAND() LIMIT 1) as categoryId,
    CONCAT('Sản Phẩm Test #', num) as name,
    CONCAT('Mô tả sản phẩm test số ', num, ' - Chờ admin duyệt') as description,
    CONCAT('Chi tiết đầy đủ cho sản phẩm test #', num) as details,
    1 as isActive,
    0 as isApproved,
    ROUND(RAND() * 0.10 + 0.03, 2) as fee,
    NOW() as createdAt,
    NOW() as updatedAt
FROM (
    SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) numbers;
*/

-- ============================================
-- Step 4: Kiểm tra kết quả
-- ============================================

SELECT 'Sản phẩm chờ duyệt (isApproved = 0):' as Info;
SELECT 
    p.id,
    p.name as 'Tên sản phẩm',
    s.name as 'Shop',
    c.name as 'Category',
    p.description as 'Mô tả',
    p.isActive as 'Active',
    p.isApproved as 'Approved',
    p.createdAt as 'Ngày tạo'
FROM products p
LEFT JOIN shops s ON p.shopId = s.id
LEFT JOIN categories c ON p.categoryId = c.id
WHERE p.isApproved = 0 OR p.isApproved IS NULL
ORDER BY p.createdAt DESC
LIMIT 20;

-- Đếm số sản phẩm chờ duyệt
SELECT 'Tổng số sản phẩm chờ duyệt:' as Info;
SELECT COUNT(*) as total_pending
FROM products
WHERE isApproved = 0 OR isApproved IS NULL;

-- ============================================
-- SCRIPT ĐƠN GIẢN NHẤT (Recommended)
-- ============================================

-- Uncomment 3 dòng dưới để insert nhanh 1 sản phẩm test:
-- Thay số 1 bằng shopId và categoryId thực tế trong DB của bạn

/*
INSERT INTO products (shopId, categoryId, name, description, isActive, isApproved, createdAt, updatedAt)
VALUES (1, 1, 'Test Product - Pending Approval', 'This is a test product waiting for admin approval', 1, 0, NOW(), NOW());
SELECT 'Product inserted!' as Status;
*/

