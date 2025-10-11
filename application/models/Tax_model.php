<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tax_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_all_taxes() {
        $this->db->where('delete', 0);
        $query = $this->db->get('taxes');
        return $query->result_array();
    }

    public function get_tax_by_id($id) {
        $query = $this->db->get_where('taxes', ['id' => $id, 'delete' => 0]);
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
        $this->db->where('delete', 0);
        if ($exclude_id) {
            $this->db->where('id !=', $exclude_id);
        }
        $query = $this->db->get('taxes');
        return $query->num_rows() > 0;
    }

    public function get_active_taxes() {
        $this->db->where('status', 'enable');
        $this->db->where('delete', 0);
        $query = $this->db->get('taxes');
        return $query->result_array();
    }

    public function bulk_update_status($status) {
        $this->db->set('status', $status);
        $this->db->where('delete', 0);
        return $this->db->update('taxes');
    }

    public function disable_all_taxes_except($exclude_id) {
        $this->db->set('status', 'disable');
        $this->db->where('id !=', $exclude_id);
        $this->db->where('delete', 0);
        return $this->db->update('taxes');
    }
    
    public function soft_delete_tax($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('taxes', ['delete' => 1, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function restore_tax($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('taxes', ['delete' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    public function get_deleted_taxes() {
        $this->db->where('delete', 1);
        $this->db->order_by('updated_at', 'DESC');
        $query = $this->db->get('taxes');
        return $query->result_array();
    }
}
