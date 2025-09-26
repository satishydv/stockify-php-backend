<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Orders extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Order_model');
    }
    
    public function index() {
        $orders = $this->Order_model->get_all_orders();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'orders' => $orders
            ]));
    }
    
    public function show($id) {
        $order = $this->Order_model->get_order_by_id($id);
        
        if (!$order) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Order not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'order' => $order
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        $required_fields = ['orderDate', 'name', 'sku', 'supplier', 'category', 'numberOfItems', 'totalAmount'];
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
        
        // Prepare order data
        $order_data = [
            'order_date' => $input['orderDate'],
            'name' => $input['name'],
            'sku' => $input['sku'],
            'supplier' => $input['supplier'],
            'category' => $input['category'],
            'number_of_items' => $input['numberOfItems'],
            'status' => isset($input['status']) ? $input['status'] : 'new',
            'expected_delivery_date' => isset($input['expectedDeliveryDate']) ? $input['expectedDeliveryDate'] : null,
            'total_amount' => $input['totalAmount']
        ];
        
        $order_id = $this->Order_model->create_order($order_data);
        
        if ($order_id) {
            $order = $this->Order_model->get_order_by_id($order_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'order' => $order
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create order'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $order = $this->Order_model->get_order_by_id($id);
        if (!$order) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Order not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['orderDate'])) {
            $update_data['order_date'] = $input['orderDate'];
        }
        
        if (isset($input['name'])) {
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['sku'])) {
            $update_data['sku'] = $input['sku'];
        }
        
        if (isset($input['supplier'])) {
            $update_data['supplier'] = $input['supplier'];
        }
        
        if (isset($input['category'])) {
            $update_data['category'] = $input['category'];
        }
        
        if (isset($input['numberOfItems'])) {
            $update_data['number_of_items'] = $input['numberOfItems'];
        }
        
        if (isset($input['status'])) {
            $update_data['status'] = $input['status'];
        }
        
        if (isset($input['expectedDeliveryDate'])) {
            $update_data['expected_delivery_date'] = $input['expectedDeliveryDate'];
        }
        
        if (isset($input['totalAmount'])) {
            $update_data['total_amount'] = $input['totalAmount'];
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
        
        $update_data['updated_at'] = date('Y-m-d H:i:s');
        
        if ($this->Order_model->update_order($id, $update_data)) {
            $updated_order = $this->Order_model->get_order_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Order updated successfully',
                    'order' => $updated_order
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update order'
                ]));
        }
    }
    
    public function delete($id) {
        $order = $this->Order_model->get_order_by_id($id);
        if (!$order) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Order not found'
                ]));
            return;
        }
        
        if ($this->Order_model->delete_order($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Order deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete order'
                ]));
        }
    }
}
