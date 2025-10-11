<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Return_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Create a new return
     */
    public function create_return($data) {
        // Ensure items is properly formatted as JSON
        if (is_array($data['items'])) {
            $data['items'] = json_encode($data['items']);
        }

        $this->db->insert('returns', $data);
        return $this->db->insert_id();
    }

    /**
     * Get all returns
     */
    public function get_all_returns() {
        $this->db->where('delete', 0);
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('returns');
        
        $returns = $query->result_array();
        
        // Decode JSON items for each return
        foreach ($returns as &$return) {
            $return['items'] = json_decode($return['items'], true);
        }
        
        return $returns;
    }

    /**
     * Get return by ID
     */
    public function get_return_by_id($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        $query = $this->db->get('returns');
        
        if ($query->num_rows() > 0) {
            $return = $query->row_array();
            $return['items'] = json_decode($return['items'], true);
            return $return;
        }
        
        return null;
    }

    /**
     * Get return by return_id
     */
    public function get_return_by_return_id($return_id) {
        $this->db->where('return_id', $return_id);
        $this->db->where('delete', 0);
        $query = $this->db->get('returns');
        
        if ($query->num_rows() > 0) {
            $return = $query->row_array();
            $return['items'] = json_decode($return['items'], true);
            return $return;
        }
        
        return null;
    }

    /**
     * Get returns by original order ID
     */
    public function get_returns_by_order_id($order_id) {
        $this->db->where('original_order_id', $order_id);
        $this->db->where('delete', 0);
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('returns');
        
        $returns = $query->result_array();
        
        // Decode JSON items for each return
        foreach ($returns as &$return) {
            $return['items'] = json_decode($return['items'], true);
        }
        
        return $returns;
    }

    /**
     * Update return status
     */
    public function update_return_status($id, $status) {
        $this->db->where('id', $id);
        $this->db->set('status', $status);
        $this->db->set('updated_at', date('Y-m-d H:i:s'));
        
        return $this->db->update('returns');
    }

    /**
     * Update return
     */
    public function update_return($id, $data) {
        // Ensure items is properly formatted as JSON
        if (isset($data['items']) && is_array($data['items'])) {
            $data['items'] = json_encode($data['items']);
        }
        
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->where('id', $id);
        return $this->db->update('returns', $data);
    }

    /**
     * Delete return
     */
    public function delete_return($id) {
        $this->db->where('id', $id);
        return $this->db->delete('returns');
    }

    /**
     * Get returns by status
     */
    public function get_returns_by_status($status) {
        $this->db->where('status', $status);
        $this->db->where('delete', 0);
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('returns');
        
        $returns = $query->result_array();
        
        // Decode JSON items for each return
        foreach ($returns as &$return) {
            $return['items'] = json_decode($return['items'], true);
        }
        
        return $returns;
    }

    /**
     * Get returns by date range
     */
    public function get_returns_by_date_range($start_date, $end_date) {
        $this->db->where('return_date >=', $start_date);
        $this->db->where('return_date <=', $end_date);
        $this->db->where('delete', 0);
        $this->db->order_by('return_date', 'DESC');
        $query = $this->db->get('returns');
        
        $returns = $query->result_array();
        
        // Decode JSON items for each return
        foreach ($returns as &$return) {
            $return['items'] = json_decode($return['items'], true);
        }
        
        return $returns;
    }

    /**
     * Get total return amount by date range
     */
    public function get_total_return_amount($start_date = null, $end_date = null) {
        if ($start_date && $end_date) {
            $this->db->where('return_date >=', $start_date);
            $this->db->where('return_date <=', $end_date);
        }
        
        $this->db->where('delete', 0);
        $this->db->select_sum('total_return_amount');
        $query = $this->db->get('returns');
        
        $result = $query->row();
        return $result->total_return_amount ?: 0;
    }

    /**
     * Get return statistics
     */
    public function get_return_statistics() {
        $stats = [];
        
        // Total returns
        $this->db->where('delete', 0);
        $stats['total_returns'] = $this->db->count_all_results('returns');
        
        // Returns by status
        $this->db->select('status, COUNT(*) as count');
        $this->db->where('delete', 0);
        $this->db->group_by('status');
        $query = $this->db->get('returns');
        $stats['by_status'] = $query->result_array();
        
        // Total return amount
        $this->db->select_sum('total_return_amount');
        $this->db->where('delete', 0);
        $query = $this->db->get('returns');
        $result = $query->row();
        $stats['total_amount'] = $result->total_return_amount ?: 0;
        
        return $stats;
    }
    
    /**
     * Soft delete return
     */
    public function soft_delete_return($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 0);
        return $this->db->update('returns', ['delete' => 1, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    /**
     * Restore return
     */
    public function restore_return($id) {
        $this->db->where('id', $id);
        $this->db->where('delete', 1);
        return $this->db->update('returns', ['delete' => 0, 'updated_at' => date('Y-m-d H:i:s')]);
    }
    
    /**
     * Get deleted returns
     */
    public function get_deleted_returns() {
        $this->db->where('delete', 1);
        $this->db->order_by('updated_at', 'DESC');
        $query = $this->db->get('returns');
        
        $returns = $query->result_array();
        
        // Decode JSON items for each return
        foreach ($returns as &$return) {
            $return['items'] = json_decode($return['items'], true);
        }
        
        return $returns;
    }
}
