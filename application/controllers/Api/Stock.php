<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Stock_model');
    }
    
    public function index() {
        $stocks = $this->Stock_model->get_all_stocks();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'stock' => $stocks
            ]));
    }
    
    public function show($id) {
        $stock = $this->Stock_model->get_stock_by_id($id);
        
        if (!$stock) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Stock not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'stock' => $stock
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        $required_fields = ['sku', 'productName', 'category', 'quantityAvailable', 'minimumStockLevel', 'maximumStockLevel', 'purchase_price', 'supplier'];
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
        
        // Check if stock record already exists for this SKU
        if ($this->Stock_model->get_stock_by_sku($input['sku'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Stock record already exists for this SKU'
                ]));
            return;
        }
        
        // Prepare stock data
        $stock_data = [
            'sku' => $input['sku'],
            'product_name' => $input['productName'],
            'category' => $input['category'],
            'quantity_available' => $input['quantityAvailable'],
            'minimum_stock_level' => $input['minimumStockLevel'],
            'maximum_stock_level' => $input['maximumStockLevel'],
            'status' => isset($input['status']) ? $input['status'] : 'active',
            'purchase_price' => $input['purchase_price'],
            'supplier' => $input['supplier']
        ];
        
        $stock_id = $this->Stock_model->create_stock($stock_data);
        
        if ($stock_id) {
            $stock = $this->Stock_model->get_stock_by_id($stock_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Stock record created successfully',
                    'stock' => $stock
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create stock record'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $stock = $this->Stock_model->get_stock_by_id($id);
        if (!$stock) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Stock not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['sku'])) {
            // Check if SKU already exists for another stock record
            $existing_stock = $this->Stock_model->get_stock_by_sku($input['sku']);
            if ($existing_stock && $existing_stock['id'] != $id) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Stock record with this SKU already exists'
                    ]));
                return;
            }
            $update_data['sku'] = $input['sku'];
        }
        
        if (isset($input['productName'])) {
            $update_data['product_name'] = $input['productName'];
        }
        
        if (isset($input['category'])) {
            $update_data['category'] = $input['category'];
        }
        
        if (isset($input['quantityAvailable'])) {
            $update_data['quantity_available'] = $input['quantityAvailable'];
        }
        
        if (isset($input['minimumStockLevel'])) {
            $update_data['minimum_stock_level'] = $input['minimumStockLevel'];
        }
        
        if (isset($input['maximumStockLevel'])) {
            $update_data['maximum_stock_level'] = $input['maximumStockLevel'];
        }
        
        if (isset($input['status'])) {
            $update_data['status'] = $input['status'];
        }
        
        if (isset($input['purchase_price'])) {
            $update_data['purchase_price'] = $input['purchase_price'];
        }
        
        if (isset($input['supplier'])) {
            $update_data['supplier'] = $input['supplier'];
        }
        
        if (empty($update_data)) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'No valid fields to update'
                ]));
            return;
        }
        
        $update_data['last_updated'] = date('Y-m-d H:i:s');
        
        if ($this->Stock_model->update_stock($id, $update_data)) {
            $updated_stock = $this->Stock_model->get_stock_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Stock record updated successfully',
                    'stock' => $updated_stock
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update stock record'
                ]));
        }
    }
    
    public function delete($id) {
        $stock = $this->Stock_model->get_stock_by_id($id);
        if (!$stock) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Stock not found'
                ]));
            return;
        }
        
        if ($this->Stock_model->delete_stock($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Stock record deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete stock record'
                ]));
        }
    }
}
