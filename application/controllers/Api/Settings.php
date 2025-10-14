<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Settings extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Settings_model');
        $this->load->helper(['url','form']);
    }

    // GET /api/settings
    public function index() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        if ($this->input->method() === 'options') return;

        $settings = $this->Settings_model->get_settings();
        $this->output->set_content_type('application/json')->set_output(json_encode([
            'success' => true,
            'settings' => $settings
        ]));
    }

    // POST /api/settings (multipart)
    public function save() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        if ($this->input->method() === 'options') return;

        $data = [
            'company_name' => $this->input->post('company_name', true),
            'phone' => $this->input->post('phone', true),
            'email' => $this->input->post('email', true),
            'address' => $this->input->post('address', true),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        // Handle logo upload (save under public/setup and store relative path)
        if (!empty($_FILES['logo']['name'])) {
            $upload_dir = FCPATH . 'public/setup/';
            if (!is_dir($upload_dir)) {
                @mkdir($upload_dir, 0755, true);
            }
            $ext = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
            $safe = 'logo_' . time() . '.' . strtolower($ext);
            $target = $upload_dir . $safe;
            if (move_uploaded_file($_FILES['logo']['tmp_name'], $target)) {
                $data['logo_path'] = 'setup/' . $safe; // store relative path only
            }
        }

        // Handle header image upload (save under public/header)
        if (!empty($_FILES['header_image']['name'])) {
            $upload_dir = FCPATH . 'public/header/';
            if (!is_dir($upload_dir)) {
                @mkdir($upload_dir, 0755, true);
            }
            $ext = pathinfo($_FILES['header_image']['name'], PATHINFO_EXTENSION);
            $safe = 'header_' . time() . '.' . strtolower($ext);
            $target = $upload_dir . $safe;
            if (move_uploaded_file($_FILES['header_image']['tmp_name'], $target)) {
                $data['header_image_path'] = 'header/' . $safe; // relative to public/
            }
        }

        // Handle footer image upload (save under public/footer)
        if (!empty($_FILES['footer_image']['name'])) {
            $upload_dir = FCPATH . 'public/footer/';
            if (!is_dir($upload_dir)) {
                @mkdir($upload_dir, 0755, true);
            }
            $ext = pathinfo($_FILES['footer_image']['name'], PATHINFO_EXTENSION);
            $safe = 'footer_' . time() . '.' . strtolower($ext);
            $target = $upload_dir . $safe;
            if (move_uploaded_file($_FILES['footer_image']['tmp_name'], $target)) {
                $data['footer_image_path'] = 'footer/' . $safe; // relative to public/
            }
        }

        $saved = $this->Settings_model->upsert_settings($data);
        $this->output->set_content_type('application/json')->set_output(json_encode([
            'success' => true,
            'settings' => $saved
        ]));
    }
}


