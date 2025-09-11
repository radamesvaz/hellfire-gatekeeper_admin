import { config, getImageUrl } from '../config.js';

export class ProductManager {
    constructor(productService, uiManager) {
        this.productService = productService;
        this.uiManager = uiManager;
        this.products = [];
        this.editingProduct = null;
        this.selectedImages = [];
        this.currentStatusProduct = null;
        this.pendingDeleteProduct = null;
        this.undoTimeout = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        addProductBtn.addEventListener('click', () => {
            this.showAddProductModal();
        });

        // Product form
        const productForm = document.getElementById('productForm');
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        // Image file input
        const productImagesInput = document.getElementById('productImages');
        productImagesInput.addEventListener('change', (e) => {
            this.handleImageSelection(e);
        });

        // Modal close buttons
        const closeProductModal = document.getElementById('closeProductModal');
        const cancelProduct = document.getElementById('cancelProduct');
        
        closeProductModal.addEventListener('click', () => {
            this.hideProductModal();
        });
        
        cancelProduct.addEventListener('click', () => {
            this.hideProductModal();
        });

        // Product Status Modal event listeners
        const closeProductStatusModal = document.getElementById('closeProductStatusModal');
        const cancelProductStatus = document.getElementById('cancelProductStatus');
        const setActiveBtn = document.getElementById('setActiveBtn');
        const setInactiveBtn = document.getElementById('setInactiveBtn');
        const setDeletedBtn = document.getElementById('setDeletedBtn');
        
        closeProductStatusModal.addEventListener('click', () => {
            this.hideProductStatusModal();
        });
        
        cancelProductStatus.addEventListener('click', () => {
            this.hideProductStatusModal();
        });

        setActiveBtn.addEventListener('click', () => {
            this.changeProductStatus('active');
        });

        setInactiveBtn.addEventListener('click', () => {
            this.changeProductStatus('inactive');
        });

        setDeletedBtn.addEventListener('click', () => {
            this.showDeleteConfirmationModal();
        });

        // Delete Confirmation Modal event listeners
        const closeDeleteConfirmationModal = document.getElementById('closeDeleteConfirmationModal');
        const cancelDeleteConfirmation = document.getElementById('cancelDeleteConfirmation');
        const confirmDeleteProduct = document.getElementById('confirmDeleteProduct');
        
        closeDeleteConfirmationModal.addEventListener('click', () => {
            this.hideDeleteConfirmationModal();
        });
        
        cancelDeleteConfirmation.addEventListener('click', () => {
            this.hideDeleteConfirmationModal();
        });

        confirmDeleteProduct.addEventListener('click', () => {
            this.confirmDeleteProduct();
        });
    }

