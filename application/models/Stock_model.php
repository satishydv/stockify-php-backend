<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_stocks() {
        $this->db->order_by('category', 'ASC');
        $query = $this->db->get('stocks');
        $stocks = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($stock) {
            return [
                'id' => (int)$stock['id'],
                'sku' => $stock['sku'],
                'productName' => $stock['product_name'],
                'category' => $stock['category'],
                'quantityAvailable' => (int)$stock['quantity_available'],
                'minimumStockLevel' => (int)$stock['minimum_stock_level'],
                'maximumStockLevel' => (int)$stock['maximum_stock_level'],
                'status' => $stock['status'],
                'purchase_price' => (float)$stock['purchase_price'],
                'supplier' => $stock['supplier'],
                'lastUpdated' => $stock['last_updated'],
                'createdAt' => $stock['created_at']
            ];
        }, $stocks);
    }
    
    public function get_stock_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('stocks');
        $stock = $query->row_array();
        
        if ($stock) {
            return [
                'id' => (int)$stock['id'],
                'sku' => $stock['sku'],
                'productName' => $stock['product_name'],
                'category' => $stock['category'],
                'quantityAvailable' => (int)$stock['quantity_available'],
                'minimumStockLevel' => (int)$stock['minimum_stock_level'],
                'maximumStockLevel' => (int)$stock['maximum_stock_level'],
                'status' => $stock['status'],
                'purchase_price' => (float)$stock['purchase_price'],
                'supplier' => $stock['supplier'],
                'lastUpdated' => $stock['last_updated'],
                'createdAt' => $stock['created_at']
            ];
        }
        
        return null;
    }
    
    public function get_stock_by_sku($sku) {
        $this->db->where('sku', $sku);
        $query = $this->db->get('stocks');
        return $query->row_array();
    }
    
    public function create_stock($data) {
        $stock_data = [
            'sku' => $data['sku'],
            'product_name' => $data['product_name'],
            'category' => $data['category'],
            'quantity_available' => $data['quantity_available'],
            'minimum_stock_level' => $data['minimum_stock_level'],
            'maximum_stock_level' => $data['maximum_stock_level'],
            'status' => $data['status'],
            'purchase_price' => $data['purchase_price'],
            'supplier' => $data['supplier'],
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('stocks', $stock_data);
        return $this->db->insert_id();
    }
    
    public function update_stock($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('stocks', $data);
    }
    
    public function delete_stock($id) {
        $this->db->where('id', $id);
        return $this->db->delete('stocks');
    }
}
