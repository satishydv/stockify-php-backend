<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Supplier_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_suppliers() {
        $this->db->where('delete', 0);
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
        $this->db->where('delete', 0);
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
        $this->db->where('delete', 0);
        $query = $this->db->get('suppliers');
        return $query->row_array();
    }
    
    public function create_supplier($data) {
        // Generate UUID for the supplier ID
        $supplier_id = $this->generate_uuid();
        
        $supplier_data = [
            'id' => $supplier_id,
            'name' => $data['name'],
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'street' => $data['street'] ?? '',
            'city' => $data['city'] ?? '',
            'state' => $data['state'] ?? '',
            'zip' => $data['zip'] ?? '',
            'country' => $data['country'] ?? 'INDIA',
            'gstin' => $data['gstin'] ?? null,
            'category' => $data['category'] ?? 'Other',
            'website' => $data['website'] ?? null,
            'status' => $data['status'] ?? 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('suppliers', $supplier_data);
        return $supplier_id;
    }
    
    private function generate_uuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    public function update_supplier($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('suppliers', $data);
    }
    
    public function delete_supplier($id) {
        $this->db->where('id', $id);
        return $this->db->delete('suppliers');
    }
    
    public function soft_delete_supplier($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('suppliers', ['delete' => 1, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function restore_supplier($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('suppliers', ['delete' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function get_deleted_suppliers() {
        $this->db->where('delete', 1);
        $this->db->order_by('updated_at', 'DESC');
        $query = $this->db->get('suppliers');
        $suppliers = $query->result_array();
        
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
}
