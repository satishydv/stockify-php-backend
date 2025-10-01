<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// API Routes for Stockify
$route['api/test'] = 'api/test/index';
$route['api/test/login'] = 'api/test/login';
$route['api/test/database'] = 'api/test/database';
$route['api/auth/login'] = 'api/auth/login';
$route['api/auth/logout'] = 'api/auth/logout';
$route['api/auth/me'] = 'api/auth/me';
$route['api/auth/forgot-password'] = 'api/auth/forgot_password';
$route['api/auth/reset-password'] = 'api/auth/reset_password';

$route['api/users'] = 'api/users/index';
$route['api/users/(:num)'] = 'api/users/show/$1';
$route['api/users/create'] = 'api/users/create';
$route['api/users/update/(:num)'] = 'api/users/update/$1';
$route['api/users/delete/(:num)'] = 'api/users/delete/$1';

$route['api/products'] = 'api/products/index';
$route['api/products/(:num)'] = 'api/products/show/$1';

$route['api/orders'] = 'api/orders/index';
$route['api/orders/simple-test'] = 'api/orders/simple_test';
$route['api/orders/test-update/(:any)'] = 'api/orders/test_update/$1';
$route['api/orders/update/(:any)'] = 'api/orders/update_order/$1';
$route['api/orders/delete/(:any)'] = 'api/orders/delete_order/$1';
$route['api/orders/(:any)'] = 'api/orders/get_order/$1';

$route['api/stock'] = 'api/stock/index';
$route['api/stock/(:num)'] = 'api/stock/show/$1';
$route['api/stock/create'] = 'api/stock/create';
$route['api/stock/update/(:num)'] = 'api/stock/update/$1';
$route['api/stock/delete/(:num)'] = 'api/stock/delete/$1';

$route['api/categories'] = 'api/categories/index';
$route['api/categories/(:num)'] = 'api/categories/show/$1';
$route['api/categories/create'] = 'api/categories/create';
$route['api/categories/update/(:num)'] = 'api/categories/update/$1';
$route['api/categories/delete/(:num)'] = 'api/categories/delete/$1';

$route['api/suppliers'] = 'api/suppliers/index';
$route['api/suppliers/(:num)'] = 'api/suppliers/show/$1';
$route['api/suppliers/create'] = 'api/suppliers/create';
$route['api/suppliers/update/(:num)'] = 'api/suppliers/update/$1';
$route['api/suppliers/delete/(:num)'] = 'api/suppliers/delete/$1';

$route['api/roles'] = 'api/roles/index';
$route['api/roles/(:num)'] = 'api/roles/show/$1';
$route['api/roles/create'] = 'api/roles/create';
$route['api/roles/update/(:num)'] = 'api/roles/update/$1';
$route['api/roles/delete/(:num)'] = 'api/roles/delete/$1';

$route['api/taxes'] = 'api/taxes/index';
$route['api/taxes/(:num)'] = 'api/taxes/get/$1';
$route['api/taxes/create'] = 'api/taxes/create';
$route['api/taxes/update/(:num)'] = 'api/taxes/update/$1';
$route['api/taxes/delete/(:num)'] = 'api/taxes/delete/$1';
$route['api/taxes/bulk-update-status'] = 'api/taxes/bulk_update_status';

$route['api/branches'] = 'api/branches/index';
$route['api/branches/(:num)'] = 'api/branches/show/$1';
$route['api/branches/create'] = 'api/branches/create';
$route['api/branches/update/(:num)'] = 'api/branches/update/$1';
$route['api/branches/delete/(:num)'] = 'api/branches/delete/$1';
