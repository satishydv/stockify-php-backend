<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Categories extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Category_model');
    }
    
    public function index() {
        $categories = $this->Category_model->get_all_categories();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'categories' => $categories
            ]));
    }
    
    public function show($id) {
        $category = $this->Category_model->get_category_by_id($id);
        
        if (!$category) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Category not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'category' => $category
            ]));
    }
    
    public function create() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate required fields
        if (!isset($input['name']) || !isset($input['code'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Name and code are required'
                ]));
            return;
        }
        
        // Validate code format
        if (!preg_match('/^[A-Z0-9]+$/', $input['code'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Code must contain only uppercase letters and numbers'
                ]));
            return;
        }
        
        // Check for duplicate name
        if ($this->Category_model->get_category_by_name($input['name'])) {
            $this->output
                ->set_status_header(409)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Category with this name already exists'
                ]));
            return;
        }
        
        // Check for duplicate code
        if ($this->Category_model->get_category_by_code($input['code'])) {
            $this->output
                ->set_status_header(409)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Category with this code already exists'
                ]));
            return;
        }
        
        // Prepare category data
        $category_data = [
            'name' => $input['name'],
            'code' => strtoupper($input['code']),
            'status' => isset($input['status']) ? $input['status'] : 'active'
        ];
        
        $category_id = $this->Category_model->create_category($category_data);
        
        if ($category_id) {
            $category = $this->Category_model->get_category_by_id($category_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Category created successfully',
                    'category' => $category
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create category'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $category = $this->Category_model->get_category_by_id($id);
        if (!$category) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Category not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['name'])) {
            // Check for duplicate name
            $existing_category = $this->Category_model->get_category_by_name($input['name']);
            if ($existing_category && $existing_category['id'] != $id) {
                $this->output
                    ->set_status_header(409)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Category with this name already exists'
                    ]));
                return;
            }
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['code'])) {
            // Validate code format
            if (!preg_match('/^[A-Z0-9]+$/', $input['code'])) {
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Code must contain only uppercase letters and numbers'
                    ]));
                return;
            }
            
            // Check for duplicate code
            $existing_category = $this->Category_model->get_category_by_code($input['code']);
            if ($existing_category && $existing_category['id'] != $id) {
                $this->output
                    ->set_status_header(409)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Category with this code already exists'
                    ]));
                return;
            }
            $update_data['code'] = strtoupper($input['code']);
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
        
        if ($this->Category_model->update_category($id, $update_data)) {
            $updated_category = $this->Category_model->get_category_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Category updated successfully',
                    'category' => $updated_category
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update category'
                ]));
        }
    }
    
    public function delete($id) {
        $category = $this->Category_model->get_category_by_id($id);
        if (!$category) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Category not found'
                ]));
            return;
        }
        
        if ($this->Category_model->delete_category($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Category deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete category'
                ]));
        }
    }
}
