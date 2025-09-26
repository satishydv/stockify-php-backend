<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Products extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Product_model');
        $this->load->model('Category_model');
        $this->load->model('Supplier_model');
    }
    
    public function index() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $products = $this->Product_model->get_all_products();
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'products' => $products
                ]));
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Method not allowed'
                ]));
        }
    }
    
    public function show($id) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $product = $this->Product_model->get_product_by_id($id);
            
            if (!$product) {
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Product not found'
                    ]));
                return;
            }
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'product' => $product
                ]));
        } elseif ($method === 'PUT') {
            $this->update($id);
        } elseif ($method === 'DELETE') {
            $this->delete($id);
        } else {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Method not allowed'
                ]));
        }
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        $required_fields = ['name', 'sku', 'price', 'category', 'supplier', 'quantityInStock'];
        foreach ($required_fields as $field) {
            if (!isset($input[$field])) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => "Field '{$field}' is required"
                    ]));
                return;
            }
        }
        
        // Check if SKU already exists
        if ($this->Product_model->get_product_by_sku($input['sku'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Product with this SKU already exists'
                ]));
            return;
        }
        
        // Prepare product data
        $product_data = [
            'name' => $input['name'],
            'sku' => $input['sku'],
            'price' => $input['price'],
            'category' => $input['category'],
            'supplier' => $input['supplier'],
            'status' => isset($input['status']) ? $input['status'] : 'draft',
            'quantityInStock' => $input['quantityInStock'],
            'minimumStockLevel' => isset($input['minimumStockLevel']) ? $input['minimumStockLevel'] : 10,
            'maximumStockLevel' => isset($input['maximumStockLevel']) ? $input['maximumStockLevel'] : 1000
        ];
        
        $product_id = $this->Product_model->create_product($product_data);
        
        if ($product_id) {
            $product = $this->Product_model->get_product_by_id($product_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Product created successfully',
                    'product' => $product
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create product'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $product = $this->Product_model->get_product_by_id($id);
        if (!$product) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Product not found'
                ]));
            return;
        }
        
        // Check if SKU already exists for another product
        if (isset($input['sku'])) {
            $existing_product = $this->Product_model->get_product_by_sku($input['sku']);
            if ($existing_product && $existing_product['id'] != $id) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Product with this SKU already exists'
                    ]));
                return;
            }
        }
        
        // Prepare update data (model will handle field mapping)
        $update_data = $input;
        
        if ($this->Product_model->update_product($id, $update_data)) {
            $updated_product = $this->Product_model->get_product_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Product updated successfully',
                    'product' => $updated_product
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update product'
                ]));
        }
    }
    
    public function delete($id) {
        $product = $this->Product_model->get_product_by_id($id);
        if (!$product) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Product not found'
                ]));
            return;
        }
        
        if ($this->Product_model->delete_product($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete product'
                ]));
        }
    }
}
