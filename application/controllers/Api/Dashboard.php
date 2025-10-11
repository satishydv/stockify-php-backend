<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Order_model');
        $this->load->model('Product_model');
        $this->load->model('Supplier_model');
    }
    
    /**
     * Get dashboard statistics
     */
    public function statistics() {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($this->input->method() === 'options') {
            return;
        }

        try {
            // Get today's date
            $today = date('Y-m-d');
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            $lastMonth = date('Y-m-d', strtotime('-1 month'));
            
            // 1. Total sales today (from orders table)
            $totalSalesToday = $this->getTotalSalesToday($today);
            $totalSalesYesterday = $this->getTotalSalesToday($yesterday);
            $salesChange = $this->calculatePercentageChange($totalSalesYesterday, $totalSalesToday);
            
            // 2. Total suppliers (from suppliers table)
            $totalSuppliers = $this->getTotalSuppliers();
            $totalSuppliersLastMonth = $this->getTotalSuppliersLastMonth($lastMonth);
            $suppliersChange = $this->calculatePercentageChange($totalSuppliersLastMonth, $totalSuppliers);
            
            // 3. Total products (from products table)
            $totalProducts = $this->getTotalProducts();
            $totalProductsLastMonth = $this->getTotalProductsLastMonth($lastMonth);
            $productsChange = $this->calculatePercentageChange($totalProductsLastMonth, $totalProducts);
            
            // 4. New customers today (from orders table - unique customer names)
            $newCustomersToday = $this->getNewCustomersToday($today);
            $newCustomersYesterday = $this->getNewCustomersToday($yesterday);
            $newCustomersChange = $this->calculatePercentageChange($newCustomersYesterday, $newCustomersToday);
            
            // 5. Total customers (from orders table - unique customer names)
            $totalCustomers = $this->getTotalCustomers();
            $totalCustomersLastMonth = $this->getTotalCustomersLastMonth($lastMonth);
            $customersChange = $this->calculatePercentageChange($totalCustomersLastMonth, $totalCustomers);
            
            // 6. Total purchase today (from products table - sum of purchase_price * quantity_in_stock)
            $totalPurchaseToday = $this->getTotalPurchaseToday($today);
            $totalPurchaseYesterday = $this->getTotalPurchaseToday($yesterday);
            $purchaseChange = $this->calculatePercentageChange($totalPurchaseYesterday, $totalPurchaseToday);
            
            $statistics = [
                'totalSalesToday' => [
                    'value' => $totalSalesToday,
                    'change' => $salesChange,
                    'label' => 'Total Sales Today'
                ],
                'totalSuppliers' => [
                    'value' => $totalSuppliers,
                    'change' => $suppliersChange,
                    'label' => 'Total Suppliers'
                ],
                'totalProducts' => [
                    'value' => $totalProducts,
                    'change' => $productsChange,
                    'label' => 'Total Products'
                ],
                'newCustomersToday' => [
                    'value' => $newCustomersToday,
                    'change' => $newCustomersChange,
                    'label' => 'New Customers Today'
                ],
                'totalCustomers' => [
                    'value' => $totalCustomers,
                    'change' => $customersChange,
                    'label' => 'Total Customers'
                ],
                'totalPurchaseToday' => [
                    'value' => $totalPurchaseToday,
                    'change' => $purchaseChange,
                    'label' => 'Total Purchase Today'
                ]
            ];
            
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'statistics' => $statistics
                ]));

        } catch (Exception $e) {
            log_message('error', 'Dashboard statistics error: ' . $e->getMessage());
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => false,
                    'message' => 'Error fetching dashboard statistics: ' . $e->getMessage()
                ]));
        }
    }
    
    private function getTotalSalesToday($date) {
        $this->db->select_sum('total_amount');
        $this->db->where('DATE(order_date)', $date);
        $result = $this->db->get('orders');
        return $result->row()->total_amount ?? 0;
    }
    
    private function getTotalSuppliers() {
        return $this->db->count_all('suppliers');
    }
    
    private function getTotalSuppliersLastMonth($date) {
        $this->db->where('created_at <', $date);
        return $this->db->count_all_results('suppliers');
    }
    
    private function getTotalProducts() {
        return $this->db->count_all('products');
    }
    
    private function getTotalProductsLastMonth($date) {
        $this->db->where('created_at <', $date);
        return $this->db->count_all_results('products');
    }
    
    private function getNewCustomersToday($date) {
        $this->db->select('customer_name');
        $this->db->where('DATE(order_date)', $date);
        $this->db->group_by('customer_name');
        $result = $this->db->get('orders');
        return $result->num_rows();
    }
    
    private function getTotalCustomers() {
        $this->db->select('customer_name');
        $this->db->group_by('customer_name');
        $result = $this->db->get('orders');
        return $result->num_rows();
    }
    
    private function getTotalCustomersLastMonth($date) {
        $this->db->select('customer_name');
        $this->db->where('created_at <', $date);
        $this->db->group_by('customer_name');
        $result = $this->db->get('orders');
        return $result->num_rows();
    }
    
    private function getTotalPurchaseToday($date) {
        // For products created today, sum purchase_price * quantity_in_stock
        $this->db->select_sum('(purchase_price * quantity_in_stock)', 'total_purchase');
        $this->db->where('DATE(created_at)', $date);
        $result = $this->db->get('products');
        return $result->row()->total_purchase ?? 0;
    }
    
    private function calculatePercentageChange($oldValue, $newValue) {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }
        return round((($newValue - $oldValue) / $oldValue) * 100, 1);
    }
}
