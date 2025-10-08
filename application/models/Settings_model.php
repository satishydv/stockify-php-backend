<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Settings_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_settings() {
        $query = $this->db->limit(1)->get('company_settings');
        return $query->row_array();
    }

    public function upsert_settings($data) {
        $current = $this->get_settings();
        if ($current) {
            $this->db->where('id', $current['id']);
            $this->db->update('company_settings', $data);
            return $this->get_settings();
        } else {
            $this->db->insert('company_settings', $data);
            return $this->get_settings();
        }
    }
}


