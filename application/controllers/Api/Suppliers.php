<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Suppliers extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('Supplier_model');
    }
    
    public function index() {
        $suppliers = $this->Supplier_model->get_all_suppliers();
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'suppliers' => $suppliers
            ]));
    }
    
    public function show($id) {
        $supplier = $this->Supplier_model->get_supplier_by_id($id);
        
        if (!$supplier) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Supplier not found'
                ]));
            return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'supplier' => $supplier
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
        if ($this->Supplier_model->get_supplier_by_name($input['name'])) {
            $this->output
                ->set_status_header(409)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Supplier with this name already exists'
                ]));
            return;
        }
        
        // Prepare supplier data
        $supplier_data = [
            'name' => $input['name'],
            'contact_info' => isset($input['contactInfo']) ? $input['contactInfo'] : '',
            'status' => isset($input['status']) ? $input['status'] : 'active'
        ];
        
        $supplier_id = $this->Supplier_model->create_supplier($supplier_data);
        
        if ($supplier_id) {
            $supplier = $this->Supplier_model->get_supplier_by_id($supplier_id);
            $this->output
                ->set_status_header(201)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Supplier created successfully',
                    'supplier' => $supplier
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to create supplier'
                ]));
        }
    }
    
    public function update($id) {
        $input = json_decode($this->input->raw_input_stream, true);
        
        $supplier = $this->Supplier_model->get_supplier_by_id($id);
        if (!$supplier) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Supplier not found'
                ]));
            return;
        }
        
        // Prepare update data
        $update_data = [];
        
        if (isset($input['name'])) {
            // Check for duplicate name
            $existing_supplier = $this->Supplier_model->get_supplier_by_name($input['name']);
            if ($existing_supplier && $existing_supplier['id'] != $id) {
                $this->output
                    ->set_status_header(409)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Supplier with this name already exists'
                    ]));
                return;
            }
            $update_data['name'] = $input['name'];
        }
        
        if (isset($input['contactInfo'])) {
            $update_data['contact_info'] = $input['contactInfo'];
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
        
        if ($this->Supplier_model->update_supplier($id, $update_data)) {
            $updated_supplier = $this->Supplier_model->get_supplier_by_id($id);
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Supplier updated successfully',
                    'supplier' => $updated_supplier
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to update supplier'
                ]));
        }
    }
    
    public function delete($id) {
        $supplier = $this->Supplier_model->get_supplier_by_id($id);
        if (!$supplier) {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Supplier not found'
                ]));
            return;
        }
        
        if ($this->Supplier_model->delete_supplier($id)) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Supplier deleted successfully'
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Failed to delete supplier'
                ]));
        }
    }
}
