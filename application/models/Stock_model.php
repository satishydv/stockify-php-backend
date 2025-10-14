<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_stocks() {
        $this->db->where('delete', 0);
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
                'sell_price' => isset($stock['sell_price']) ? (float)$stock['sell_price'] : null,
                'supplier' => $stock['supplier'],
                'lastUpdated' => $stock['last_updated'],
                'createdAt' => $stock['created_at']
            ];
        }, $stocks);
    }
    
    public function get_stock_by_id($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
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
                'sell_price' => isset($stock['sell_price']) ? (float)$stock['sell_price'] : null,
                'supplier' => $stock['supplier'],
                'lastUpdated' => $stock['last_updated'],
                'createdAt' => $stock['created_at']
            ];
        }
        
        return null;
    }
    
    public function get_stock_by_sku($sku) {
        $this->db->where('sku', $sku);
        $this->db->where('delete', 0);
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
            'sell_price' => isset($data['sell_price']) ? $data['sell_price'] : null,
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
    
    public function soft_delete_stock($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('stocks', ['delete' => 1, 'last_updated' => date('Y-m-d H:i:s')]);
    }
    
    public function restore_stock($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('stocks', ['delete' => 0, 'last_updated' => date('Y-m-d H:i:s')]);
    }
    
    public function get_deleted_stocks() {
        $this->db->where('delete', 1);
        $this->db->order_by('last_updated', 'DESC');
        $query = $this->db->get('stocks');
        $stocks = $query->result_array();
        
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
}
