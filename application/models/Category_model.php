<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Category_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_categories() {
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('categories');
        $categories = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($category) {
            return [
                'id' => $category['id'],
                'name' => $category['name'],
                'code' => $category['code'],
                'status' => $category['status'],
                'createdAt' => $category['created_at'],
                'updatedAt' => $category['updated_at']
            ];
        }, $categories);
    }
    
    public function get_category_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('categories');
        $category = $query->row_array();
        
        if ($category) {
            return [
                'id' => $category['id'],
                'name' => $category['name'],
                'code' => $category['code'],
                'status' => $category['status'],
                'createdAt' => $category['created_at'],
                'updatedAt' => $category['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_category_by_name($name) {
        $this->db->where('name', $name);
        $query = $this->db->get('categories');
        return $query->row_array();
    }
    
    public function get_category_by_code($code) {
        $this->db->where('code', $code);
        $query = $this->db->get('categories');
        return $query->row_array();
    }
    
    public function create_category($data) {
        $category_data = [
            'name' => $data['name'],
            'code' => $data['code'],
            'status' => $data['status'],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('categories', $category_data);
        return $this->db->insert_id();
    }
    
    public function update_category($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('categories', $data);
    }
    
    public function delete_category($id) {
        $this->db->where('id', $id);
        return $this->db->delete('categories');
    }
}
