<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    public function get_all_users() {
        $this->db->select('u.id, u.name, u.first_name, u.last_name, u.email, u.address, u.is_verified, u.created_at, u.updated_at, r.id as role_id, r.name as role_name');
        $this->db->from('users u');
        $this->db->join('roles r', 'u.role_id = r.id', 'left');
        $this->db->where('u.delete', 0);
        $this->db->order_by('u.created_at', 'DESC');
        $query = $this->db->get();
        
        $users = $query->result_array();
        
        // Transform the data to match frontend format
        return array_map(function($user) {
            // Use name field if available, otherwise combine first_name and last_name
            $displayName = $user['name'] ?: trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
            
            return [
                'id' => $user['id'],
                'name' => $displayName,
                'email' => $user['email'],
                'address' => $user['address'],
                'role' => $user['role_name'] ? strtolower($user['role_name']) : 'user',
                'status' => $user['is_verified'] ? 'active' : 'inactive',
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ];
        }, $users);
    }
    
    public function get_user_by_id($id) {
        $this->db->select('u.id, u.name, u.first_name, u.last_name, u.email, u.address, u.is_verified, u.created_at, u.updated_at, r.id as role_id, r.name as role_name');
        $this->db->from('users u');
        $this->db->join('roles r', 'u.role_id = r.id', 'left');
        $this->db->where('u.id', $id);
        $this->db->where('u.delete', 0);
        $query = $this->db->get();
        
        $user = $query->row_array();
        
        if ($user) {
            // Use name field if available, otherwise combine first_name and last_name
            $displayName = $user['name'] ?: trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
            
            return [
                'id' => $user['id'],
                'name' => $displayName,
                'email' => $user['email'],
                'address' => $user['address'],
                'role' => $user['role_name'] ? strtolower($user['role_name']) : 'user',
                'status' => $user['is_verified'] ? 'active' : 'inactive',
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ];
        }
        
        return null;
    }
    
    public function get_user_by_email($email) {
        $this->db->where('email', $email);
        $this->db->where('delete', 0);
        $query = $this->db->get('users');
        return $query->row_array();
    }
    
    public function create_user($data) {
        $user_data = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'address' => $data['address'],
            'role_id' => $data['role_id'],
            'is_verified' => $data['is_verified'],
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('users', $user_data);
        return $this->db->insert_id();
    }
    
    public function update_user($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('users', $data);
    }
    
    public function delete_user($id) {
        $this->db->where('id', $id);
        return $this->db->delete('users');
    }
    
    public function soft_delete_user($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('users', ['delete' => 1, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function restore_user($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('users', ['delete' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function get_deleted_users() {
        $this->db->select('u.id, u.name, u.first_name, u.last_name, u.email, u.address, u.is_verified, u.created_at, u.updated_at, r.id as role_id, r.name as role_name');
        $this->db->from('users u');
        $this->db->join('roles r', 'u.role_id = r.id', 'left');
        $this->db->where('u.delete', 1);
        $this->db->order_by('u.updated_at', 'DESC');
        $query = $this->db->get();
        
        $users = $query->result_array();
        
        return array_map(function($user) {
            $displayName = $user['name'] ?: trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
            
            return [
                'id' => $user['id'],
                'name' => $displayName,
                'email' => $user['email'],
                'address' => $user['address'],
                'role' => $user['role_name'] ? strtolower($user['role_name']) : 'user',
                'status' => $user['is_verified'] ? 'active' : 'inactive',
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ];
        }, $users);
    }
    
    public function create_session($user_id, $token) {
        $session_data = [
            'user_id' => $user_id,
            'token' => $token,
            'expires_at' => date('Y-m-d H:i:s', time() + (7 * 24 * 60 * 60)), // 7 days
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('sessions', $session_data);
        return $this->db->insert_id();
    }
    
    public function delete_session($token) {
        $this->db->where('token', $token);
        return $this->db->delete('sessions');
    }
    
    public function create_password_reset($email, $token, $expires_at) {
        $reset_data = [
            'email' => $email,
            'token' => $token,
            'expires_at' => $expires_at,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('password_resets', $reset_data);
        return $this->db->insert_id();
    }
    
    public function get_password_reset($token) {
        $this->db->where('token', $token);
        $query = $this->db->get('password_resets');
        return $query->row_array();
    }
    
    public function update_password($email, $password_hash) {
        $this->db->where('email', $email);
        return $this->db->update('users', [
            'password_hash' => $password_hash,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    public function delete_password_reset($token) {
        $this->db->where('token', $token);
        return $this->db->delete('password_resets');
    }
}
