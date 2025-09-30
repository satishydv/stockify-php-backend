-- Add payment-related fields to existing orders table
-- Run this after creating the new orders table structure

-- Add payment method field
ALTER TABLE `orders` 
ADD COLUMN `payment_method` enum('cash','card','upi','bank_transfer','cheque') DEFAULT NULL AFTER `status`;

-- Add transaction ID field (for UPI/online payments)
ALTER TABLE `orders` 
ADD COLUMN `transaction_id` varchar(100) DEFAULT NULL AFTER `payment_method`;

-- Add payment attachment field (file path for uploaded receipt)
ALTER TABLE `orders` 
ADD COLUMN `payment_attachment` varchar(255) DEFAULT NULL AFTER `transaction_id`;

-- Add payment date field
ALTER TABLE `orders` 
ADD COLUMN `payment_date` datetime DEFAULT NULL AFTER `payment_attachment`;

-- Add indexes for better performance
ALTER TABLE `orders` 
ADD INDEX `idx_payment_method` (`payment_method`);

ALTER TABLE `orders` 
ADD INDEX `idx_payment_date` (`payment_date`);
