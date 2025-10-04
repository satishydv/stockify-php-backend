<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Roles extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Role_model');
    }
    
    public function index() {
        $roles = $this->Role_model->get_all_roles();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'roles' => $roles
            ]));
    }
    
    public function show($id) {
        $role = $this->Role_model->get_role_by_id($id);
        
        if (!$role) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Role not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'role' => $role
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        if (!isset($input['name'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Name is required'
                ]));
            return;
        }
        
        // Check for duplicate name
        if ($this->Role_model->get_role_by_name($input['name'])) {
            $this->output
                ->set_status_header(409)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Role with this name already exists'
                ]));
            return;
        }
        
        // Prepare role data
        $role_data = [
            'name' => $input['name'],
            'description' => $input['description'] ?? null,
            'permissions' => $input['permissions'] ?? []
        ];
        
        $role_id = $this->Role_model->create_role($role_data);
        
        if ($role_id) {
            $role = $this->Role_model->get_role_by_id($role_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Role created successfully',
                    'role' => $role
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create role'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $role = $this->Role_model->get_role_by_id($id);
        if (!$role) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Role not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['name'])) {
            // Check for duplicate name
            $existing_role = $this->Role_model->get_role_by_name($input['name']);
            if ($existing_role && $existing_role['id'] != $id) {
                $this->output
                    ->set_status_header(409)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Role with this name already exists'
                    ]));
                return;
            }
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['description'])) {
            $update_data['description'] = $input['description'];
        }
        
        if (isset($input['permissions'])) {
            $update_data['permissions'] = $input['permissions'];
        }
        
        if (empty($update_data)) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'No valid fields to update'
                ]));
            return;
        }
        
        
        if ($this->Role_model->update_role($id, $update_data)) {
            $updated_role = $this->Role_model->get_role_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Role updated successfully',
                    'role' => $updated_role
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update role'
                ]));
        }
    }
    
    public function delete($id) {
        $role = $this->Role_model->get_role_by_id($id);
        if (!$role) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Role not found'
                ]));
            return;
        }
        
        if ($this->Role_model->delete_role($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Role deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete role'
                ]));
        }
    }
}
