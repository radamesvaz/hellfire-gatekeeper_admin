// HTTP Service with global error handling and authentication
import { AuthService } from './authService.js';

export class HttpService {
    constructor() {
        this.authService = new AuthService();
        this.onUnauthorized = null;
    }

    // Set callback for unauthorized responses
    setUnauthorizedCallback(callback) {
        this.onUnauthorized = callback;
    }

    // Generic fetch method with error handling
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            
            // Check for 401 Unauthorized
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized - token expired');
            }
            
            return response;
        } catch (error) {
            // Re-throw the error to be handled by the calling service
            throw error;
        }
    }

    // Handle unauthorized access
    handleUnauthorized() {
        // Clear stored authentication data
        this.authService.logout();
        
        // Call the unauthorized callback if set
        if (this.onUnauthorized) {
            this.onUnauthorized();
        }
    }

    // GET request
    // Note: Avoid sending Content-Type/Authorization on public endpoints to prevent CORS preflight
    async get(url) {
        const requiresAuth = url.includes('/auth');
        const headers = requiresAuth
            ? { 'Authorization': `Bearer ${this.authService.getToken()}` }
            : {};

        const options = {
            method: 'GET',
            headers,
        };

        return this.fetch(url, options);
    }

    // POST request with auth headers
    async post(url, data) {
        const options = {
            method: 'POST',
            headers: this.authService.getAuthHeaders(),
            body: JSON.stringify(data),
        };
        
        return this.fetch(url, options);
    }

    // PUT request with auth headers
    async put(url, data) {
        const options = {
            method: 'PUT',
            headers: this.authService.getAuthHeaders(),
            body: JSON.stringify(data),
        };
        
        return this.fetch(url, options);
    }

    // PATCH request with auth headers
    async patch(url, data) {
        const options = {
            method: 'PATCH',
            headers: this.authService.getAuthHeaders(),
            body: JSON.stringify(data),
        };
        
        return this.fetch(url, options);
    }

    // DELETE request with auth headers
    async delete(url) {
        const options = {
            method: 'DELETE',
            headers: this.authService.getAuthHeaders(),
        };
        
        return this.fetch(url, options);
    }

    // POST request with FormData (for file uploads)
    async postFormData(url, formData) {
        const token = this.authService.getToken();
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type - let browser set it with boundary for multipart/form-data
            },
            body: formData,
        };
        
        return this.fetch(url, options);
    }

    // PUT request with FormData (for file uploads)
    async putFormData(url, formData) {
        const token = this.authService.getToken();
        const options = {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type - let browser set it with boundary for multipart/form-data
            },
            body: formData,
        };
        
        return this.fetch(url, options);
    }
}
