<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->model('Role_model');
        $this->load->library('jwt');
    }
    
    public function index() {
        $users = $this->User_model->get_all_users();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'users' => $users
            ]));
    }
    
    public function show($id) {
        $user = $this->User_model->get_user_by_id($id);
        
        if (!$user) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'User not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'user' => $user
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        if (!isset($input['name']) || !isset($input['email']) || !isset($input['password']) || !isset($input['role_id'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Name, email, password, and role are required'
                ]));
            return;
        }
        
        // Validate email format
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Please enter a valid email address'
                ]));
            return;
        }
        
        // Validate password length
        if (strlen($input['password']) < 6) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Password must be at least 6 characters'
                ]));
            return;
        }
        
        // Check if email already exists
        if ($this->User_model->get_user_by_email($input['email'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Email already exists'
                ]));
            return;
        }
        
        // Check if role exists
        if (!$this->Role_model->get_role_by_id($input['role_id'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Invalid role selected'
                ]));
            return;
        }
        
        // Hash password
        $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Prepare user data
        $user_data = [
            'name' => $input['name'],
            'email' => $input['email'],
            'password_hash' => $hashed_password,
            'address' => isset($input['address']) ? $input['address'] : '',
            'role_id' => $input['role_id'],
            'is_verified' => 1
        ];
        
        $user_id = $this->User_model->create_user($user_data);
        
        if ($user_id) {
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'User created successfully',
                    'userId' => $user_id
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create user'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $user = $this->User_model->get_user_by_id($id);
        if (!$user) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'User not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['name'])) {
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['email'])) {
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Please enter a valid email address'
                    ]));
                return;
            }
            $update_data['email'] = $input['email'];
        }
        
        if (isset($input['password'])) {
            if (strlen($input['password']) < 6) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Password must be at least 6 characters'
                    ]));
                return;
            }
            $update_data['password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
        }
        
        if (isset($input['address'])) {
            $update_data['address'] = $input['address'];
        }
        
        if (isset($input['role_id'])) {
            if (!$this->Role_model->get_role_by_id($input['role_id'])) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Invalid role selected'
                    ]));
                return;
            }
            $update_data['role_id'] = $input['role_id'];
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
        
        $update_data['updated_at'] = date('Y-m-d H:i:s');
        
        if ($this->User_model->update_user($id, $update_data)) {
            $updated_user = $this->User_model->get_user_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'User updated successfully',
                    'user' => $updated_user
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update user'
                ]));
        }
    }
    
    public function delete($id) {
        $user = $this->User_model->get_user_by_id($id);
        if (!$user) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'User not found'
                ]));
            return;
        }
        
        if ($this->User_model->delete_user($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete user'
                ]));
        }
    }
}
