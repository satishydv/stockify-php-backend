# PHP CodeIgniter Backend Setup

This document explains how to set up the PHP CodeIgniter backend to work with your Next.js frontend.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- CodeIgniter 4.x

## Setup Instructions

### 1. CodeIgniter Installation

1. Download CodeIgniter 4.x and place it in your web server directory
2. Configure your web server to point to the `public` folder of CodeIgniter
3. Set up your database connection in `application/config/database.php`

### 2. Database Setup

Create the following tables in your MySQL database:

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    supplier_id INT,
    status ENUM('published', 'inactive', 'draft') DEFAULT 'draft',
    quantity_in_stock INT DEFAULT 0,
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Suppliers table
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    supplier VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    number_of_items INT NOT NULL,
    status ENUM('new', 'in_progress', 'fulfilled', 'shipped', 'canceled') DEFAULT 'new',
    expected_delivery_date DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stocks table
CREATE TABLE stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_available INT NOT NULL,
    minimum_stock_level INT NOT NULL,
    maximum_stock_level INT NOT NULL,
    status ENUM('active', 'high', 'low', 'out_of_stock') DEFAULT 'active',
    unit_cost DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Password resets table
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. API Controllers

Create the following API controllers in `application/controllers/Api/`:

#### Auth.php
```php
<?php
namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth extends BaseController
{
    public function login()
    {
        $input = $this->request->getJSON(true);
        
        // Validate input
        if (!isset($input['email']) || !isset($input['password'])) {
            return $this->response->setJSON([
                'message' => 'Email and password are required'
            ])->setStatusCode(400);
        }
        
        $userModel = new UserModel();
        $user = $userModel->where('email', $input['email'])->first();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            return $this->response->setJSON([
                'message' => 'Invalid credentials'
            ])->setStatusCode(401);
        }
        
        // Generate JWT token
        $payload = [
            'userId' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];
        
        $token = JWT::encode($payload, getenv('JWT_SECRET'), 'HS256');
        
        return $this->response->setJSON([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name']
            ]
        ]);
    }
    
    public function logout()
    {
        // In a real application, you might want to blacklist the token
        return $this->response->setJSON(['message' => 'Logged out successfully']);
    }
    
    public function me()
    {
        $token = $this->getBearerToken();
        
        if (!$token) {
            return $this->response->setJSON(['message' => 'Token required'])->setStatusCode(401);
        }
        
        try {
            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));
            
            $userModel = new UserModel();
            $user = $userModel->find($decoded->userId);
            
            if (!$user) {
                return $this->response->setJSON(['message' => 'User not found'])->setStatusCode(404);
            }
            
            return $this->response->setJSON([
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name']
                ]
            ]);
        } catch (Exception $e) {
            return $this->response->setJSON(['message' => 'Invalid token'])->setStatusCode(401);
        }
    }
    
    private function getBearerToken()
    {
        $headers = $this->request->getHeader('Authorization');
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
```

### 4. Routes Configuration

Add the following routes to `application/config/Routes.php`:

```php
// API Routes
$routes->group('api', function($routes) {
    // Auth routes
    $routes->post('auth/login', 'Api\Auth::login');
    $routes->post('auth/logout', 'Api\Auth::logout');
    $routes->get('auth/me', 'Api\Auth::me');
    
    // User routes
    $routes->get('users', 'Api\Users::index');
    $routes->post('users', 'Api\Users::create');
    $routes->get('users/(:num)', 'Api\Users::show/$1');
    $routes->put('users/(:num)', 'Api\Users::update/$1');
    $routes->delete('users/(:num)', 'Api\Users::delete/$1');
    
    // Product routes
    $routes->get('products', 'Api\Products::index');
    $routes->post('products', 'Api\Products::create');
    $routes->get('products/(:num)', 'Api\Products::show/$1');
    $routes->put('products/(:num)', 'Api\Products::update/$1');
    $routes->delete('products/(:num)', 'Api\Products::delete/$1');
    
    // Order routes
    $routes->get('orders', 'Api\Orders::index');
    $routes->post('orders', 'Api\Orders::create');
    $routes->get('orders/(:num)', 'Api\Orders::show/$1');
    $routes->put('orders/(:num)', 'Api\Orders::update/$1');
    $routes->delete('orders/(:num)', 'Api\Orders::delete/$1');
    
    // Stock routes
    $routes->get('stock', 'Api\Stock::index');
    $routes->post('stock', 'Api\Stock::create');
    $routes->get('stock/(:num)', 'Api\Stock::show/$1');
    $routes->put('stock/(:num)', 'Api\Stock::update/$1');
    $routes->delete('stock/(:num)', 'Api\Stock::delete/$1');
    
    // Category routes
    $routes->get('categories', 'Api\Categories::index');
    $routes->post('categories', 'Api\Categories::create');
    $routes->get('categories/(:num)', 'Api\Categories::show/$1');
    $routes->put('categories/(:num)', 'Api\Categories::update/$1');
    $routes->delete('categories/(:num)', 'Api\Categories::delete/$1');
    
    // Supplier routes
    $routes->get('suppliers', 'Api\Suppliers::index');
    $routes->post('suppliers', 'Api\Suppliers::create');
    $routes->get('suppliers/(:num)', 'Api\Suppliers::show/$1');
    $routes->put('suppliers/(:num)', 'Api\Suppliers::update/$1');
    $routes->delete('suppliers/(:num)', 'Api\Suppliers::delete/$1');
    
    // Role routes
    $routes->get('roles', 'Api\Roles::index');
    $routes->post('roles', 'Api\Roles::create');
    $routes->get('roles/(:num)', 'Api\Roles::show/$1');
    $routes->put('roles/(:num)', 'Api\Roles::update/$1');
    $routes->delete('roles/(:num)', 'Api\Roles::delete/$1');
});
```

### 5. CORS Configuration

Add CORS headers to allow your frontend to communicate with the backend. Create a filter in `application/Filters/CorsFilter.php`:

```php
<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Handle preflight requests
        if ($request->getMethod() === 'options') {
            $response = service('response');
            $response->setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->setHeader('Access-Control-Max-Age', '86400');
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $response->setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return $response;
    }
}
```

Register the filter in `application/Config/Filters.php`:

```php
public $aliases = [
    // ... other filters
    'cors' => \App\Filters\CorsFilter::class,
];

public $globals = [
    'before' => [
        'cors'
    ],
    'after' => [
        'cors'
    ],
];
```

### 6. Environment Variables

Create a `.env` file in your CodeIgniter root directory:

```env
# Database
database.default.hostname = localhost
database.default.database = your_database_name
database.default.username = your_username
database.default.password = your_password
database.default.DBDriver = MySQLi

# JWT Secret
JWT_SECRET = your_jwt_secret_key_here

# App
app.baseURL = 'http://localhost/your-php-backend/'
```

### 7. Frontend Configuration

Update your frontend's API URL in the environment variables:

```env
# In your Next.js .env.local file
NEXT_PUBLIC_API_URL=http://localhost/your-php-backend
```

### 8. Testing

1. Start your PHP backend server
2. Build your Next.js frontend: `npm run build`
3. Serve the static files from the `out` directory
4. Test the API endpoints using Postman or curl
5. Test the frontend-backend integration

## Notes

- Make sure your PHP backend is running on the correct port
- Update CORS settings for production deployment
- Implement proper error handling in your API controllers
- Add input validation and sanitization
- Consider implementing rate limiting for API endpoints
- Use HTTPS in production
