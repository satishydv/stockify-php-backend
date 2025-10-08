<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Returns extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Return_model');
        $this->load->model('Stock_model');
        $this->load->library('form_validation');
        $this->load->helper('url');
    }

    /**
     * Create a new return
     */
    public function create() {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            return;
        }

        // Validate input
        $this->form_validation->set_rules('original_order_id', 'Original Order ID', 'required');
        $this->form_validation->set_rules('customer_name', 'Customer Name', 'required');
        $this->form_validation->set_rules('customer_phone', 'Customer Phone', 'required');
        $this->form_validation->set_rules('return_date', 'Return Date', 'required');
        $this->form_validation->set_rules('total_return_amount', 'Total Return Amount', 'required|numeric');
        $this->form_validation->set_rules('items', 'Items', 'required');

        if ($this->form_validation->run() === FALSE) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $this->form_validation->error_array()
                ]));
            return;
        }

        try {
            // Generate unique return ID
            $return_id = 'RET' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Prepare return data
            $return_data = [
                'return_id' => $return_id,
                'original_order_id' => $this->input->post('original_order_id'),
                'customer_name' => $this->input->post('customer_name'),
                'customer_phone' => $this->input->post('customer_phone'),
                'return_date' => $this->input->post('return_date'),
                'total_return_amount' => $this->input->post('total_return_amount'),
                'items' => $this->input->post('items'),
                'status' => 'return',
                'return_reason' => $this->input->post('return_reason') ?: null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];

            // Create return
            $return_id_db = $this->Return_model->create_return($return_data);

            if ($return_id_db) {
                // Update stock quantities for returned items
                $this->updateStockQuantities($return_data['items']);
                
                $this->output
                    ->set_status_header(201)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'Return created successfully and stock updated',
                        'return_id' => $return_id,
                        'data' => $return_data
                    ]));
            } else {
                throw new Exception('Failed to create return');
            }

        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error creating return: ' . $e->getMessage()
                ]));
        }
    }

    /**
     * Get all returns
     */
    public function index() {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            return;
        }

        try {
            $returns = $this->Return_model->get_all_returns();
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'returns' => $returns
                ]));

        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching returns: ' . $e->getMessage()
                ]));
        }
    }

    /**
     * Get return by ID
     */
    public function get($id) {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            return;
        }

        try {
            $return = $this->Return_model->get_return_by_id($id);
            
            if ($return) {
                $this->output
                    ->set_status_header(200)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'return' => $return
                    ]));
            } else {
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Return not found'
                    ]));
            }

        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching return: ' . $e->getMessage()
                ]));
        }
    }

    /**
     * Update return status
     */
    public function update_status($id) {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: PUT, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            return;
        }

        $this->form_validation->set_rules('status', 'Status', 'required|in_list[pending,return,processed,refunded,cancelled]');

        if ($this->form_validation->run() === FALSE) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Invalid status'
                ]));
            return;
        }

        try {
            $status = $this->input->input_stream('status');
            $updated = $this->Return_model->update_return_status($id, $status);

            if ($updated) {
                $this->output
                    ->set_status_header(200)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'Return status updated successfully'
                    ]));
            } else {
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Return not found'
                    ]));
            }

        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error updating return status: ' . $e->getMessage()
                ]));
        }
    }

    /**
     * Update stock quantities for returned items
     */
    private function updateStockQuantities($items_json) {
        try {
            // Decode JSON items if it's a string
            $items = is_string($items_json) ? json_decode($items_json, true) : $items_json;
            
            if (!is_array($items)) {
                throw new Exception('Invalid items format');
            }

            foreach ($items as $item) {
                // Get stock by SKU
                $stock = $this->Stock_model->get_stock_by_sku($item['product_sku']);
                
                if ($stock) {
                    // Calculate new quantity (current + returned quantity)
                    $new_quantity = $stock['quantity_available'] + $item['return_quantity'];
                    
                    // Update the stock's quantity_available
                    $update_data = [
                        'quantity_available' => $new_quantity,
                        'last_updated' => date('Y-m-d H:i:s')
                    ];
                    
                    $this->Stock_model->update_stock($stock['id'], $update_data);
                    
                    // Log the stock update
                    log_message('info', "Stock updated for product SKU: {$item['product_sku']}, Added: {$item['return_quantity']}, New quantity: {$new_quantity}");
                } else {
                    log_message('error', "Stock not found for SKU: {$item['product_sku']}");
                }
            }
            
        } catch (Exception $e) {
            log_message('error', 'Error updating stock quantities: ' . $e->getMessage());
            throw $e;
        }
    }
}
