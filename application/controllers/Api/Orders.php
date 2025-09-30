<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Orders extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->database(); // Explicitly load database library
        $this->load->model('Order_model');
        $this->load->library('upload');
        $this->load->helper('file');
        $this->load->helper('url');
    }
    
    public function index() {
        if ($this->input->method() === 'post') {
            $this->create_order();
        } elseif ($this->input->method() === 'get') {
            $this->get_orders();
        } else {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Method not allowed'
                ]));
        }
    }

    private function create_order() {
        try {
            // Debug: Log the incoming request
            log_message('debug', 'Order creation request received');
            log_message('debug', 'POST data: ' . print_r($this->input->post(), TRUE));
            log_message('debug', 'FILES data: ' . print_r($_FILES, TRUE));
            
            // Test database connection
            if (!$this->db->conn_id) {
                throw new Exception("Database connection failed");
            }
            
            // Test if tables exist
            if (!$this->db->table_exists('orders')) {
                throw new Exception("Orders table does not exist");
            }
            
            if (!$this->db->table_exists('order_items')) {
                throw new Exception("Order_items table does not exist");
            }

            // 1. Handle File Upload (Payment Attachment)
            $payment_attachment_path = NULL;
            if (!empty($_FILES['payment_attachment']['name'])) {
                // Check if upload directory exists and is writable
                $upload_path = './public/payments/';
                if (!is_dir($upload_path)) {
                    throw new Exception("Upload directory does not exist: " . $upload_path);
                }
                if (!is_writable($upload_path)) {
                    throw new Exception("Upload directory is not writable: " . $upload_path);
                }
                
                $config['upload_path'] = $upload_path;
                $config['allowed_types'] = 'gif|jpg|png|pdf';
                $config['max_size'] = 2048; // 2MB
                $config['encrypt_name'] = TRUE;

                $this->upload->initialize($config);

                if ($this->upload->do_upload('payment_attachment')) {
                    $upload_data = $this->upload->data();
                    $payment_attachment_path = 'public/payments/' . $upload_data['file_name'];
                } else {
        $this->output
                        ->set_status_header(400)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                            'status' => FALSE,
                            'message' => 'File upload failed: ' . $this->upload->display_errors()
                        ]));
                    return;
                }
            }

            // 2. Generate Order ID
            $order_id = 'ORD' . uniqid();

            // 3. Prepare Order Data
            $order_data = [
                'id' => $order_id,
                'customer_name' => $this->input->post('customer_name'),
                'mobile_no' => $this->input->post('mobile_no'),
                'order_date' => $this->input->post('order_date'),
                'subtotal' => $this->input->post('subtotal'),
                'tax_rate' => $this->input->post('tax_rate'),
                'tax_amount' => $this->input->post('tax_amount'),
                'total_amount' => $this->input->post('total_amount'),
                'status' => $this->input->post('status'),
                'payment_method' => $this->input->post('payment_method'),
                'transaction_id' => $this->input->post('transaction_id'),
                'payment_attachment' => $payment_attachment_path,
                'payment_date' => $this->input->post('payment_date'),
            ];

            // 4. Prepare Order Items
            $cart_items_json = $this->input->post('items');
            $cart_items = json_decode($cart_items_json, TRUE);

            if (empty($cart_items)) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'status' => FALSE,
                        'message' => 'No items in the order'
                    ]));
                return;
            }

            $order_items_data = [];
            foreach ($cart_items as $item) {
                $order_items_data[] = [
                    'order_id' => $order_id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'product_sku' => $item['product_sku'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                ];
            }

            // 5. Save to Database
            $this->db->trans_begin();

            try {
                // Insert order
                $order_result = $this->Order_model->create_order($order_data);
                if (!$order_result) {
                    throw new Exception("Failed to create order");
                }

                // Insert order items
                $items_result = $this->Order_model->add_order_items($order_items_data);
                if (!$items_result) {
                    throw new Exception("Failed to create order items");
                }

                if ($this->db->trans_status() === FALSE) {
                    $this->db->trans_rollback();
                    throw new Exception("Database transaction failed");
                } else {
                    $this->db->trans_commit();
                    $this->output
                        ->set_status_header(201)
                        ->set_content_type('application/json')
                        ->set_output(json_encode([
                            'status' => TRUE,
                            'message' => 'Order created successfully!',
                            'order_id' => $order_id,
                            'data' => [
                                'order' => $order_data,
                                'items_count' => count($order_items_data)
                            ]
                        ]));
                }
            } catch (Exception $e) {
                $this->db->trans_rollback();
                throw $e; // Re-throw to outer catch
            }

        } catch (Exception $e) {
            log_message('error', 'Order creation failed: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Error creating order: ' . $e->getMessage()
                ]));
        }
    }

    // Get all orders
    public function get_orders() {
        try {
            $orders = $this->Order_model->get_all_orders();
            
            // Get order items for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->Order_model->get_order_items($order['id']);
            }
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => TRUE,
                    'orders' => $orders
                ]));
        } catch (Exception $e) {
            log_message('error', 'Error fetching orders: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Error fetching orders: ' . $e->getMessage()
                ]));
        }
    }
    
    // Get order by ID
    public function get_order($id) {
        $order = $this->Order_model->get_order_by_id($id);
        if ($order) {
            $order_items = $this->Order_model->get_order_items($id);
            $order['items'] = $order_items;
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => TRUE,
                    'order' => $order
                ]));
        } else {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Order not found'
                ]));
        }
    }

    // Simple test method
    public function simple_test() {
        try {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => TRUE,
                    'message' => 'Simple test working',
                    'timestamp' => date('Y-m-d H:i:s')
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Simple test failed: ' . $e->getMessage()
                ]));
        }
    }

    // Test update method
    public function test_update($id) {
        try {
            // Test database connection
            $db_status = $this->db->conn_id ? 'connected' : 'not connected';
            
            // Test if order exists
            $order_exists = $this->Order_model->get_order_by_id($id);
            
            // Test table structure
            $orders_fields = $this->db->list_fields('orders');
            $order_items_fields = $this->db->list_fields('order_items');
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => TRUE,
                    'message' => 'Test update method working',
                    'order_id' => $id,
                    'db_status' => $db_status,
                    'order_exists' => $order_exists ? 'yes' : 'no',
                    'orders_fields' => $orders_fields,
                    'order_items_fields' => $order_items_fields,
                    'received_data' => $this->input->raw_input_stream
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Test failed: ' . $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]));
        }
    }

    // Update order by ID
    public function update_order($id) {
        try {
            // Debug: Log the incoming request
            log_message('debug', 'Order update request received for ID: ' . $id);
            log_message('debug', 'Request method: ' . ($this->input->method() ?? 'unknown'));
            log_message('debug', 'Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'unknown'));
            log_message('debug', 'Content-Length (bytes): ' . strlen($this->input->raw_input_stream));
            log_message('debug', 'Raw input: ' . $this->input->raw_input_stream);
            
            // Check if order exists
            $existing_order = $this->Order_model->get_order_by_id($id);
            if (!$existing_order) {
                log_message('error', 'Order not found: ' . $id);
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'status' => FALSE,
                        'message' => 'Order not found'
                    ]));
                return;
            }

            // Get JSON input
            $input = json_decode($this->input->raw_input_stream, TRUE);
            if (!$input) {
                log_message('error', 'Invalid JSON input for order update');
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'status' => FALSE,
                        'message' => 'Invalid JSON input'
                    ]));
                return;
            }
            
            log_message('debug', 'Parsed input: ' . print_r($input, TRUE));

            // Prepare order data with validation
            $order_data = [
                'customer_name' => $input['customer_name'] ?? $existing_order['customer_name'],
                'mobile_no' => $input['mobile_no'] ?? $existing_order['mobile_no'],
                'order_date' => $input['order_date'] ?? $existing_order['order_date'],
                'subtotal' => $input['subtotal'] ?? $existing_order['subtotal'],
                'tax_rate' => $input['tax_rate'] ?? $existing_order['tax_rate'],
                'tax_amount' => $input['tax_amount'] ?? $existing_order['tax_amount'],
                'total_amount' => $input['total_amount'] ?? $existing_order['total_amount'],
                'status' => $input['status'] ?? $existing_order['status'],
                'payment_method' => $input['payment_method'] ?? $existing_order['payment_method'],
                'transaction_id' => $input['transaction_id'] ?? $existing_order['transaction_id'],
                'payment_date' => $input['payment_date'] ?? $existing_order['payment_date'],
            ];
            log_message('debug', 'Prepared order_data: ' . print_r($order_data, TRUE));

            // Prepare order items data
            $order_items_data = [];
            if (isset($input['items']) && is_array($input['items'])) {
                foreach ($input['items'] as $item) {
                    $order_items_data[] = [
                        'id' => $item['id'] ?? null,
                        'order_id' => $id,
                        // Ensure product_id is passed along for FK integrity
                        'product_id' => isset($item['product_id']) ? (int)$item['product_id'] : null,
                        'product_name' => $item['product_name'] ?? '',
                        'product_sku' => $item['product_sku'] ?? '',
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'] ?? 0,
                        'subtotal' => $item['subtotal'] ?? 0,
                    ];
                }
            }
            log_message('debug', 'Prepared order_items_data: ' . print_r($order_items_data, TRUE));

            // Update in database
            $this->db->trans_begin();

            try {
                // Update order
                $order_result = $this->Order_model->update_order($id, $order_data);
                if (!$order_result) {
                    $dbErr = $this->db->error();
                    log_message('error', 'Failed to update order. DB error: [' . ($dbErr['code'] ?? 'n/a') . '] ' . ($dbErr['message'] ?? 'unknown'));
                    log_message('error', 'Last query: ' . $this->db->last_query());
                    throw new Exception("Failed to update order");
                }

                // Update order items
                $items_result = $this->Order_model->update_order_items($id, $order_items_data);
                if (!$items_result) {
                    $dbErr = $this->db->error();
                    log_message('error', 'Failed to update order items. DB error: [' . ($dbErr['code'] ?? 'n/a') . '] ' . ($dbErr['message'] ?? 'unknown'));
                    log_message('error', 'Last query: ' . $this->db->last_query());
                    throw new Exception("Failed to update order items");
                }

                // If status is fulfilled or shipped, decrease stock
                $final_status = $order_data['status'];
                if (in_array($final_status, ['fulfilled', 'shipped'])) {
                    $this->Order_model->decrease_stock_for_order($order_items_data);
                }

                if ($this->db->trans_status() === FALSE) {
                    $dbErr = $this->db->error();
                    log_message('error', 'Transaction failed. DB error: [' . ($dbErr['code'] ?? 'n/a') . '] ' . ($dbErr['message'] ?? 'unknown'));
                    $this->db->trans_rollback();
                    throw new Exception("Database transaction failed");
        } else {
                    $this->db->trans_commit();
                    $this->output
                        ->set_content_type('application/json')
                        ->set_output(json_encode([
                            'status' => TRUE,
                            'message' => 'Order updated successfully!',
                            'order_id' => $id
                        ]));
                }
            } catch (Exception $e) {
                $this->db->trans_rollback();
                throw $e; // Re-throw to outer catch
            }

        } catch (Exception $e) {
            log_message('error', 'Error updating order: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Error updating order: ' . $e->getMessage(),
                    'debug' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTraceAsString(),
                        'last_query' => method_exists($this->db, 'last_query') ? $this->db->last_query() : null,
                        'db_error' => method_exists($this->db, 'error') ? $this->db->error() : null,
                    ]
                ]));
        }
    }
    
    // Delete order by ID
    public function delete_order($id) {
        try {
            // Check if order exists
        $order = $this->Order_model->get_order_by_id($id);
        if (!$order) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                        'status' => FALSE,
                        'message' => 'Order not found'
                ]));
            return;
        }
        
            // Delete the order (this will also delete order items due to foreign key constraints)
            $result = $this->Order_model->delete_order($id);
            
            if ($result) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                        'status' => TRUE,
                    'message' => 'Order deleted successfully'
                ]));
        } else {
                $this->output
                    ->set_status_header(500)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'status' => FALSE,
                        'message' => 'Failed to delete order'
                    ]));
            }
        } catch (Exception $e) {
            log_message('error', 'Error deleting order: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => FALSE,
                    'message' => 'Error deleting order: ' . $e->getMessage()
                ]));
        }
    }
}