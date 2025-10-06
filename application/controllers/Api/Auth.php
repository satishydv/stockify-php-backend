<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->library('jwt');
        $this->load->helper('url');
    }
    
    public function login() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        // Validate input
        if (!isset($input['email']) || !isset($input['password'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Email and password are required'
                ]));
            return;
        }
        
        $user = $this->User_model->get_user_by_email($input['email']);
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Invalid credentials'
                ]));
            return;
        }
        
        // Generate JWT token
        $payload = [
            'userId' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];
        
        $token = $this->jwt->encode($payload, $this->config->item('jwt_secret'));
        
        // Store session
        $this->User_model->create_session($user['id'], $token);
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name']
                ]
            ]));
    }
    
    public function logout() {
        $token = $this->get_bearer_token();
        
        if ($token) {
            $this->User_model->delete_session($token);
        }
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'message' => 'Logged out successfully'
            ]));
    }
    
    public function me() {
        $token = $this->get_bearer_token();
        
        if (!$token) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Token required'
                ]));
            return;
        }
        
        try {
            $decoded = $this->jwt->decode($token, $this->config->item('jwt_secret'));
            
            $user = $this->User_model->get_user_by_id($decoded->userId);
            
            if (!$user) {
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'message' => 'User not found'
                    ]));
                return;
            }
            
            // Get extended user data with role information
            $this->db->select('u.id, u.name, u.first_name, u.last_name, u.email, u.address, u.is_verified, u.created_at, u.updated_at, r.id as role_id, r.name as role_name');
            $this->db->from('users u');
            $this->db->join('roles r', 'u.role_id = r.id', 'left');
            $this->db->where('u.id', $decoded->userId);
            $query = $this->db->get();
            $extendedUser = $query->row_array();
            
            if ($extendedUser) {
                // Use name field if available, otherwise combine first_name and last_name
                $displayName = $extendedUser['name'] ?: trim(($extendedUser['first_name'] ?? '') . ' ' . ($extendedUser['last_name'] ?? ''));
                
                $this->output
                    ->set_status_header(200)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'user' => [
                            'id' => $extendedUser['id'],
                            'email' => $extendedUser['email'],
                            'firstName' => $extendedUser['first_name'],
                            'lastName' => $extendedUser['last_name'],
                            'name' => $displayName,
                            'address' => $extendedUser['address'],
                            'role' => $extendedUser['role_name'] ? strtolower($extendedUser['role_name']) : 'user',
                            'status' => $extendedUser['is_verified'] ? 'active' : 'inactive',
                            'createdAt' => $extendedUser['created_at'],
                            'updatedAt' => $extendedUser['updated_at']
                        ]
                    ]));
            } else {
                $this->output
                    ->set_status_header(404)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'message' => 'User not found'
                    ]));
            }
        } catch (Exception $e) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Invalid token'
                ]));
        }
    }
    
    public function forgot_password() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        if (!isset($input['email'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Email is required'
                ]));
            return;
        }
        
        $user = $this->User_model->get_user_by_email($input['email']);
        
        if (!$user) {
            // Return success even if user doesn't exist (security best practice)
            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'If the email exists, a reset link has been sent'
                ]));
            return;
        }
        
        // Generate reset token
        $reset_token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hour from now
        
        // Store reset token
        $this->User_model->create_password_reset($input['email'], $reset_token, $expires_at);
        
        // TODO: Send email with reset link
        // For now, just log the token (remove in production)
        log_message('info', "Reset token for {$input['email']}: {$reset_token}");
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'message' => 'If the email exists, a reset link has been sent',
                'resetToken' => $reset_token // Remove this in production
            ]));
    }
    
    public function change_password() {
        $token = $this->get_bearer_token();
        if (!$token) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Token required'
                ]));
            return;
        }

        $input = json_decode($this->input->raw_input_stream, true);
        $current = isset($input['currentPassword']) ? $input['currentPassword'] : null;
        $new = isset($input['newPassword']) ? $input['newPassword'] : null;

        if (!$current || !$new) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Current and new password are required'
                ]));
            return;
        }

        if (strlen($new) < 6) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Password must be at least 6 characters'
                ]));
            return;
        }

        try {
            $decoded = $this->jwt->decode($token, $this->config->item('jwt_secret'));
            // IMPORTANT: fetch raw user row that includes password_hash
            $user = $this->User_model->get_user_by_email($decoded->email);
            if (!$user || !password_verify($current, $user['password_hash'])) {
                $this->output
                    ->set_status_header(401)
                    ->set_content_type('application/json')
                    ->set_output(json_encode([
                        'message' => 'Current password is incorrect'
                    ]));
                return;
            }

            $hashed_password = password_hash($new, PASSWORD_DEFAULT);
            $this->User_model->update_password($user['email'], $hashed_password);

            $this->output
                ->set_status_header(200)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Password changed successfully'
                ]));
        } catch (Exception $e) {
            $this->output
                ->set_status_header(401)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Invalid token'
                ]));
        }
    }

    public function reset_password() {
        $input = json_decode($this->input->raw_input_stream, true);
        
        if (!isset($input['token']) || !isset($input['password'])) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Token and password are required'
                ]));
            return;
        }
        
        $reset = $this->User_model->get_password_reset($input['token']);
        
        if (!$reset || strtotime($reset['expires_at']) < time()) {
            $this->output
                ->set_status_header(400)
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'message' => 'Invalid or expired reset token'
                ]));
            return;
        }
        
        // Update password
        $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
        $this->User_model->update_password($reset['email'], $hashed_password);
        
        // Delete reset token
        $this->User_model->delete_password_reset($input['token']);
        
        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'message' => 'Password reset successfully'
            ]));
    }
    
    private function get_bearer_token() {
        $headers = $this->input->get_request_header('Authorization');
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
