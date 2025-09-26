<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Order_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_orders() {
        $this->db->order_by('order_date', 'DESC');
        $query = $this->db->get('orders');
        $orders = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($order) {
            return [
                'id' => $order['id'],
                'orderDate' => $order['order_date'],
                'name' => $order['name'],
                'sku' => $order['sku'],
                'supplier' => $order['supplier'],
                'category' => $order['category'],
                'numberOfItems' => (int)$order['number_of_items'],
                'status' => $order['status'],
                'expectedDeliveryDate' => $order['expected_delivery_date'],
                'totalAmount' => (float)$order['total_amount']
            ];
        }, $orders);
    }
    
    public function get_order_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('orders');
        $order = $query->row_array();
        
        if ($order) {
            return [
                'id' => $order['id'],
                'orderDate' => $order['order_date'],
                'name' => $order['name'],
                'sku' => $order['sku'],
                'supplier' => $order['supplier'],
                'category' => $order['category'],
                'numberOfItems' => (int)$order['number_of_items'],
                'status' => $order['status'],
                'expectedDeliveryDate' => $order['expected_delivery_date'],
                'totalAmount' => (float)$order['total_amount']
            ];
        }
        
        return null;
    }
    
    public function create_order($data) {
        $order_data = [
            'order_date' => $data['order_date'],
            'name' => $data['name'],
            'sku' => $data['sku'],
            'supplier' => $data['supplier'],
            'category' => $data['category'],
            'number_of_items' => $data['number_of_items'],
            'status' => $data['status'],
            'expected_delivery_date' => $data['expected_delivery_date'],
            'total_amount' => $data['total_amount']
        ];
        
        $this->db->insert('orders', $order_data);
        return $this->db->insert_id();
    }
    
    public function update_order($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('orders', $data);
    }
    
    public function delete_order($id) {
        $this->db->where('id', $id);
        return $this->db->delete('orders');
    }
}