    async loadProducts() {
        try {
            this.uiManager.showLoading();
            this.products = await this.productService.getAllProducts();
            this.renderProducts();
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError('Failed to load products');
            console.error('Load products error:', error);
        }
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        this.uiManager.clearTable('productsTableBody');

        // Filter out deleted products (logical delete)
        const activeProducts = this.products.filter(product => product.status !== 'deleted');

        if (activeProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No products found. Add your first product to get started.
                    </td>
                </tr>
            `;
            return;
        }

        activeProducts.forEach(product => {
            const row = this.createProductRow(product);
            tbody.appendChild(row);
        });
    }

    createProductRow(product) {
        const row = document.createElement('tr');
        
        // Product image
        const imageCell = document.createElement('td');
        if (product.imageUrl) {
            const img = document.createElement('img');
            // Use the helper function to get the correct image URL
            const imageUrl = getImageUrl(product.imageUrl);
            console.log('Original imageUrl:', product.imageUrl);
            console.log('Processed imageUrl:', imageUrl);
            img.src = imageUrl;
            img.alt = product.name;
            img.className = 'product-image';
            img.onerror = () => {
                console.log('Failed to load image:', img.src);
                img.style.display = 'none';
                imageCell.innerHTML = '<div class="product-image-placeholder">No Image</div>';
            };
            imageCell.appendChild(img);
        } else {
            imageCell.innerHTML = '<div class="product-image-placeholder">No Image</div>';
        }

        // Product name
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;

        // Description
        const descCell = document.createElement('td');
        descCell.innerHTML = `<div class="table-content" title="${product.description}">${this.uiManager.truncateText(product.description, 60)}</div>`;

        // Price
        const priceCell = document.createElement('td');
        priceCell.innerHTML = `<span class="price-column">${this.uiManager.formatPrice(product.price)}</span>`;

        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${product.status}">${product.status}</span>`;

        // Stock
        const stockCell = document.createElement('td');
        const stockClass = product.stock === 0 ? 'stock-out' : product.stock < 10 ? 'stock-low' : '';
        stockCell.innerHTML = `<span class="stock-column ${stockClass}">${product.stock}</span>`;

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="table-actions">
                <button class="btn btn-primary btn-sm" onclick="window.productManager.editProduct('${product.id}')">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="window.productManager.showStatusModal('${product.id}')">Status</button>
            </div>
        `;

        row.appendChild(imageCell);
        row.appendChild(nameCell);
        row.appendChild(descCell);
        row.appendChild(priceCell);
        row.appendChild(statusCell);
        row.appendChild(stockCell);
        row.appendChild(actionsCell);

        return row;
    }

    showAddProductModal() {
        this.editingProduct = null;
        this.selectedImages = [];
        this.clearImagePreview();
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        this.uiManager.resetForm('productForm');
        this.uiManager.showModal('productModal');
    }

    editProduct(productId) {
        console.log('Edit product called with ID:', productId, 'Type:', typeof productId);
        console.log('Available products:', this.products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })));
        
        // Convert productId to number for comparison since backend returns numeric IDs
        const numericProductId = parseInt(productId);
        this.editingProduct = this.products.find(p => p.id === numericProductId);
        
        if (!this.editingProduct) {
            console.error('Product not found. Searched for:', numericProductId);
            this.uiManager.showError('Product not found');
            return;
        }

        console.log('Found product:', this.editingProduct);
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        this.populateProductForm(this.editingProduct);
        this.uiManager.showModal('productModal');
    }

    populateProductForm(product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productAvailable').value = product.available ? 'true' : 'false';
        
        // Clear images for editing (we'll keep the existing imageUrl for display)
        this.selectedImages = [];
        this.clearImagePreview();
    }

    async handleProductSubmit() {
        const formData = this.uiManager.getFormData('productForm');
        
        // Add images to form data
        if (this.selectedImages.length > 0) {
            formData.images = this.selectedImages;
        }
        
        // Validate form data
        const errors = this.productService.validateProductData(formData);
        if (errors.length > 0) {
            this.uiManager.showError(errors.join(', '));
            return;
        }

        try {
            this.uiManager.showLoading();
            
            if (this.editingProduct) {
                // Update existing product
                await this.productService.updateProduct(this.editingProduct.id, formData);
                this.uiManager.showSuccess('Product updated successfully');
            } else {
                // Create new product
                await this.productService.createProduct(formData);
                this.uiManager.showSuccess('Product created successfully');
            }

            this.hideProductModal();
            await this.loadProducts(); // Reload products
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to save product');
            console.error('Product submit error:', error);
        }
    }

    showStatusModal(productId) {
        // Convert productId to number for comparison since backend returns numeric IDs
        const numericProductId = parseInt(productId);
        const product = this.products.find(p => p.id === numericProductId);
        if (!product) {
            this.uiManager.showError('Product not found');
            return;
        }

        // Store the current product for status change
        this.currentStatusProduct = product;

        // Update modal content
        document.getElementById('productStatusProductName').textContent = product.name;
        document.getElementById('productStatusCurrentStatus').textContent = product.status;
        document.getElementById('productStatusCurrentStatus').className = `status-badge status-${product.status}`;

        // Enable/disable status buttons based on current status
        this.updateStatusButtons(product.status);

        // Show modal
        this.uiManager.showModal('productStatusModal');
    }

    updateStatusButtons(currentStatus) {
        const setActiveBtn = document.getElementById('setActiveBtn');
        const setInactiveBtn = document.getElementById('setInactiveBtn');
        const setDeletedBtn = document.getElementById('setDeletedBtn');

        // Reset all buttons
        setActiveBtn.disabled = false;
        setInactiveBtn.disabled = false;
        setDeletedBtn.disabled = false;

        // Disable the current status button
        switch (currentStatus) {
            case 'active':
                setActiveBtn.disabled = true;
                break;
            case 'inactive':
                setInactiveBtn.disabled = true;
                break;
            case 'deleted':
                setDeletedBtn.disabled = true;
                break;
        }
    }

    async changeProductStatus(newStatus) {
        if (!this.currentStatusProduct) {
            this.uiManager.showError('No product selected');
            return;
        }

        const product = this.currentStatusProduct;
        const currentStatus = product.status;

        // Don't change if it's the same status
        if (currentStatus === newStatus) {
            this.hideProductStatusModal();
            return;
        }

        // Handle delete status with confirmation modal
        if (newStatus === 'deleted') {
            this.showDeleteConfirmationModal();
            return;
        }

        try {
            this.uiManager.showLoading();
            
            // Use the existing updateProduct method to change status
            const updatedProduct = await this.productService.updateProduct(product.id, {
                ...product,
                status: newStatus
            });

            // Show success message based on the action
            let successMessage = '';
            switch (newStatus) {
                case 'active':
                    successMessage = 'Product activated successfully';
                    break;
                case 'inactive':
                    successMessage = 'Product deactivated successfully';
                    break;
                default:
                    successMessage = 'Product status updated successfully';
            }

            this.uiManager.showSuccess(successMessage);
            this.hideProductStatusModal();
            await this.loadProducts(); // Reload products
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to update product status');
            console.error('Change product status error:', error);
        }
    }

    showDeleteConfirmationModal() {
        if (!this.currentStatusProduct) {
            this.uiManager.showError('No product selected');
            return;
        }

        // Store the product for deletion
        this.pendingDeleteProduct = this.currentStatusProduct;

        // Update modal content
        document.getElementById('deleteConfirmationProductName').textContent = this.pendingDeleteProduct.name;

        // Hide status modal and show delete confirmation modal
        this.hideProductStatusModal();
        this.uiManager.showModal('deleteConfirmationModal');
    }

    hideDeleteConfirmationModal() {
        this.uiManager.hideModal('deleteConfirmationModal');
        this.pendingDeleteProduct = null;
    }

    async confirmDeleteProduct() {
        if (!this.pendingDeleteProduct) {
            this.uiManager.showError('No product selected for deletion');
            return;
        }

        const product = this.pendingDeleteProduct;
        const previousStatus = product.status;

        try {
            this.uiManager.showLoading();
            
            // Mark product as deleted
            await this.productService.updateProduct(product.id, {
                ...product,
                status: 'deleted'
            });

            this.hideDeleteConfirmationModal();
            await this.loadProducts(); // Reload products
            this.uiManager.hideLoading();

            // Show undo notification
            this.showUndoNotification(product, previousStatus);

        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to delete product');
            console.error('Delete product error:', error);
            this.hideDeleteConfirmationModal();
        }
    }

    showUndoNotification(product, previousStatus) {
        // Clear any existing undo timeout
        if (this.undoTimeout) {
            clearTimeout(this.undoTimeout);
        }

        // Create undo notification element
        const notification = document.createElement('div');
        notification.className = 'undo-notification';
        notification.innerHTML = `
            <div class="undo-notification-content">
                <h4 class="undo-notification-title">Product Deleted</h4>
                <p class="undo-notification-message">"${product.name}" has been marked as deleted.</p>
            </div>
            <div class="undo-notification-actions">
                <span class="undo-notification-countdown" id="undoCountdown">10</span>
                <button class="undo-btn" id="undoDeleteBtn">Undo</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Set up undo button
        const undoBtn = notification.querySelector('#undoDeleteBtn');
        const countdownElement = notification.querySelector('#undoCountdown');
        
        undoBtn.addEventListener('click', () => {
            this.undoDelete(product, previousStatus);
            this.hideUndoNotification(notification);
        });

        // Start countdown
        let countdown = 10;
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.hideUndoNotification(notification);
            }
        }, 1000);

        // Auto-hide after 10 seconds
        this.undoTimeout = setTimeout(() => {
            clearInterval(countdownInterval);
            this.hideUndoNotification(notification);
        }, 10000);
    }

    async undoDelete(product, previousStatus) {
        try {
            this.uiManager.showLoading();
            
            // Restore product to previous status
            await this.productService.updateProduct(product.id, {
                ...product,
                status: previousStatus
            });

            await this.loadProducts(); // Reload products
            this.uiManager.hideLoading();
            this.uiManager.showSuccess(`Product "${product.name}" has been restored`);

        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError('Failed to restore product');
            console.error('Undo delete error:', error);
        }
    }

    hideUndoNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
        
        // Clear timeout
        if (this.undoTimeout) {
            clearTimeout(this.undoTimeout);
            this.undoTimeout = null;
        }
    }

    hideProductStatusModal() {
        this.uiManager.hideModal('productStatusModal');
        this.currentStatusProduct = null;
    }

    hideProductModal() {
        this.uiManager.hideModal('productModal');
        this.editingProduct = null;
        this.selectedImages = [];
        this.clearImagePreview();
        this.uiManager.resetForm('productForm');
    }

    handleImageSelection(event) {
        const files = Array.from(event.target.files);
        
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            this.uiManager.showError('Please select only image files (JPG, PNG, GIF)');
            return;
        }

        // Validate file sizes (max 5MB per file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            this.uiManager.showError('Image files must be smaller than 5MB');
            return;
        }

        // Add new images to selected images
        this.selectedImages = [...this.selectedImages, ...files];
        this.renderImagePreview();
    }

    renderImagePreview() {
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = '';

        if (this.selectedImages.length === 0) {
            previewContainer.innerHTML = '<div class="image-preview-placeholder">No images selected</div>';
            return;
        }

        this.selectedImages.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeImage(index);
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewContainer.appendChild(previewItem);
        });
    }

    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.renderImagePreview();
    }

    clearImagePreview() {
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = '<div class="image-preview-placeholder">No images selected</div>';
    }

    // Public methods for global access
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    refreshProducts() {
        return this.loadProducts();
    }
}

// Make productManager globally accessible for inline event handlers
window.productManager = null;
