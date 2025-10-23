-- Migration script to add isApproved column to products table
-- This script adds the new isApproved column for product approval workflow

USE your_database_name;

-- Add isApproved column to products table
ALTER TABLE products 
ADD COLUMN isApproved TINYINT(1) DEFAULT 0 AFTER isActive;

-- Update existing products to set isApproved based on current status
-- Option 1: If you want all existing products to be approved by default
-- UPDATE products SET isApproved = 1 WHERE isApproved IS NULL OR isApproved = 0;

-- Option 2: If you want to review all existing products, leave them as 0
-- (No update needed - default is already 0)

-- Verify the change
DESCRIBE products;

-- Sample data for testing (Optional - uncomment to insert test data)
/*
-- Insert some test products pending approval (assuming shop IDs and category IDs exist)
INSERT INTO products (shopId, categoryId, name, description, isActive, isApproved, createdAt, updatedAt)
VALUES 
    (1, 1, 'Test Product 1', 'This is a test product pending approval', 1, 0, NOW(), NOW()),
    (2, 2, 'Test Product 2', 'Another test product needs review', 1, 0, NOW(), NOW()),
    (1, 3, 'Test Product 3', 'Third test product awaiting admin approval', 1, 0, NOW(), NOW());

-- Check the inserted test products
SELECT id, name, shopId, isActive, isApproved, createdAt 
FROM products 
WHERE isApproved = 0 
ORDER BY createdAt DESC;
*/

