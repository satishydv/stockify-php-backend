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

    // Update order
    public function update_order($id, $data) {
        log_message('debug', 'Updating order with ID: ' . $id);
        log_message('debug', 'Order data: ' . print_r($data, TRUE));
        
        $this->db->where('id', $id);
        $result = $this->db->update('orders', $data);
        
        log_message('debug', 'Update result: ' . ($result ? 'SUCCESS' : 'FAILED'));
        log_message('debug', 'DB error: ' . $this->db->last_query());
        
        return $result;
    }

    // Update order items
    public function update_order_items($order_id, $items) {
        log_message('debug', 'Updating order items for order ID: ' . $order_id);
        log_message('debug', 'Items data: ' . print_r($items, TRUE));
        
        // First, delete existing items
        $this->db->where('order_id', $order_id);
        $delete_result = $this->db->delete('order_items');
        log_message('debug', 'Delete existing items result: ' . ($delete_result ? 'SUCCESS' : 'FAILED'));

        // Then insert updated items
        if (!empty($items)) {
            // Prepare items for insertion - remove 'id' and ensure 'product_id' is included
            $items_to_insert = array_map(function($item) {
                unset($item['id']); // Remove auto-generated ID
                
                // Ensure product_id is present and valid
                if (!isset($item['product_id']) || empty($item['product_id'])) {
                    log_message('error', 'Missing product_id in item: ' . print_r($item, TRUE));
                    throw new Exception('Missing product_id for order item');
                }
                
                return $item;
            }, $items);
            
            log_message('debug', 'Items to insert: ' . print_r($items_to_insert, TRUE));
            $insert_result = $this->db->insert_batch('order_items', $items_to_insert);
            log_message('debug', 'Insert batch result: ' . ($insert_result ? 'SUCCESS' : 'FAILED'));
            log_message('debug', 'DB error: ' . $this->db->last_query());
            
            return $insert_result;
        }
        
        return TRUE;
    }

    // Decrease stock quantities for fulfilled orders
    public function decrease_stock_for_order($items) {
        foreach ($items as $item) {
            if (!isset($item['quantity'])) {
                continue;
            }

            $qty = (int)$item['quantity'];
            if ($qty <= 0) continue;

            // Prefer matching by SKU if available, otherwise fall back to product_id via products table
            if (!empty($item['product_sku'])) {
                $this->db->set('quantity_available', 'GREATEST(quantity_available - ' . $qty . ', 0)', FALSE);
                $this->db->where('sku', $item['product_sku']);
                $this->db->update('stocks');
            } elseif (!empty($item['product_id'])) {
                // Find SKU by product_id
                $product = $this->db->get_where('products', ['id' => (int)$item['product_id']])->row_array();
                if ($product && !empty($product['sku'])) {
                    $this->db->set('quantity_available', 'GREATEST(quantity_available - ' . $qty . ', 0)', FALSE);
                    $this->db->where('sku', $product['sku']);
                    $this->db->update('stocks');
                }
            }
        }
        return TRUE;
    }
}