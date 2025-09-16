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
        this.currentProductDetails = null;
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

        // Product Details Modal event listeners
        const closeProductDetailsModal = document.getElementById('closeProductDetailsModal');
        const cancelProductDetails = document.getElementById('cancelProductDetails');
        const editProductBtn = document.getElementById('editProductBtn');
        const changeProductStatusBtn = document.getElementById('changeProductStatusBtn');
        
        closeProductDetailsModal.addEventListener('click', () => {
            this.hideProductDetailsModal();
        });
        
        cancelProductDetails.addEventListener('click', () => {
            this.hideProductDetailsModal();
        });

        editProductBtn.addEventListener('click', () => {
            // Store the product ID before closing the modal
            const productId = this.currentProductDetails ? this.currentProductDetails.id : null;
            this.hideProductDetailsModal();
            if (productId) {
                this.editProduct(productId);
            } else {
                console.error('No product details available for editing');
            }
        });

        changeProductStatusBtn.addEventListener('click', () => {
            // Store the product ID before closing the modal
            const productId = this.currentProductDetails ? this.currentProductDetails.id : null;
            this.hideProductDetailsModal();
            if (productId) {
                this.showStatusModal(productId);
            } else {
                console.error('No product details available for status change');
            }
        });

        // Delete Image Confirmation Modal event listeners
        const closeDeleteImageConfirmationModal = document.getElementById('closeDeleteImageConfirmationModal');
        const cancelDeleteImage = document.getElementById('cancelDeleteImage');
        const confirmDeleteImage = document.getElementById('confirmDeleteImage');
        
        closeDeleteImageConfirmationModal.addEventListener('click', () => {
            this.hideDeleteImageConfirmationModal();
        });
        
        cancelDeleteImage.addEventListener('click', () => {
            this.hideDeleteImageConfirmationModal();
        });

        confirmDeleteImage.addEventListener('click', () => {
            this.confirmDeleteImage();
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
                    <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
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
        row.className = 'clickable-row';
        row.style.cursor = 'pointer';
        
        // Add click event to show product details
        row.addEventListener('click', () => {
            this.showProductDetails(product);
        });

        // Product image
        const imageCell = document.createElement('td');
        
        if (product.imageUrl) {
            const img = document.createElement('img');
            // Use the helper function to get the correct image URL
            const fullImageUrl = getImageUrl(product.imageUrl);
            img.src = fullImageUrl;
            img.alt = product.name;
            img.className = 'product-image';
            img.onerror = (e) => {
                console.error(`Failed to load image for product ${product.name}:`, fullImageUrl);
                img.style.display = 'none';
                imageCell.innerHTML = '<div class="product-image-placeholder">No Image</div>';
            };
            img.onload = () => {
                console.log(`Successfully loaded image for product ${product.name}`);
            };
            imageCell.appendChild(img);
        } else {
            imageCell.innerHTML = '<div class="product-image-placeholder">No Image</div>';
        }

        // Product name
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `
            <div>
                <div><strong>${product.name}</strong></div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${product.id}</div>
            </div>
        `;

        // Price
        const priceCell = document.createElement('td');
        priceCell.innerHTML = `<span class="price-column">${this.uiManager.formatPrice(product.price)}</span>`;

        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="status-badge status-${product.status}">${product.status}</span>`;

        row.appendChild(imageCell);
        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(statusCell);

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
        // Convert productId to number for comparison since backend returns numeric IDs
        const numericProductId = parseInt(productId);
        this.editingProduct = this.products.find(p => p.id === numericProductId);
        
        if (!this.editingProduct) {
            this.uiManager.showError('Product not found');
            return;
        }

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
        
        // Show existing images in the preview
        this.selectedImages = [];
        this.showExistingImages(product);
    }

    async handleProductSubmit() {
        const formData = this.uiManager.getFormData('productForm');
        
        // Validate form data (without images)
        const errors = this.productService.validateProductData(formData);
        if (errors.length > 0) {
            this.uiManager.showError(errors.join(', '));
            return;
        }

        try {
            this.uiManager.showLoading();
            
            if (this.editingProduct) {
                // Check if product data has changed
                const hasDataChanges = this.hasProductDataChanged(formData);
                
                if (hasDataChanges) {
                    // Update existing product data
                    await this.productService.updateProduct(this.editingProduct.id, formData);
                }
                
                // If there are new images, upload them separately
                if (this.selectedImages.length > 0) {
                    await this.productService.uploadProductImages(this.editingProduct.id, this.selectedImages);
                }
                
                // Show appropriate success message
                if (hasDataChanges && this.selectedImages.length > 0) {
                    this.uiManager.showSuccess('Product and images updated successfully');
                } else if (hasDataChanges) {
                    this.uiManager.showSuccess('Product updated successfully');
                } else if (this.selectedImages.length > 0) {
                    this.uiManager.showSuccess('Images added successfully');
                } else {
                    this.uiManager.showSuccess('No changes detected');
                }
            } else {
                // Create new product first
                const createdProduct = await this.productService.createProduct(formData);
                
                // If there are images, upload them separately
                if (this.selectedImages.length > 0) {
                    // Extract product ID from the response
                    const productId = createdProduct.product_id || createdProduct.id;
                    await this.productService.uploadProductImages(productId, this.selectedImages);
                }
                
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

    // Check if product data has changed (excluding images)
    hasProductDataChanged(formData) {
        if (!this.editingProduct) return true; // New product always has changes
        
        const currentProduct = this.editingProduct;
        
        // Compare each field
        return (
            formData.name !== currentProduct.name ||
            formData.description !== currentProduct.description ||
            parseFloat(formData.price) !== parseFloat(currentProduct.price) ||
            parseInt(formData.stock) !== parseInt(currentProduct.stock) ||
            formData.status !== currentProduct.status ||
            (formData.available === 'true') !== currentProduct.available
        );
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

    showProductDetails(product) {
        this.currentProductDetails = product;
        
        // Populate product details
        document.getElementById('productDetailsId').textContent = product.id;
        document.getElementById('productDetailsName').textContent = product.name;
        document.getElementById('productDetailsPrice').textContent = this.uiManager.formatPrice(product.price);
        document.getElementById('productDetailsStock').textContent = product.stock;
        document.getElementById('productDetailsStatus').textContent = product.status;
        document.getElementById('productDetailsStatus').className = `status-badge status-${product.status}`;
        document.getElementById('productDetailsAvailable').textContent = product.available ? 'Yes' : 'No';
        
        // Populate description
        const descriptionContainer = document.getElementById('productDetailsDescription');
        descriptionContainer.textContent = product.description;
        
        // Populate images
        const imagesContainer = document.getElementById('productDetailsImages');
        if (product.imageUrls && product.imageUrls.length > 0) {
            // Show all images from the imageUrls array with delete buttons
            const imagesHTML = product.imageUrls.map((imageUrl, index) => `
                <div class="product-image-detail">
                    <img src="${getImageUrl(imageUrl)}" alt="${product.name} - Image ${index + 1}" class="product-detail-image">
                    <button class="delete-image-btn" onclick="productManager.deleteImageFromProduct(${product.id}, '${imageUrl}')" title="Delete this image">
                        ×
                    </button>
                </div>
            `).join('');
            
            imagesContainer.innerHTML = imagesHTML;
        } else if (product.imageUrl) {
            // Fallback to single image if imageUrls array is not available
            imagesContainer.innerHTML = `
                <div class="product-image-detail">
                    <img src="${getImageUrl(product.imageUrl)}" alt="${product.name}" class="product-detail-image">
                    <button class="delete-image-btn" onclick="productManager.deleteImageFromProduct(${product.id}, '${product.imageUrl}')" title="Delete this image">
                        ×
                    </button>
                </div>
            `;
        } else {
            imagesContainer.innerHTML = '<div class="no-images">No images available</div>';
        }
        
        this.uiManager.showModal('productDetailsModal');
    }

    async deleteImageFromProduct(productId, imageUrl) {
        // Store the deletion parameters for later use
        this.pendingImageDeletion = { productId, imageUrl };
        
        // Show the image preview in the confirmation modal
        const previewImage = document.getElementById('deleteImagePreview');
        previewImage.src = getImageUrl(imageUrl);
        
        // Show the confirmation modal
        this.uiManager.showModal('deleteImageConfirmationModal');
    }

    async confirmDeleteImage() {
        if (!this.pendingImageDeletion) {
            this.uiManager.showError('No image selected for deletion');
            return;
        }

        const { productId, imageUrl } = this.pendingImageDeletion;

        try {
            this.uiManager.showLoading();
            this.hideDeleteImageConfirmationModal();
            
            // Call the service to delete the image
            await this.productService.deleteProductImage(productId, imageUrl);
            
            // Update the current product details
            if (this.currentProductDetails && this.currentProductDetails.id === productId) {
                // Remove the image from the current product details
                this.currentProductDetails.imageUrls = this.currentProductDetails.imageUrls.filter(url => url !== imageUrl);
                this.currentProductDetails.imageUrl = this.currentProductDetails.imageUrls.length > 0 ? this.currentProductDetails.imageUrls[0] : null;
                
                // Refresh the modal display
                this.showProductDetails(this.currentProductDetails);
            }
            
            // Reload products to get updated data
            await this.loadProducts();
            
            this.uiManager.showSuccess('Image deleted successfully');
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to delete image');
            console.error('Delete image error:', error);
        }
    }

    hideDeleteImageConfirmationModal() {
        this.uiManager.hideModal('deleteImageConfirmationModal');
        this.pendingImageDeletion = null;
    }

    hideProductDetailsModal() {
        this.uiManager.hideModal('productDetailsModal');
        this.currentProductDetails = null;
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

        // Show existing images if editing a product
        if (this.editingProduct && this.editingProduct.imageUrls && this.editingProduct.imageUrls.length > 0) {
            this.editingProduct.imageUrls.forEach((imageUrl, index) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                
                const img = document.createElement('img');
                img.src = getImageUrl(imageUrl);
                img.alt = `Existing image ${index + 1}`;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = () => this.removeExistingImage(index, this.editingProduct);
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                previewContainer.appendChild(previewItem);
            });
        }

        // Show newly selected images
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

        // Show placeholder if no images at all
        if ((!this.editingProduct || !this.editingProduct.imageUrls || this.editingProduct.imageUrls.length === 0) && this.selectedImages.length === 0) {
            previewContainer.innerHTML = '<div class="image-preview-placeholder">No images selected</div>';
        }
    }

    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.renderImagePreview();
    }

    clearImagePreview() {
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = '<div class="image-preview-placeholder">No images selected</div>';
    }

    showExistingImages(product) {
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = '';

        if (!product.imageUrls || product.imageUrls.length === 0) {
            previewContainer.innerHTML = '<div class="image-preview-placeholder">No images selected</div>';
            return;
        }

        product.imageUrls.forEach((imageUrl, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            const img = document.createElement('img');
            img.src = getImageUrl(imageUrl);
            img.alt = `Existing image ${index + 1}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeExistingImage(index, product);
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewContainer.appendChild(previewItem);
        });
    }

    removeExistingImage(index, product) {
        // Remove the image from the product's imageUrls array
        product.imageUrls.splice(index, 1);
        
        // Update the imageUrl if it was the first image
        if (index === 0 && product.imageUrls.length > 0) {
            product.imageUrl = product.imageUrls[0];
        } else if (product.imageUrls.length === 0) {
            product.imageUrl = null;
        }
        
        // Re-render the preview
        this.showExistingImages(product);
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
