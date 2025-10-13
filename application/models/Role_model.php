<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Role_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_roles() {
        $this->db->where('delete', 0);
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('roles');
        $roles = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($role) {
            return [
                'id' => $role['id'],
                'name' => $role['name'],
                'type' => $role['name'], // Use name as type for badge display
                'description' => $role['description'] ?? null,
                'permissions' => $this->parse_permissions_from_json($role['permissions']),
                'createdAt' => $role['created_at'],
                'updatedAt' => $role['updated_at']
            ];
        }, $roles);
    }
    
    public function get_role_by_id($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        $query = $this->db->get('roles');
        $role = $query->row_array();
        
        if ($role) {
            return [
                'id' => $role['id'],
                'name' => $role['name'],
                'type' => $role['name'], // Use name as type for badge display
                'description' => $role['description'] ?? null,
                'permissions' => $this->parse_permissions_from_json($role['permissions']),
                'createdAt' => $role['created_at'],
                'updatedAt' => $role['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_role_by_name($name) {
        $this->db->where('name', $name);
        $this->db->where('delete', 0);
        $query = $this->db->get('roles');
        return $query->row_array();
    }
    
    public function create_role($data) {
        $role_data = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'permissions' => $this->convert_permissions_to_json($data['permissions'] ?? []),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('roles', $role_data);
        return $this->db->insert_id();
    }
    
    public function update_role($id, $data) {
        $role_data = [
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'permissions' => $this->convert_permissions_to_json($data['permissions'] ?? []),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Remove null values
        $role_data = array_filter($role_data, function($value) {
            return $value !== null;
        });
        
        $this->db->where('id', $id);
        return $this->db->update('roles', $role_data);
    }
    
    public function delete_role($id) {
        $this->db->where('id', $id);
        return $this->db->delete('roles');
    }
    
    public function soft_delete_role($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('roles', ['delete' => 1, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function restore_role($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('roles', ['delete' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function get_deleted_roles() {
        $this->db->where('delete', 1);
        $this->db->order_by('updated_at', 'DESC');
        $query = $this->db->get('roles');
        $roles = $query->result_array();
        
        return array_map(function($role) {
            return [
                'id' => $role['id'],
                'name' => $role['name'],
                'type' => $role['name'],
                'description' => $role['description'] ?? null,
                'permissions' => $this->parse_permissions_from_json($role['permissions']),
                'createdAt' => $role['created_at'],
                'updatedAt' => $role['updated_at']
            ];
        }, $roles);
    }
    
    /**
     * Convert permissions object to JSON array format
     * Input: {"users": {"create": true, "read": true, "update": false, "delete": false}}
     * Output: ["users:create", "users:read"]
     */
    private function convert_permissions_to_json($permissions) {
        if (!is_array($permissions)) {
            return json_encode([]);
        }
        
        $permission_array = [];
        
        foreach ($permissions as $module => $actions) {
            if (is_array($actions)) {
                foreach ($actions as $action => $allowed) {
                    if ($allowed === true) {
                        $permission_array[] = $module . ':' . $action;
                    }
                }
            }
        }
        
        return json_encode($permission_array);
    }
    
    /**
     * Parse permissions JSON array back to object format
     * Input: ["users:create", "users:read"]
     * Output: {"users": {"create": true, "read": true, "update": false, "delete": false}}
     */
    private function parse_permissions_from_json($permissions_json) {
        // Define baseline modules (extendable)
        $all_modules = [
            'dashboard', 'products', 'users', 'orders', 'stocks', 
            'sales', 'reports', 'suppliers', 'categories',
            // Newly added modules
            'setup', 'taxes', 'branch', 'roles'
        ];
        
        // Initialize permissions structure for all modules
        $permissions = [];
        foreach ($all_modules as $module) {
            $permissions[$module] = [
                'create' => false, 
                'read' => false, 
                'update' => false, 
                'delete' => false
            ];
        }
        
        // Parse JSON if it exists
        if (!empty($permissions_json)) {
            $permission_array = json_decode($permissions_json, true);
            
            if (is_array($permission_array)) {
                foreach ($permission_array as $permission) {
                    if (strpos($permission, ':') !== false) {
                        list($module, $action) = explode(':', $permission, 2);
                        
                        // If we encounter a module not in baseline, initialize it on the fly
                        if (!isset($permissions[$module])) {
                            $permissions[$module] = [
                                'create' => false,
                                'read' => false,
                                'update' => false,
                                'delete' => false,
                            ];
                        }
                        
                        if (isset($permissions[$module][$action])) {
                            $permissions[$module][$action] = true;
                        }
                    }
                }
            }
        }
        
        return $permissions;
    }
}
