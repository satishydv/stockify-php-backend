<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Test extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
    }
    
    public function index() {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'message' => 'API is working',
                'timestamp' => date('Y-m-d H:i:s')
            ]));
    }
    
    public function login() {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'message' => 'Login endpoint is working',
                'timestamp' => date('Y-m-d H:i:s')
            ]));
    }
    
    public function database() {
        // Clean output buffer
        if (ob_get_level()) {
            ob_clean();
        }
        
        try {
            $this->load->database();
            $query = $this->db->query("SELECT COUNT(*) as count FROM roles");
            $result = $query->row();
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => 'Database connection working',
                    'roles_count' => $result->count,
                    'timestamp' => date('Y-m-d H:i:s')
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Database error: ' . $e->getMessage(),
                    'timestamp' => date('Y-m-d H:i:s')
                ]));
        }
    }
}
