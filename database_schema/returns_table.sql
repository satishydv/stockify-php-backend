-- Returns table schema
-- This table stores return orders with JSON items storage

CREATE TABLE `returns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `return_id` varchar(50) NOT NULL UNIQUE,
  `original_order_id` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `return_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `total_return_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `items` json NOT NULL,
  `status` enum('pending','return','processed','refunded','cancelled') NOT NULL DEFAULT 'pending',
  `return_reason` text DEFAULT NULL,
  `delete` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_return_id` (`return_id`),
  KEY `idx_original_order_id` (`original_order_id`),
  KEY `idx_customer_phone` (`customer_phone`),
  KEY `idx_status` (`status`),
  KEY `idx_return_date` (`return_date`),
  KEY `idx_delete` (`delete`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


