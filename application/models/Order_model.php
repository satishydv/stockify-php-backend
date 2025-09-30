<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Order_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database(); // Explicitly load database library
    }

    // Create a new order
    public function create_order($data) {
        return $this->db->insert('orders', $data);
    }

    // Add order items
    public function add_order_items($items) {
        return $this->db->insert_batch('order_items', $items);
    }

    // Get all orders
    public function get_all_orders() {
        $this->db->order_by('created_at', 'DESC');
        return $this->db->get('orders')->result_array();
    }

    // Get order by ID
    public function get_order_by_id($id) {
        $this->db->where('id', $id);
        $result = $this->db->get('orders');
        return $result->row_array();
    }

    // Get order items by order ID
    public function get_order_items($order_id) {
        $this->db->where('order_id', $order_id);
        return $this->db->get('order_items')->result_array();
    }

    // Update order status
    public function update_order_status($id, $status) {
        $this->db->where('id', $id);
        return $this->db->update('orders', ['status' => $status]);
    }

    // Delete order (and its items)
    public function delete_order($id) {
        $this->db->trans_begin();
        
        // Delete order items first
        $this->db->where('order_id', $id);
        $this->db->delete('order_items');
        
        // Delete order
        $this->db->where('id', $id);
        $this->db->delete('orders');
        
        if ($this->db->trans_status() === FALSE) {
            $this->db->trans_rollback();
            return FALSE;
        } else {
            $this->db->trans_commit();
            return TRUE;
        }
    }

    // Get orders by date range
    public function get_orders_by_date_range($start_date, $end_date) {
        $this->db->where('order_date >=', $start_date);
        $this->db->where('order_date <=', $end_date);
        $this->db->order_by('order_date', 'DESC');
        return $this->db->get('orders')->result_array();
    }

    // Get orders by customer
    public function get_orders_by_customer($customer_name) {
        $this->db->like('customer_name', $customer_name);
        $this->db->order_by('created_at', 'DESC');
        return $this->db->get('orders')->result_array();
    }

    // Get total sales amount
    public function get_total_sales() {
        $this->db->select_sum('total_amount');
        $result = $this->db->get('orders');
        return $result->row()->total_amount ?? 0;
    }

    // Get orders count
    public function get_orders_count() {
        return $this->db->count_all('orders');
    }
}