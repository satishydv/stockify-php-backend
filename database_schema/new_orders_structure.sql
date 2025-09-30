-- New Orders Table Structure
-- Drop existing orders table if it exists
DROP TABLE IF EXISTS `orders`;

-- Create new orders table (order header)
CREATE TABLE `orders` (
  `id` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `order_date` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('new','in_progress','fulfilled','shipped','canceled') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_items table (order line items)
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order_id` (`order_id`),
  KEY `fk_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT INTO `orders` (`id`, `customer_name`, `mobile_no`, `order_date`, `subtotal`, `tax_rate`, `tax_amount`, `total_amount`, `status`) VALUES
('ORD001', 'John Doe', '9876543210', '2024-01-15', 7500.00, 18.00, 1350.00, 8850.00, 'new'),
('ORD002', 'Jane Smith', '9876543211', '2024-01-16', 2000.00, 18.00, 360.00, 2360.00, 'fulfilled');

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `subtotal`) VALUES
('ORD001', 1, 'Dell latitude', 'LP003', 2, 3450.00, 6900.00),
('ORD001', 2, 'hp victus', 'LP00789', 1, 600.00, 600.00),
('ORD002', 3, 'Test Productedit', 'TEST004', 1, 2000.00, 2000.00);
