export class OrderManager {
    constructor(orderService, uiManager) {
        this.orderService = orderService;
        this.uiManager = uiManager;
        this.orders = [];
        this.editingOrder = null;
        this.currentOrderDetails = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Order status form
        const orderStatusForm = document.getElementById('orderStatusForm');
        orderStatusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOrderStatusSubmit();
        });

        // Order details modal close buttons
        const closeOrderDetailsModal = document.getElementById('closeOrderDetailsModal');
        const cancelOrderDetails = document.getElementById('cancelOrderDetails');
        const updateOrderStatusBtn = document.getElementById('updateOrderStatusBtn');
        
        closeOrderDetailsModal.addEventListener('click', () => {
            this.hideOrderDetailsModal();
        });
        
        cancelOrderDetails.addEventListener('click', () => {
            this.hideOrderDetailsModal();
        });

        updateOrderStatusBtn.addEventListener('click', () => {
            // Store the order ID before closing the modal
            const orderId = this.currentOrderDetails ? this.currentOrderDetails.id : null;
            this.hideOrderDetailsModal();
            if (orderId) {
                this.editOrderStatus(orderId);
            } else {
                console.error('No order details available for status update');
            }
        });

        // Order status modal close buttons
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
            this.uiManager.showError('Error al cargar los pedidos');
            console.error('Load orders error:', error);
        }
    }

    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        this.uiManager.clearTable('ordersTableBody');

        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No se encontraron pedidos. Los pedidos aparecerán aquí cuando los clientes los realicen.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort orders by ID in descending order (newest first)
        const sortedOrders = [...this.orders].sort((a, b) => b.id - a.id);

        sortedOrders.forEach(order => {
            const row = this.createOrderRow(order);
            tbody.appendChild(row);
        });
    }

    createOrderRow(order) {
        const row = document.createElement('tr');
        row.className = 'clickable-row';
        row.style.cursor = 'pointer';
        
        // Add click event to show order details
        row.addEventListener('click', () => {
            this.showOrderDetails(order);
        });

        // Delivery Date (using actual delivery date)
        const deliveryDateCell = document.createElement('td');
        const deliveryDate = new Date(order.deliveryDate);
        deliveryDateCell.innerHTML = `
            <div>
                <div><strong>${deliveryDate.getDate()}/${deliveryDate.getMonth() + 1}</strong></div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${deliveryDate.getFullYear()}</div>
            </div>
        `;

        // Customer Name
        const customerCell = document.createElement('td');
        customerCell.innerHTML = `
            <div>
                <div><strong>${order.customer}</strong></div>
            </div>
        `;

        // Product (show first item or summary)
        const productCell = document.createElement('td');
        if (order.items && order.items.length > 0) {
            const firstItem = order.items[0];
            const itemCount = order.items.length;
            productCell.innerHTML = `
                <div>
                    <div><strong>${firstItem.name}</strong></div>
                    ${itemCount > 1 ? `<div style="font-size: 0.75rem; color: var(--text-secondary);">+${itemCount - 1} more</div>` : ''}
                </div>
            `;
        } else {
            productCell.innerHTML = '<span style="color: var(--text-secondary);">No items</span>';
        }

        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${order.status}">${order.status}</span>`;

        // Paid Status with editable checkbox
        const paidCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = order.paid || false;
        checkbox.className = 'paid-checkbox';
        
        // Prevent row click when interacting with checkbox
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row click
        });
        
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent row click
            this.handlePaidStatusChange(order.id, e.target.checked);
        });
        
        paidCell.appendChild(checkbox);
        paidCell.style.textAlign = 'center';

        row.appendChild(deliveryDateCell);
        row.appendChild(customerCell);
        row.appendChild(productCell);
        row.appendChild(statusCell);
        row.appendChild(paidCell);

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
                <span class="order-item-price">$${item.price}</span>
            </div>
        `).join('');

        return `<div class="order-items">${itemsHtml}</div>`;
    }

    editOrderStatus(orderId) {
        // Convert orderId to number since it comes as string from HTML
        const numericOrderId = parseInt(orderId, 10);
        this.editingOrder = this.orders.find(o => o.id === numericOrderId);
        if (!this.editingOrder) {
            this.uiManager.showError('Pedido no encontrado');
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
            this.uiManager.showError('Estado de pedido inválido');
            return;
        }

        try {
            this.uiManager.showLoading();
            await this.orderService.updateOrderStatus(this.editingOrder.id, newStatus);
            this.uiManager.showSuccess('Estado del pedido actualizado exitosamente');
            this.hideOrderStatusModal();
            await this.loadOrders(); // Reload orders
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Error al actualizar el estado del pedido');
            console.error('Order status update error:', error);
        }
    }

    async handlePaidStatusChange(orderId, paid) {
        try {
            await this.orderService.updateOrderPaidStatus(orderId, paid);
            
            // Update the order in our local array
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex].paid = paid;
            }
            
            // Update the modal if it's currently showing this order
            if (this.currentOrderDetails && this.currentOrderDetails.id === orderId) {
                this.currentOrderDetails.paid = paid;
                this.updateOrderDetailsPaidStatus(paid);
            }
            
            this.uiManager.showSuccess(`Pedido ${paid ? 'marcado como pagado' : 'marcado como no pagado'}`);
        } catch (error) {
            this.uiManager.showError(error.message || 'Error al actualizar el estado de pago');
            console.error('Paid status update error:', error);
            
            // Revert the checkbox state on error
            const checkbox = document.querySelector(`input[data-order-id="${orderId}"]`);
            if (checkbox) {
                checkbox.checked = !paid;
            }
        }
    }

    showOrderDetails(order) {
        this.currentOrderDetails = order;
        
        // Populate order details
        document.getElementById('orderDetailsId').textContent = order.id;
        document.getElementById('orderDetailsDate').textContent = this.uiManager.formatDate(order.date);
        
        // Set delivery date (using actual delivery date)
        const deliveryDate = new Date(order.deliveryDate);
        document.getElementById('orderDetailsDeliveryDate').textContent = this.uiManager.formatDate(deliveryDate);
        
        document.getElementById('orderDetailsTotal').textContent = this.uiManager.formatPrice(order.total);
        document.getElementById('orderDetailsStatus').textContent = order.status;
        document.getElementById('orderDetailsStatus').className = `status-badge status-${order.status}`;
        document.getElementById('orderDetailsCustomer').textContent = order.customer;
        document.getElementById('orderDetailsCustomerId').textContent = order.userId;
        document.getElementById('orderDetailsPhone').textContent = order.phone || '-';
        
        // Update paid status
        this.updateOrderDetailsPaidStatus(order.paid || false);
        
        // Populate order notes
        const notesContainer = document.getElementById('orderDetailsNotes');
        if (order.note && order.note.trim() !== '') {
            notesContainer.innerHTML = `
                <div class="notes-content">
                    <p>${order.note}</p>
                </div>
            `;
        } else {
            notesContainer.innerHTML = '<div class="no-notes">No hay notas para este pedido</div>';
        }
        
        // Populate order items
        const itemsContainer = document.getElementById('orderDetailsItems');
        if (order.items && order.items.length > 0) {
            let subtotal = 0;
            let totalItems = 0;
            
            itemsContainer.innerHTML = order.items.map(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                totalItems += item.quantity;
                
                return `
                    <div class="order-item-detail">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-details">Cantidad: ${item.quantity} | Precio unitario: ${this.uiManager.formatPrice(item.price)}</div>
                        </div>
                        <div class="item-total">${this.uiManager.formatPrice(itemTotal)}</div>
                    </div>
                `;
            }).join('');
            
            // Update summary
            document.getElementById('orderDetailsSubtotal').textContent = this.uiManager.formatPrice(subtotal);
            document.getElementById('orderDetailsItemCount').textContent = totalItems;
        } else {
            itemsContainer.innerHTML = '<div class="no-items">No hay productos en este pedido</div>';
            document.getElementById('orderDetailsSubtotal').textContent = this.uiManager.formatPrice(0);
            document.getElementById('orderDetailsItemCount').textContent = '0';
        }
        
        this.uiManager.showModal('orderDetailsModal');
    }

    hideOrderDetailsModal() {
        this.uiManager.hideModal('orderDetailsModal');
        this.currentOrderDetails = null;
    }

    hideOrderStatusModal() {
        this.uiManager.hideModal('orderStatusModal');
        this.editingOrder = null;
        this.uiManager.resetForm('orderStatusForm');
    }

    updateOrderDetailsPaidStatus(paid) {
        const paidElement = document.getElementById('orderDetailsPaid');
        if (paid) {
            paidElement.innerHTML = '<span class="paid-badge paid">✓ Pagado</span>';
            paidElement.className = 'paid-status paid';
        } else {
            paidElement.innerHTML = '<span class="paid-badge unpaid">✗ No Pagado</span>';
            paidElement.className = 'paid-status unpaid';
        }
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
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }
}

// Make orderManager globally accessible for inline event handlers
window.orderManager = null;

