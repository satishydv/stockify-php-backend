CREATE TABLE `company_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  -- store only relative path under public/setup, e.g. 'setup/logo.png'
  `logo_path` VARCHAR(255) DEFAULT NULL,
  `header_image_path` VARCHAR(255) DEFAULT NULL,
  `footer_image_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;