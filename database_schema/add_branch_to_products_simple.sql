-- Add branch_name column to products table
-- This stores the branch name directly as a string

-- Add the branch_name column to the products table
ALTER TABLE `products`
ADD COLUMN `branch_name` VARCHAR(255) NULL DEFAULT NULL AFTER `supplier`;

-- Add an index for performance (optional but recommended)
CREATE INDEX `idx_products_branch_name` ON `products` (`branch_name`);

-- Add a comment to document the column
ALTER TABLE `products` 
MODIFY COLUMN `branch_name` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Name of the branch where this product is located';
