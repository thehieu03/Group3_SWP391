-- ============================================
-- QUICK INSERT TEST - Copy & Run ngay
-- ============================================

-- Bước 1: Chạy để xem shopId và categoryId
SELECT 'SHOPS trong database:' as Info;
SELECT id, name FROM shops LIMIT 5;

SELECT 'CATEGORIES trong database:' as Info;  
SELECT id, name FROM categories LIMIT 5;

-- ============================================
-- Bước 2: THAY SỐ 1 bằng shopId và categoryId thực tế
-- Sau đó uncomment (bỏ -- ở đầu) và chạy:
-- ============================================

-- INSERT INTO products (shopId, categoryId, name, description, details, isActive, isApproved, fee, createdAt, updatedAt)
-- VALUES 
-- (1, 1, 'Test Product 1', 'Sản phẩm test chờ duyệt 1', 'Chi tiết sp 1', 1, 0, 0.05, NOW(), NOW()),
-- (1, 1, 'Test Product 2', 'Sản phẩm test chờ duyệt 2', 'Chi tiết sp 2', 1, 0, 0.05, NOW(), NOW()),
-- (1, 1, 'Test Product 3', 'Sản phẩm test chờ duyệt 3', 'Chi tiết sp 3', 1, 0, 0.05, NOW(), NOW());

-- ============================================
-- Bước 3: Kiểm tra
-- ============================================
SELECT 
    p.id,
    p.name,
    s.name as shop_name,
    p.isApproved,
    p.createdAt
FROM products p
LEFT JOIN shops s ON p.shopId = s.id
WHERE p.isApproved = 0
ORDER BY p.createdAt DESC;

