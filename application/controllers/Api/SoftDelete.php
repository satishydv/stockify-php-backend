<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SoftDelete extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->model('Product_model');
        $this->load->model('Category_model');
        $this->load->model('Supplier_model');
        $this->load->model('Role_model');
        $this->load->model('Branch_model');
        $this->load->model('Tax_model');
        $this->load->model('Stock_model');
        $this->load->model('Order_model');
        $this->load->model('Return_model');
    }
    
    /**
     * Soft delete a record
     * POST /api/soft-delete/{table}/{id}
     */
    public function soft_delete($table, $id) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method !== 'POST') {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Method not allowed'
                ]));
            return;
        }
        
        $result = false;
        $message = '';
        
        switch ($table) {
            case 'users':
                $result = $this->User_model->soft_delete_user($id);
                $message = $result ? 'User soft deleted successfully' : 'Failed to soft delete user';
                break;
                
            case 'products':
                $result = $this->Product_model->soft_delete_product($id);
                $message = $result ? 'Product soft deleted successfully' : 'Failed to soft delete product';
                break;
                
            case 'categories':
                $result = $this->Category_model->soft_delete_category($id);
                $message = $result ? 'Category soft deleted successfully' : 'Failed to soft delete category';
                break;
                
            case 'suppliers':
                $result = $this->Supplier_model->soft_delete_supplier($id);
                $message = $result ? 'Supplier soft deleted successfully' : 'Failed to soft delete supplier';
                break;
                
            case 'roles':
                $result = $this->Role_model->soft_delete_role($id);
                $message = $result ? 'Role soft deleted successfully' : 'Failed to soft delete role';
                break;
                
            case 'branches':
                $result = $this->Branch_model->soft_delete_branch($id);
                $message = $result ? 'Branch soft deleted successfully' : 'Failed to soft delete branch';
                break;
                
            case 'taxes':
                $result = $this->Tax_model->soft_delete_tax($id);
                $message = $result ? 'Tax soft deleted successfully' : 'Failed to soft delete tax';
                break;
                
            case 'stocks':
                $result = $this->Stock_model->soft_delete_stock($id);
                $message = $result ? 'Stock soft deleted successfully' : 'Failed to soft delete stock';
                break;
                
            case 'orders':
                $result = $this->Order_model->soft_delete_order($id);
                $message = $result ? 'Order soft deleted successfully' : 'Failed to soft delete order';
                break;
                
            case 'returns':
                $result = $this->Return_model->soft_delete_return($id);
                $message = $result ? 'Return soft deleted successfully' : 'Failed to soft delete return';
                break;
                
            default:
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Invalid table name'
                    ]));
                return;
        }
        
        if ($result) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => $message
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => $message
                ]));
        }
    }
    
    /**
     * Restore a soft deleted record
     * POST /api/restore/{table}/{id}
     */
    public function restore($table, $id) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method !== 'POST') {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Method not allowed'
                ]));
            return;
        }
        
        $result = false;
        $message = '';
        
        switch ($table) {
            case 'users':
                $result = $this->User_model->restore_user($id);
                $message = $result ? 'User restored successfully' : 'Failed to restore user';
                break;
                
            case 'products':
                $result = $this->Product_model->restore_product($id);
                $message = $result ? 'Product restored successfully' : 'Failed to restore product';
                break;
                
            case 'categories':
                $result = $this->Category_model->restore_category($id);
                $message = $result ? 'Category restored successfully' : 'Failed to restore category';
                break;
                
            case 'suppliers':
                $result = $this->Supplier_model->restore_supplier($id);
                $message = $result ? 'Supplier restored successfully' : 'Failed to restore supplier';
                break;
                
            case 'roles':
                $result = $this->Role_model->restore_role($id);
                $message = $result ? 'Role restored successfully' : 'Failed to restore role';
                break;
                
            case 'branches':
                $result = $this->Branch_model->restore_branch($id);
                $message = $result ? 'Branch restored successfully' : 'Failed to restore branch';
                break;
                
            case 'taxes':
                $result = $this->Tax_model->restore_tax($id);
                $message = $result ? 'Tax restored successfully' : 'Failed to restore tax';
                break;
                
            case 'stocks':
                $result = $this->Stock_model->restore_stock($id);
                $message = $result ? 'Stock restored successfully' : 'Failed to restore stock';
                break;
                
            case 'orders':
                $result = $this->Order_model->restore_order($id);
                $message = $result ? 'Order restored successfully' : 'Failed to restore order';
                break;
                
            case 'returns':
                $result = $this->Return_model->restore_return($id);
                $message = $result ? 'Return restored successfully' : 'Failed to restore return';
                break;
                
            default:
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Invalid table name'
                    ]));
                return;
        }
        
        if ($result) {
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'success' => true,
                    'message' => $message
                ]));
        } else {
            $this->output
                ->set_status_header(500)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => $message
                ]));
        }
    }
    
    /**
     * Get deleted records for a table
     * GET /api/deleted/{table}
     */
    public function get_deleted($table) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method !== 'GET') {
            $this->output
                ->set_status_header(405)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'error' => 'Method not allowed'
                ]));
            return;
        }
        
        $deleted_records = [];
        
        switch ($table) {
            case 'users':
                $deleted_records = $this->User_model->get_deleted_users();
                break;
                
            case 'products':
                $deleted_records = $this->Product_model->get_deleted_products();
                break;
                
            case 'categories':
                $deleted_records = $this->Category_model->get_deleted_categories();
                break;
                
            case 'suppliers':
                $deleted_records = $this->Supplier_model->get_deleted_suppliers();
                break;
                
            case 'roles':
                $deleted_records = $this->Role_model->get_deleted_roles();
                break;
                
            case 'branches':
                $deleted_records = $this->Branch_model->get_deleted_branches();
                break;
                
            case 'taxes':
                $deleted_records = $this->Tax_model->get_deleted_taxes();
                break;
                
            case 'stocks':
                $deleted_records = $this->Stock_model->get_deleted_stocks();
                break;
                
            case 'orders':
                $deleted_records = $this->Order_model->get_deleted_orders();
                break;
                
            case 'returns':
                $deleted_records = $this->Return_model->get_deleted_returns();
                break;
                
            default:
                $this->output
                    ->set_status_header(400)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'error' => 'Invalid table name'
                    ]));
                return;
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'deleted_records' => $deleted_records
            ]));
    }
}
