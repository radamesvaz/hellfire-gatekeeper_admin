import { config, getApiUrl, getAuthHeaders } from '../config.js';
import { AuthService } from './authService.js';
import { HttpService } from './httpService.js';
import { mockData, simulateApiDelay } from './mockData.js';

export class OrderService {
    constructor() {
        this.baseURL = config.api.baseURL;
        this.authRequired = config.api.authRequired;
        this.authService = new AuthService();
        this.httpService = new HttpService();
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
                // Transform mock data to match our expected format
                const transformedOrders = this.transformMockOrdersData(this.mockOrders);
                return transformedOrders;
            } else {
                // Real API call using HttpService
                const response = await this.httpService.get(`${this.baseURL}${this.authRequired}/orders`);

                if (!response.ok) {
                    throw new Error('Error al obtener los pedidos');
                }

                const orders = await response.json();
                // Transform server data to match our expected format
                const transformedOrders = this.transformOrdersData(orders);
                return transformedOrders;
            }
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    }

    async getOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}${this.authRequired}/orders/${id}`, {
                method: 'GET',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                    throw new Error('Error al obtener el pedido');
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
                // Real API call using unified endpoint
                const response = await this.httpService.patch(`${this.baseURL}${this.authRequired}/orders/${id}`, { status });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al actualizar el estado del pedido');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    }

    async updateOrderPaidStatus(id, paid) {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(500);
                
                const orderIndex = this.mockOrders.findIndex(o => o.id === id);
                if (orderIndex === -1) {
                    throw new Error('Order not found');
                }
                
                const updatedOrder = {
                    ...this.mockOrders[orderIndex],
                    paid: paid,
                    updatedAt: new Date().toISOString()
                };
                
                this.mockOrders[orderIndex] = updatedOrder;
                return updatedOrder;
            } else {
                // Real API call using unified endpoint
                const response = await this.httpService.patch(`${this.baseURL}${this.authRequired}/orders/${id}`, { paid });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al actualizar el estado de pago del pedido');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Update order paid status error:', error);
            throw error;
        }
    }

    async deleteOrder(id) {
        try {
            const response = await fetch(`${this.baseURL}${this.authRequired}/orders/${id}`, {
                method: 'DELETE',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.json();
                    throw new Error(error.message || 'Error al eliminar el pedido');
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
            const response = await fetch(`${this.baseURL}${this.authRequired}/orders/stats`, {
                method: 'GET',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Error al obtener las estadísticas de pedidos');
            }

            return await response.json();
        } catch (error) {
            console.error('Get order stats error:', error);
            throw error;
        }
    }

    // Helper method to validate order status
    validateOrderStatus(status) {
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
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

    // Transform server data to match our expected format
    transformOrdersData(serverOrders) {
        return serverOrders.map(order => ({
            id: order.id_order,
            customer: order.user_name,
            items: this.transformOrderItems(order.OrderItems || [], order.total_price),
            total: order.total_price,
            status: order.status,
            date: order.created_on,
            deliveryDate: order.delivery_date,
            note: order.note || '',
            userId: order.id_user,
            paid: order.paid || false,
            phone: order.phone || ''
        }));
    }

    // Transform mock data to match our expected format
    transformMockOrdersData(mockOrders) {
        return mockOrders.map(order => ({
            id: parseInt(order.id),
            customer: order.customer.name,
            items: order.items,
            total: this.calculateOrderTotal(order.items),
            status: order.status,
            date: order.createdAt,
            deliveryDate: order.createdAt, // Using createdAt as delivery date for mock
            note: '',
            userId: order.id,
            paid: order.paid || false,
            phone: order.phone || ''
        }));
    }

    // Transform order items from server format
    transformOrderItems(serverItems, orderTotal = 0) {
        return serverItems.map(item => {
            // If no individual price is provided, calculate it from total
            let itemPrice = item.price || 0;
            if (itemPrice === 0 && orderTotal > 0 && serverItems.length > 0) {
                // Calculate price per unit based on total quantity
                const totalQuantity = serverItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
                itemPrice = orderTotal / totalQuantity;
            }
            
            const transformedItem = {
                id: item.id_order_item,
                productId: item.id_product,
                quantity: item.quantity || 1,
                price: itemPrice,
                name: item.name || 'Unknown Product'
            };
            return transformedItem;
        });
    }

    // Helper method to get items summary for display
    getItemsSummary(items) {
        if (!items || items.length === 0) {
            return 'No items';
        }
        
        if (items.length === 1) {
            return `${items[0].name} (${items[0].quantity})`;
        }
        
        return `${items.length} items`;
    }
}
