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
        $orders = $this->Order_model->get_all_orders();
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => TRUE,
                'orders' => $orders
            ]));
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
}