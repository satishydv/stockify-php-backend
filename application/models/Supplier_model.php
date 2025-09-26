<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Supplier_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_suppliers() {
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('suppliers');
        $suppliers = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($supplier) {
            return [
                'id' => $supplier['id'],
                'name' => $supplier['name'],
                'email' => $supplier['email'],
                'phone' => $supplier['phone'],
                'companyLocation' => [
                    'street' => $supplier['street'],
                    'city' => $supplier['city'],
                    'state' => $supplier['state'],
                    'zip' => $supplier['zip'],
                    'country' => $supplier['country']
                ],
                'gstin' => $supplier['gstin'],
                'website' => $supplier['website'],
                'category' => $supplier['category'],
                'status' => $supplier['status'],
                'createdAt' => $supplier['created_at'],
                'updatedAt' => $supplier['updated_at']
            ];
        }, $suppliers);
    }
    
    public function get_supplier_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('suppliers');
        $supplier = $query->row_array();
        
        if ($supplier) {
            return [
                'id' => $supplier['id'],
                'name' => $supplier['name'],
                'email' => $supplier['email'],
                'phone' => $supplier['phone'],
                'companyLocation' => [
                    'street' => $supplier['street'],
                    'city' => $supplier['city'],
                    'state' => $supplier['state'],
                    'zip' => $supplier['zip'],
                    'country' => $supplier['country']
                ],
                'gstin' => $supplier['gstin'],
                'website' => $supplier['website'],
                'category' => $supplier['category'],
                'status' => $supplier['status'],
                'createdAt' => $supplier['created_at'],
                'updatedAt' => $supplier['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_supplier_by_name($name) {
        $this->db->where('name', $name);
        $query = $this->db->get('suppliers');
        return $query->row_array();
    }
    
    public function create_supplier($data) {
        $supplier_data = [
            'name' => $data['name'],
            'contact_info' => $data['contact_info'],
            'status' => $data['status'],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('suppliers', $supplier_data);
        return $this->db->insert_id();
    }
    
    public function update_supplier($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('suppliers', $data);
    }
    
    public function delete_supplier($id) {
        $this->db->where('id', $id);
        return $this->db->delete('suppliers');
    }
}
