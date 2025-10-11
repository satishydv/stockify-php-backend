<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Branches extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Branch_model');
    }
    
    public function index() {
        $branches = $this->Branch_model->get_all_branches();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'branches' => $branches
            ]));
    }
    
    public function show($id) {
        $branch = $this->Branch_model->get_branch_by_id($id);
        
        if (!$branch) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Branch not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'branch' => $branch
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        if (!isset($input['name']) || !isset($input['address']) || !isset($input['phone'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Name, address, and phone are required'
                ]));
            return;
        }
        
        // Check for duplicate name
        if ($this->Branch_model->get_branch_by_name($input['name'])) {
            $this->output
                ->set_status_header(409)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Branch with this name already exists'
                ]));
            return;
        }
        
        // Prepare branch data
        $branch_data = [
            'name' => $input['name'],
            'address' => $input['address'],
            'phone' => $input['phone'],
            'status' => isset($input['status']) ? $input['status'] : 'active'
        ];
        
        $branch_id = $this->Branch_model->create_branch($branch_data);
        
        if ($branch_id) {
            $branch = $this->Branch_model->get_branch_by_id($branch_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Branch created successfully',
                    'branch' => $branch
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create branch'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $branch = $this->Branch_model->get_branch_by_id($id);
        if (!$branch) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Branch not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['name'])) {
            // Check for duplicate name
            $existing_branch = $this->Branch_model->get_branch_by_name($input['name']);
            if ($existing_branch && $existing_branch['id'] != $id) {
                $this->output
                    ->set_status_header(409)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Branch with this name already exists'
                    ]));
                return;
            }
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['address'])) {
            $update_data['address'] = $input['address'];
        }
        
        if (isset($input['phone'])) {
            $update_data['phone'] = $input['phone'];
        }
        
        if (isset($input['status'])) {
            $update_data['status'] = $input['status'];
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
        
        if ($this->Branch_model->update_branch($id, $update_data)) {
            $updated_branch = $this->Branch_model->get_branch_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Branch updated successfully',
                    'branch' => $updated_branch
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update branch'
                ]));
        }
    }
    
    public function delete($id) {
        $branch = $this->Branch_model->get_branch_by_id($id);
        if (!$branch) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Branch not found'
                ]));
            return;
        }
        
        // Use soft delete instead of hard delete
        if ($this->Branch_model->soft_delete_branch($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Branch deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete branch'
                ]));
        }
    }
}
