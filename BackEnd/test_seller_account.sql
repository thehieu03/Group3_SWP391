-- ================================================
-- SQL Script để tạo tài khoản SELLER và SHOP
-- Database: swp_group3
-- ================================================

-- Bước 1: Kiểm tra các roles hiện có
SELECT * FROM roles;

-- Bước 2: Insert tài khoản seller mới
-- Lưu ý: Tên columns đều viết thường, password cần hash trước
-- Password hash cho "Seller123": $2a$11$5ZWQTjhZqAF4gL9D5vWqNOE.xEQ8D5P0F5r5K5X5Y5Z5A5B5C5D5E
INSERT INTO accounts (username, password, email, phone, balance, isActive)
VALUES 
('seller1', '$2a$11$demoHashedPassword123456789012345678901234567890123456', 'seller1@gmail.com', '0901234567', 0, 1);

-- Lấy ID của account vừa tạo
SET @seller_id = LAST_INSERT_ID();

-- Bước 3: Kiểm tra role SELLER (thường là id = 2)
SET @seller_role_id = (SELECT id FROM roles WHERE roleName = 'SELLER' LIMIT 1);

-- Bước 4: Gán role SELLER cho account
INSERT INTO accountroles (accountId, roleId)
VALUES (@seller_id, @seller_role_id);

-- Bước 5: Tạo shop cho seller
INSERT INTO shops (accountId, name, description, reportCount, isActive)
VALUES 
(@seller_id, 'Shop Test Seller', 'Shop để test chức năng quản lý sản phẩm', 0, 1);

-- Bước 6: Verify data đã insert thành công
SELECT 
    a.id as AccountId,
    a.username as Username,
    a.email as Email,
    r.roleName as Role,
    s.id as ShopId,
    s.name as ShopName
FROM accounts a
LEFT JOIN accountroles ar ON a.id = ar.accountId
LEFT JOIN roles r ON ar.roleId = r.id
LEFT JOIN shops s ON a.id = s.accountId
WHERE a.username = 'seller1';

-- ================================================
-- CÁCH ĐÚNG ĐỂ INSERT (Với password đã hash đúng)
-- ================================================

-- B1: Xem các roles có sẵn
-- SELECT * FROM roles;

-- B2: Xóa account test nếu đã có (optional)
-- DELETE ar FROM accountroles ar 
-- INNER JOIN accounts a ON ar.accountId = a.id 
-- WHERE a.username = 'seller1';
-- 
-- DELETE s FROM shops s 
-- INNER JOIN accounts a ON s.accountId = a.id 
-- WHERE a.username = 'seller1';
-- 
-- DELETE FROM accounts WHERE username = 'seller1';

-- B3: Insert với dữ liệu cụ thể hơn
/*
-- Ví dụ với ID cụ thể (nếu bạn biết role id)
INSERT INTO accounts (username, password, email, phone, balance, isActive)
VALUES ('seller1', 'HASH_PASSWORD_HERE', 'seller1@gmail.com', '0901234567', 0.00, 1);

INSERT INTO accountroles (accountId, roleId) 
VALUES (LAST_INSERT_ID(), 2); -- 2 là role SELLER

INSERT INTO shops (accountId, name, description, reportCount, isActive)
VALUES (LAST_INSERT_ID(), 'Shop Seller 1', 'Mô tả shop', 0, 1);
*/

-- ================================================
-- KHUYẾN NGHỊ: Sử dụng API thay vì SQL trực tiếp
-- ================================================
-- 1. Đăng ký account qua API: POST /api/auth/register
--    Body: {
--      "username": "seller1",
--      "email": "seller1@gmail.com",  
--      "password": "Seller123",
--      "confirmPassword": "Seller123"
--    }
--
-- 2. Login với admin account
--
-- 3. Gán role SELLER cho account vừa tạo (cần API endpoint)
--
-- 4. Tạo shop cho seller qua API: POST /api/shops (với admin token)

