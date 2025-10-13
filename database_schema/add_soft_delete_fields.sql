-- Add soft delete fields to all tables
-- This script adds a 'delete' field (0 = active, 1 = soft-deleted) to all tables

-- Add delete field to roles table
ALTER TABLE `roles` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to users table
ALTER TABLE `users` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to categories table
ALTER TABLE `categories` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to suppliers table
ALTER TABLE `suppliers` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to products table
ALTER TABLE `products` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to stocks table
ALTER TABLE `stocks` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to orders table
ALTER TABLE `orders` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to taxes table
ALTER TABLE `taxes` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to branches table (if it exists)
-- ALTER TABLE `branches` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add delete field to returns table (if it exists)
-- ALTER TABLE `returns` ADD COLUMN `delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted';

-- Add indexes for better performance on soft delete queries
CREATE INDEX `idx_roles_delete` ON `roles` (`delete`);
CREATE INDEX `idx_users_delete` ON `users` (`delete`);
CREATE INDEX `idx_categories_delete` ON `categories` (`delete`);
CREATE INDEX `idx_suppliers_delete` ON `suppliers` (`delete`);
CREATE INDEX `idx_products_delete` ON `products` (`delete`);
CREATE INDEX `idx_stocks_delete` ON `stocks` (`delete`);
CREATE INDEX `idx_orders_delete` ON `orders` (`delete`);
CREATE INDEX `idx_taxes_delete` ON `taxes` (`delete`);

-- Optional: Add indexes for branches and returns if those tables exist
-- CREATE INDEX `idx_branches_delete` ON `branches` (`delete`);
-- CREATE INDEX `idx_returns_delete` ON `returns` (`delete`);
