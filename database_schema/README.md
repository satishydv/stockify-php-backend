# Stockify Database Schema Files

This directory contains SQL files for creating the Stockify database tables.

## 📁 **Files Overview**

### **Individual Table Files:**
- `users.sql` - User accounts and authentication
- `roles.sql` - User roles and permissions
- `role_permissions.sql` - Detailed permissions for each role
- `categories.sql` - Product categories
- `suppliers.sql` - Supplier information
- `products.sql` - Product catalog
- `stocks.sql` - Inventory stock levels
- `orders.sql` - Purchase orders
- `sessions.sql` - User session management
- `password_resets.sql` - Password reset tokens

### **Master File:**
- `complete_schema.sql` - Creates all tables in correct order (recommended)

## 🚀 **How to Use**

### **Option 1: Complete Schema (Recommended)**
```bash
# Import the complete schema
mysql -u root -p stockify < complete_schema.sql
```

### **Option 2: Individual Tables**
```bash
# Create database first
mysql -u root -p -e "CREATE DATABASE stockify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import tables in order (respecting foreign key dependencies)
mysql -u root -p stockify < roles.sql
mysql -u root -p stockify < users.sql
mysql -u root -p stockify < role_permissions.sql
mysql -u root -p stockify < sessions.sql
mysql -u root -p stockify < password_resets.sql
mysql -u root -p stockify < categories.sql
mysql -u root -p stockify < suppliers.sql
mysql -u root -p stockify < products.sql
mysql -u root -p stockify < stocks.sql
mysql -u root -p stockify < orders.sql
```

### **Option 3: Using phpMyAdmin**
1. Open phpMyAdmin
2. Select your database
3. Go to "Import" tab
4. Choose `complete_schema.sql`
5. Click "Go"

## 🔗 **Table Dependencies**

The tables have the following dependencies (foreign keys):
```
roles (no dependencies)
├── users (depends on roles)
│   └── sessions (depends on users)
└── role_permissions (depends on roles)

categories (no dependencies)
suppliers (no dependencies)
products (no dependencies)
stocks (no dependencies)
orders (no dependencies)
password_resets (no dependencies)
```

## 📊 **Table Summary**

| Table | Primary Key | Description |
|-------|-------------|-------------|
| `roles` | `id` (int) | User roles (Admin, Manager, User) |
| `users` | `id` (int) | User accounts with authentication |
| `role_permissions` | `id` (int) | Detailed permissions per role |
| `categories` | `id` (varchar(36)) | Product categories |
| `suppliers` | `id` (varchar(36)) | Supplier information |
| `products` | `id` (int) | Product catalog |
| `stocks` | `id` (int) | Inventory stock levels |
| `orders` | `id` (varchar(50)) | Purchase orders |
| `sessions` | `id` (int) | User session tokens |
| `password_resets` | `id` (int) | Password reset tokens |

## 🔧 **Key Features**

- **UTF8MB4 Support** - Full Unicode support including emojis
- **Foreign Key Constraints** - Data integrity enforcement
- **Auto Timestamps** - Automatic created_at/updated_at tracking
- **Flexible IDs** - Mix of auto-increment integers and UUIDs
- **Enum Constraints** - Controlled values for status fields
- **Indexes** - Optimized for common queries

## 🧪 **Testing**

After importing, verify the schema:
```sql
-- Check all tables exist
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE roles;
-- ... etc for other tables

-- Check foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'stockify';
```

## 📝 **Notes**

- All tables use `utf8mb4_unicode_ci` collation for full Unicode support
- Foreign key constraints ensure data integrity
- Timestamps are automatically managed
- UUID fields use `varchar(36)` to store standard UUIDs
- Enum fields provide controlled value sets
- Indexes are created on commonly queried fields

## 🔄 **Backup & Restore**

```bash
# Backup
mysqldump -u root -p stockify > stockify_backup.sql

# Restore
mysql -u root -p stockify < stockify_backup.sql
```
