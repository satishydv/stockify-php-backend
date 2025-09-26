<?php
// Simple API test script
// Run this from your browser: http://localhost/inventory/test_api.php

echo "<h1>Stockify API Test</h1>";

// Test database connection
echo "<h2>Database Connection Test</h2>";
try {
    $mysqli = new mysqli('localhost', 'root', '', 'stockify');
    
    if ($mysqli->connect_error) {
        echo "<p style='color: red;'>❌ Database connection failed: " . $mysqli->connect_error . "</p>";
    } else {
        echo "<p style='color: green;'>✅ Database connection successful!</p>";
        
        // Test if tables exist
        $tables = ['users', 'roles', 'categories', 'products', 'orders', 'stocks', 'suppliers', 'sessions', 'password_resets'];
        echo "<h3>Table Check:</h3>";
        foreach ($tables as $table) {
            $result = $mysqli->query("SHOW TABLES LIKE '$table'");
            if ($result->num_rows > 0) {
                echo "<p style='color: green;'>✅ Table '$table' exists</p>";
            } else {
                echo "<p style='color: red;'>❌ Table '$table' missing</p>";
            }
        }
    }
    $mysqli->close();
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database error: " . $e->getMessage() . "</p>";
}

// Test API endpoints
echo "<h2>API Endpoints Test</h2>";
$base_url = "http://localhost/inventory/";

$endpoints = [
    'api/roles' => 'GET',
    'api/categories' => 'GET',
    'api/suppliers' => 'GET',
    'api/products' => 'GET',
    'api/orders' => 'GET',
    'api/stock' => 'GET',
    'api/users' => 'GET'
];

foreach ($endpoints as $endpoint => $method) {
    $url = $base_url . $endpoint;
    echo "<h3>Testing: $method $endpoint</h3>";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code == 200) {
        echo "<p style='color: green;'>✅ $endpoint - Status: $http_code</p>";
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success']) {
            $count = count($data[array_keys($data)[1]] ?? []);
            echo "<p>📊 Found $count records</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ $endpoint - Status: $http_code</p>";
        echo "<p>Response: " . htmlspecialchars($response) . "</p>";
    }
}

echo "<h2>Authentication Test</h2>";
echo "<p>To test authentication, you'll need to:</p>";
echo "<ol>";
echo "<li>Create a user in your database</li>";
echo "<li>Test login endpoint: POST $base_url" . "api/auth/login</li>";
echo "<li>Use the returned token for authenticated requests</li>";
echo "</ol>";

echo "<h2>Frontend Integration</h2>";
echo "<p>Your Next.js frontend should be configured to use:</p>";
echo "<p><strong>API Base URL:</strong> $base_url</p>";
echo "<p>Make sure to update your frontend's .env.local file with:</p>";
echo "<code>NEXT_PUBLIC_API_URL=$base_url</code>";
?>
