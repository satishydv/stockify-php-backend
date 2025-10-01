<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Branch_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_branches() {
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('branches');
        $branches = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($branch) {
            return [
                'id' => $branch['id'],
                'name' => $branch['name'],
                'address' => $branch['address'],
                'phone' => $branch['phone'],
                'status' => $branch['status'],
                'created_at' => $branch['created_at'],
                'updated_at' => $branch['updated_at']
            ];
        }, $branches);
    }
    
    public function get_branch_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('branches');
        $branch = $query->row_array();
        
        if ($branch) {
            return [
                'id' => $branch['id'],
                'name' => $branch['name'],
                'address' => $branch['address'],
                'phone' => $branch['phone'],
                'status' => $branch['status'],
                'created_at' => $branch['created_at'],
                'updated_at' => $branch['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_branch_by_name($name) {
        $this->db->where('name', $name);
        $query = $this->db->get('branches');
        return $query->row_array();
    }
    
    public function create_branch($data) {
        $branch_data = [
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'status' => $data['status'],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('branches', $branch_data);
        return $this->db->insert_id();
    }
    
    public function update_branch($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('branches', $data);
    }
    
    public function delete_branch($id) {
        $this->db->where('id', $id);
        return $this->db->delete('branches');
    }
}
