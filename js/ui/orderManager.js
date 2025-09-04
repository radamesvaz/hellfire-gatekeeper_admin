export class OrderManager {
    constructor(orderService, uiManager) {
        this.orderService = orderService;
        this.uiManager = uiManager;
        this.orders = [];
        this.editingOrder = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Order status form
        const orderStatusForm = document.getElementById('orderStatusForm');
        orderStatusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOrderStatusSubmit();
        });

        // Modal close buttons
        const closeOrderModal = document.getElementById('closeOrderModal');
        const cancelOrderStatus = document.getElementById('cancelOrderStatus');
        
        closeOrderModal.addEventListener('click', () => {
            this.hideOrderStatusModal();
        });
        
        cancelOrderStatus.addEventListener('click', () => {
            this.hideOrderStatusModal();
        });
    }

    async loadOrders() {
        try {
            this.uiManager.showLoading();
            this.orders = await this.orderService.getAllOrders();
            this.renderOrders();
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError('Failed to load orders');
            console.error('Load orders error:', error);
        }
    }

    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        this.uiManager.clearTable('ordersTableBody');

        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No orders found. Orders will appear here when customers place them.
                    </td>
                </tr>
            `;
            return;
        }

        this.orders.forEach(order => {
            const row = this.createOrderRow(order);
            tbody.appendChild(row);
        });
    }

    createOrderRow(order) {
        const row = document.createElement('tr');
        
        // Order ID
        const idCell = document.createElement('td');
        idCell.textContent = order.id;

        // Customer
        const customerCell = document.createElement('td');
        customerCell.innerHTML = `
            <div>
                <div><strong>${order.customer.name}</strong></div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${order.customer.email}</div>
            </div>
        `;

        // Items
        const itemsCell = document.createElement('td');
        itemsCell.innerHTML = this.renderOrderItems(order.items);

        // Total
        const totalCell = document.createElement('td');
        const total = this.orderService.calculateOrderTotal(order.items);
        totalCell.innerHTML = `<span class="price-column">${this.uiManager.formatPrice(total)}</span>`;

        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${order.status}">${order.status}</span>`;

        // Date
        const dateCell = document.createElement('td');
        dateCell.textContent = this.uiManager.formatDate(order.createdAt);

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="window.orderManager.editOrderStatus('${order.id}')">Update Status</button>
            </div>
        `;

        row.appendChild(idCell);
        row.appendChild(customerCell);
        row.appendChild(itemsCell);
        row.appendChild(totalCell);
        row.appendChild(statusCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);

        return row;
    }

    renderOrderItems(items) {
        if (!items || items.length === 0) {
            return '<span style="color: var(--text-secondary);">No items</span>';
        }

        const itemsHtml = items.map(item => `
            <div class="order-item">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-quantity">x${item.quantity}</span>
            </div>
        `).join('');

        return `<div class="order-items">${itemsHtml}</div>`;
    }

    editOrderStatus(orderId) {
        this.editingOrder = this.orders.find(o => o.id === orderId);
        if (!this.editingOrder) {
            this.uiManager.showError('Order not found');
            return;
        }

        // Set current status in the form
        document.getElementById('orderStatus').value = this.editingOrder.status;
        this.uiManager.showModal('orderStatusModal');
    }

    async handleOrderStatusSubmit() {
        const formData = this.uiManager.getFormData('orderStatusForm');
        const newStatus = formData.status;

        if (!this.orderService.validateOrderStatus(newStatus)) {
            this.uiManager.showError('Invalid order status');
            return;
        }

        try {
            this.uiManager.showLoading();
            await this.orderService.updateOrderStatus(this.editingOrder.id, newStatus);
            this.uiManager.showSuccess('Order status updated successfully');
            this.hideOrderStatusModal();
            await this.loadOrders(); // Reload orders
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to update order status');
            console.error('Order status update error:', error);
        }
    }

    hideOrderStatusModal() {
        this.uiManager.hideModal('orderStatusModal');
        this.editingOrder = null;
        this.uiManager.resetForm('orderStatusForm');
    }

    // Public methods for global access
    getOrderById(id) {
        return this.orders.find(o => o.id === id);
    }

    refreshOrders() {
        return this.loadOrders();
    }

    // Helper method to get order statistics
    async getOrderStats() {
        try {
            return await this.orderService.getOrderStats();
        } catch (error) {
            console.error('Get order stats error:', error);
            return null;
        }
    }

    // Helper method to filter orders by status
    filterOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }

    // Helper method to get orders for a specific date range
    getOrdersByDateRange(startDate, endDate) {
        return this.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }
}

// Make orderManager globally accessible for inline event handlers
window.orderManager = null;

