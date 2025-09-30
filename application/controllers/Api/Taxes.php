<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Taxes extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Tax_model');
        $this->load->library('jwt');
        
        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            exit();
        }
    }

    public function index() {
        try {
            $taxes = $this->Tax_model->get_all_taxes();
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data' => $taxes
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to fetch taxes: ' . $e->getMessage()
                ]));
        }
    }

    public function get($id) {
        try {
            $tax = $this->Tax_model->get_tax_by_id($id);
            
            if (!$tax) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Tax not found'
                    ]));
                return;
            }
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data' => $tax
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to fetch tax: ' . $e->getMessage()
                ]));
        }
    }

    public function create() {
        try {
            $input = json_decode($this->input->raw_input_stream, true);
            
            // Validate required fields
            if (empty($input['name']) || empty($input['code']) || !isset($input['rate'])) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Name, code, and rate are required'
                    ]));
                return;
            }
            
            // Check if code already exists
            if ($this->Tax_model->code_exists($input['code'])) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Tax code already exists'
                    ]));
                return;
            }
            
            $data = [
                'name' => $input['name'],
                'code' => $input['code'],
                'rate' => $input['rate'],
                'status' => isset($input['status']) ? $input['status'] : 'enable'
            ];
            
            $tax_id = $this->Tax_model->create_tax($data);
            
            if ($tax_id) {
                $tax = $this->Tax_model->get_tax_by_id($tax_id);
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'Tax created successfully',
                        'data' => $tax
                    ]));
            } else {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Failed to create tax'
                    ]));
            }
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to create tax: ' . $e->getMessage()
                ]));
        }
    }

    public function update($id) {
        try {
            $input = json_decode($this->input->raw_input_stream, true);
            
            // Check if tax exists
            if (!$this->Tax_model->get_tax_by_id($id)) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Tax not found'
                    ]));
                return;
            }
            
            // Check if code already exists (excluding current tax)
            if (isset($input['code']) && $this->Tax_model->code_exists($input['code'], $id)) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Tax code already exists'
                    ]));
                return;
            }
            
            $data = [];
            if (isset($input['name'])) $data['name'] = $input['name'];
            if (isset($input['code'])) $data['code'] = $input['code'];
            if (isset($input['rate'])) $data['rate'] = $input['rate'];
            if (isset($input['status'])) $data['status'] = $input['status'];
            
            if (empty($data)) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'No data provided for update'
                    ]));
                return;
            }
            
            $result = $this->Tax_model->update_tax($id, $data);
            
            if ($result) {
                $tax = $this->Tax_model->get_tax_by_id($id);
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'Tax updated successfully',
                        'data' => $tax
                    ]));
            } else {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Failed to update tax'
                    ]));
            }
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to update tax: ' . $e->getMessage()
                ]));
        }
    }

    public function delete($id) {
        try {
            // Check if tax exists
            if (!$this->Tax_model->get_tax_by_id($id)) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Tax not found'
                    ]));
                return;
            }
            
            $result = $this->Tax_model->delete_tax($id);
            
            if ($result) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'Tax deleted successfully'
                    ]));
            } else {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Failed to delete tax'
                    ]));
            }
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to delete tax: ' . $e->getMessage()
                ]));
        }
    }

    public function bulk_update_status() {
        try {
            $input = json_decode($this->input->raw_input_stream, true);
            
            if (!isset($input['status']) || !in_array($input['status'], ['enable', 'disable'])) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Invalid status. Must be enable or disable'
                    ]));
                return;
            }
            
            $result = $this->Tax_model->bulk_update_status($input['status']);
            
            if ($result) {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => true,
                        'message' => 'All taxes ' . $input['status'] . 'd successfully'
                    ]));
            } else {
                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'success' => false,
                        'message' => 'Failed to update tax statuses'
                    ]));
            }
        } catch (Exception $e) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Failed to update tax statuses: ' . $e->getMessage()
                ]));
        }
    }
}
