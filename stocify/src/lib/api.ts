// PHP API Client for CodeIgniter backend
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use localhost for development
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/inventory';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.token = response.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change_password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User management endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(userData: any) {
    return this.request('/api/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/api/users/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Product management endpoints
  async getProducts() {
    return this.request('/api/products');
  }

  async createProduct(productData: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order management endpoints
  async getOrders() {
    return this.request('/api/orders');
  }

  async createOrder(orderData: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock management endpoints
  async getStocks() {
    return this.request('/api/stock');
  }

  async createStock(stockData: any) {
    return this.request('/api/stock/create', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  }

  async updateStock(id: number, stockData: any) {
    return this.request(`/api/stock/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    });
  }

  async deleteStock(id: number) {
    return this.request(`/api/stock/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Category management endpoints
  async getCategories() {
    return this.request('/api/categories');
  }

  async createCategory(categoryData: any) {
    return this.request('/api/categories/create', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/api/categories/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/categories/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Supplier management endpoints
  async getSuppliers() {
    return this.request('/api/suppliers');
  }

  async createSupplier(supplierData: any) {
    return this.request('/api/suppliers/create', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id: string, supplierData: any) {
    return this.request(`/api/suppliers/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/api/suppliers/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Role management endpoints
  async getRoles() {
    return this.request('/api/roles');
  }

  async createRole(roleData: any) {
    return this.request('/api/roles/create', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: any) {
    return this.request(`/api/roles/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string) {
    return this.request(`/api/roles/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Branch management endpoints
  async getBranches() {
    return this.request('/api/branches');
  }

  async createBranch(branchData: any) {
    return this.request('/api/branches/create', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(id: number, branchData: any) {
    return this.request(`/api/branches/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  }

  async deleteBranch(id: number) {
    return this.request(`/api/branches/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStatistics() {
    return this.request('/api/dashboard/statistics');
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
