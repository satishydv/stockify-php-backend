<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Role_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_roles() {
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('roles');
        $roles = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($role) {
            // Fetch permissions for this role
            $permissions = $this->get_role_permissions($role['id']);
            
            return [
                'id' => $role['id'],
                'name' => $role['name'],
                'type' => $role['name'], // Use name as type for badge display
                'description' => $role['description'] ?? null,
                'permissions' => $permissions,
                'createdAt' => $role['created_at'],
                'updatedAt' => $role['updated_at']
            ];
        }, $roles);
    }
    
    public function get_role_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('roles');
        $role = $query->row_array();
        
        if ($role) {
            // Fetch permissions for this role
            $permissions = $this->get_role_permissions($role['id']);
            
            return [
                'id' => $role['id'],
                'name' => $role['name'],
                'type' => $role['name'], // Use name as type for badge display
                'description' => $role['description'] ?? null,
                'permissions' => $permissions,
                'createdAt' => $role['created_at'],
                'updatedAt' => $role['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_role_by_name($name) {
        $this->db->where('name', $name);
        $query = $this->db->get('roles');
        return $query->row_array();
    }
    
    public function create_role($data) {
        $role_data = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('roles', $role_data);
        return $this->db->insert_id();
    }
    
    public function update_role($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('roles', $data);
    }
    
    public function delete_role($id) {
        $this->db->where('id', $id);
        return $this->db->delete('roles');
    }
    
    private function get_role_permissions($role_id) {
        $this->db->where('role_id', $role_id);
        $query = $this->db->get('role_permissions');
        $permissions_data = $query->result_array();
        
        // Initialize permissions structure
        $permissions = [
            'dashboard' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'products' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'users' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'orders' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'stocks' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'sales' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'reports' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'suppliers' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false],
            'categories' => ['create' => false, 'read' => false, 'update' => false, 'delete' => false]
        ];
        
        // Map database permissions to frontend structure
        foreach ($permissions_data as $perm) {
            $module = $perm['module_name'];
            if (isset($permissions[$module])) {
                $permissions[$module]['create'] = (bool)$perm['can_create'];
                $permissions[$module]['read'] = (bool)$perm['can_read'];
                $permissions[$module]['update'] = (bool)$perm['can_update'];
                $permissions[$module]['delete'] = (bool)$perm['can_delete'];
            }
        }
        
        return $permissions;
    }
}
