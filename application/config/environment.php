<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| Environment Configuration
|--------------------------------------------------------------------------
|
| This file contains environment-specific configuration settings
| for your CodeIgniter application.
|
*/

// Database Configuration
$config['db_host'] = 'localhost';
$config['db_port'] = 3306;
$config['db_name'] = 'stockify';
$config['db_user'] = 'root';
$config['db_password'] = '';

// JWT Configuration
$config['jwt_secret'] = '819303189fb5e73d607f31202195035b';
$config['jwt_expires_in'] = '7d';

// Application Configuration
$config['app_env'] = 'development';
$config['app_debug'] = true;
$config['app_url'] = 'https://satishinventory.kesug.com';

// CORS Configuration
$config['cors_allow_origin'] = '*';
$config['cors_allow_methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
$config['cors_allow_headers'] = 'Content-Type,Authorization,X-Requested-With';

// Database Connection Pool
$config['db_connection_limit'] = 10;
