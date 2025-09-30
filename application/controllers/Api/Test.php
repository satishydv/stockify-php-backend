<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Test extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->database(); // Load database library
    }

    public function index() {
        $db_status = 'unknown';
        $db_error = null;
        
        try {
            // Test database connection
            if ($this->db->conn_id) {
                $db_status = 'connected';
                
                // Test if we can query the database
                $result = $this->db->query("SELECT 1 as test");
                if ($result) {
                    $db_status = 'working';
                }
            } else {
                $db_status = 'failed';
                $db_error = 'No connection ID';
            }
        } catch (Exception $e) {
            $db_status = 'error';
            $db_error = $e->getMessage();
        }
        
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => TRUE,
                'message' => 'API is working!',
                'timestamp' => date('Y-m-d H:i:s'),
                'database_status' => $db_status,
                'database_error' => $db_error,
                'post_data' => $this->input->post(),
                'files_data' => $_FILES
            ]));
    }
}