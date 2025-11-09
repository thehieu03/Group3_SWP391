-- Script để thêm cột rawPayload vào bảng paymenttransaction
-- Chạy script này trong MySQL để thêm cột rawPayload

USE swp_group3;

-- Thêm cột rawPayload vào bảng paymenttransaction
ALTER TABLE paymenttransaction 
ADD COLUMN rawPayload TEXT NULL 
AFTER referenceCode;

-- Kiểm tra kết quả
DESCRIBE paymenttransaction;

