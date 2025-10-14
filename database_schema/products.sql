-- Products table structure
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchase_price` decimal(10,2) DEFAULT 0.00,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('partial_paid','paid','due') COLLATE utf8mb4_unicode_ci DEFAULT 'paid',
  `quantity_in_stock` int(11) DEFAULT 0,
  `supplier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sell_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','card','upi','bank_transfer','cheque') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Payment method used to purchase this product from supplier',
  `receipt_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL or file path to the payment receipt',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
