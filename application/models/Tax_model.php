<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tax_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_all_taxes() {
        $query = $this->db->get('taxes');
        return $query->result_array();
    }

    public function get_tax_by_id($id) {
        $query = $this->db->get_where('taxes', ['id' => $id]);
        return $query->row_array();
    }

    public function create_tax($data) {
        $this->db->insert('taxes', $data);
        return $this->db->insert_id();
    }

    public function update_tax($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('taxes', $data);
    }

    public function delete_tax($id) {
        $this->db->where('id', $id);
        return $this->db->delete('taxes');
    }

    public function code_exists($code, $exclude_id = null) {
        $this->db->where('code', $code);
        if ($exclude_id) {
            $this->db->where('id !=', $exclude_id);
        }
        $query = $this->db->get('taxes');
        return $query->num_rows() > 0;
    }

    public function get_active_taxes() {
        $this->db->where('status', 'enable');
        $query = $this->db->get('taxes');
        return $query->result_array();
    }

    public function bulk_update_status($status) {
        $this->db->set('status', $status);
        return $this->db->update('taxes');
    }
}
