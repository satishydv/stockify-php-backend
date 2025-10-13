<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Order_model');
        $this->load->model('Product_model');
        $this->load->model('Category_model');
        $this->load->model('Supplier_model');
        $this->load->model('User_model');
    }
    
    public function statistics() {
        try {
            // Get dashboard statistics
            $stats = [
                'totalSalesToday' => $this->getTotalSalesToday(),
                'totalSuppliers' => $this->getTotalSuppliers(),
                'totalProducts' => $this->getTotalProducts(),
                'newCustomersToday' => $this->getNewCustomersToday(),
                'totalCustomers' => $this->getTotalCustomers(),
                'totalPurchaseToday' => $this->getTotalPurchaseToday(),
            ];
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'statistics' => $stats
                ]));
        } catch (Exception $e) {
            log_message('error', 'Error fetching dashboard statistics: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching dashboard statistics: ' . $e->getMessage()
                ]));
        }
    }
    
    public function monthly_sales() {
        try {
            $monthlySales = $this->Order_model->get_monthly_sales();
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data' => $monthlySales
                ]));
        } catch (Exception $e) {
            log_message('error', 'Error fetching monthly sales: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching monthly sales: ' . $e->getMessage()
                ]));
        }
    }
    
    public function payment_methods() {
        try {
            $paymentMethods = $this->Order_model->get_payment_methods_stats();
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data' => $paymentMethods
                ]));
        } catch (Exception $e) {
            log_message('error', 'Error fetching payment methods: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching payment methods: ' . $e->getMessage()
                ]));
        }
    }
    
    public function category_sales() {
        try {
            $categorySales = $this->Order_model->get_category_sales();
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'data' => $categorySales
                ]));
        } catch (Exception $e) {
            log_message('error', 'Error fetching category sales: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching category sales: ' . $e->getMessage()
                ]));
        }
    }
    
    private function getTotalSalesToday() {
        $today = date('Y-m-d');
        $this->db->select_sum('total_amount');
        $this->db->where('order_date', $today);
        $this->db->where('delete', 0);
        $result = $this->db->get('orders');
        $total = $result->row()->total_amount ?? 0;
        
        return [
            'value' => (float)$total,
            'change' => 5.2, // Mock data - you can implement real calculation
            'label' => 'Total Sales Today'
        ];
    }
    
    private function getTotalSuppliers() {
        $count = $this->Supplier_model->get_suppliers_count();
        return [
            'value' => $count,
            'change' => 2.1, // Mock data
            'label' => 'Total Suppliers'
        ];
    }
    
    private function getTotalProducts() {
        $count = $this->Product_model->get_products_count();
        return [
            'value' => $count,
            'change' => 8.5, // Mock data
            'label' => 'Total Products'
        ];
    }
    
    private function getNewCustomersToday() {
        $today = date('Y-m-d');
        $this->db->where('DATE(created_at)', $today);
        $this->db->where('delete', 0);
        $count = $this->db->count_all_results('orders');
        
        return [
            'value' => $count,
            'change' => 12.3, // Mock data
            'label' => 'New Customers Today'
        ];
    }
    
    private function getTotalCustomers() {
        $this->db->select('COUNT(DISTINCT customer_name) as total');
        $this->db->where('delete', 0);
        $result = $this->db->get('orders');
        $count = $result->row()->total ?? 0;
        
        return [
            'value' => $count,
            'change' => 3.7, // Mock data
            'label' => 'Total Customers'
        ];
    }
    
    private function getTotalPurchaseToday() {
        // This would typically come from a purchases table
        // For now, returning mock data
        return [
            'value' => 2500.00,
            'change' => -2.1, // Mock data
            'label' => 'Total Purchase Today'
        ];
    }
}