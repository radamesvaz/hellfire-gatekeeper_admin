import { config, getApiUrl, getAuthHeaders } from '../config.js';
import { AuthService } from './authService.js';
import { mockData, simulateApiDelay } from './mockData.js';

export class OrderService {
    constructor() {
        this.baseURL = config.api.baseURL;
        this.authService = new AuthService();
        this.useMockData = config.development.useMockData;
        
        // Initialize mock data storage
        if (this.useMockData) {
            this.mockOrders = [...mockData.orders];
        }
    }

    async getAllOrders() {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(600);
                return this.mockOrders;
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/orders`, {
                    method: 'GET',
                    headers: this.authService.getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    }

    async getOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${id}`, {
                method: 'GET',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }

            return await response.json();
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(700);
                
                const orderIndex = this.mockOrders.findIndex(o => o.id === id);
                if (orderIndex === -1) {
                    throw new Error('Order not found');
                }
                
                const updatedOrder = {
                    ...this.mockOrders[orderIndex],
                    status: status,
                    updatedAt: new Date().toISOString()
                };
                
                this.mockOrders[orderIndex] = updatedOrder;
                return updatedOrder;
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/orders/${id}/status`, {
                    method: 'PUT',
                    headers: this.authService.getAuthHeaders(),
                    body: JSON.stringify({ status }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update order status');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    }

    async deleteOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${id}`, {
                method: 'DELETE',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete order');
            }

            return true;
        } catch (error) {
            console.error('Delete order error:', error);
            throw error;
        }
    }

    // Helper method to get order statistics
    async getOrderStats() {
        try {
            const response = await fetch(`${this.baseURL}/orders/stats`, {
                method: 'GET',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order statistics');
            }

            return await response.json();
        } catch (error) {
            console.error('Get order stats error:', error);
            throw error;
        }
    }

    // Helper method to validate order status
    validateOrderStatus(status) {
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
        return validStatuses.includes(status);
    }

    // Helper method to format order date
    formatOrderDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Helper method to calculate order total
    calculateOrderTotal(items) {
        return items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
}
