<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Product_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_products() {
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('products');
        $products = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($product) {
            return [
                'id' => $product['id'],
                'name' => $product['name'],
                'sku' => $product['sku'],
                'purchase_price' => (float)$product['purchase_price'],
                'sell_price' => (float)$product['sell_price'],
                'category' => $product['category'],
                'status' => $product['status'],
                'quantityInStock' => (int)$product['quantity_in_stock'],
                'supplier' => $product['supplier'],
                'minimumStockLevel' => 10, // Default value since column doesn't exist
                'maximumStockLevel' => 1000, // Default value since column doesn't exist
                'lastUpdated' => $product['updated_at'],
                'createdAt' => $product['created_at'],
                'icon' => '📦' // Default icon since column doesn't exist
            ];
        }, $products);
    }
    
    public function get_product_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('products');
        $product = $query->row_array();
        
        if ($product) {
            return [
                'id' => $product['id'],
                'name' => $product['name'],
                'sku' => $product['sku'],
                'purchase_price' => (float)$product['purchase_price'],
                'sell_price' => (float)$product['sell_price'],
                'category' => $product['category'],
                'status' => $product['status'],
                'quantityInStock' => (int)$product['quantity_in_stock'],
                'supplier' => $product['supplier'],
                'minimumStockLevel' => 10, // Default value since column doesn't exist
                'maximumStockLevel' => 1000, // Default value since column doesn't exist
                'lastUpdated' => $product['updated_at'],
                'createdAt' => $product['created_at'],
                'icon' => '📦' // Default icon since column doesn't exist
            ];
        }
        
        return null;
    }
    
    public function get_product_by_sku($sku) {
        $this->db->where('sku', $sku);
        $query = $this->db->get('products');
        return $query->row_array();
    }
    
    public function create_product($data) {
        $product_data = [
            'name' => $data['name'],
            'sku' => $data['sku'],
            'purchase_price' => $data['purchase_price'],
            'sell_price' => $data['sell_price'],
            'category' => $data['category'],
            'supplier' => $data['supplier'],
            'status' => $data['status'],
            'quantity_in_stock' => $data['quantityInStock'],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('products', $product_data);
        return $this->db->insert_id();
    }
    
    public function update_product($id, $data) {
        // Map frontend fields to database fields
        $update_data = [];
        
        if (isset($data['name'])) {
            $update_data['name'] = $data['name'];
        }
        if (isset($data['sku'])) {
            $update_data['sku'] = $data['sku'];
        }
        if (isset($data['purchase_price'])) {
            $update_data['purchase_price'] = $data['purchase_price'];
        }
        if (isset($data['sell_price'])) {
            $update_data['sell_price'] = $data['sell_price'];
        }
        if (isset($data['category'])) {
            $update_data['category'] = $data['category'];
        }
        if (isset($data['supplier'])) {
            $update_data['supplier'] = $data['supplier'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }
        if (isset($data['quantityInStock'])) {
            $update_data['quantity_in_stock'] = $data['quantityInStock'];
        }
        
        $update_data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->where('id', $id);
        return $this->db->update('products', $update_data);
    }
    
    public function delete_product($id) {
        $this->db->where('id', $id);
        return $this->db->delete('products');
    }
}
