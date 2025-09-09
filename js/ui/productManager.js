import { config, getImageUrl } from '../config.js';

export class ProductManager {
    constructor(productService, uiManager) {
        this.productService = productService;
        this.uiManager = uiManager;
        this.products = [];
        this.editingProduct = null;
        this.selectedImages = [];
        
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

        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No products found. Add your first product to get started.
                    </td>
                </tr>
            `;
            return;
        }

        this.products.forEach(product => {
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
            img.src = getImageUrl(product.imageUrl);
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
                <button class="btn btn-danger btn-sm" onclick="window.productManager.deleteProduct('${product.id}')">Delete</button>
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
        this.editingProduct = this.products.find(p => p.id === productId);
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

    async deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.uiManager.showError('Product not found');
            return;
        }

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            this.uiManager.showLoading();
            await this.productService.deleteProduct(productId);
            this.uiManager.showSuccess('Product deleted successfully');
            await this.loadProducts(); // Reload products
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message || 'Failed to delete product');
            console.error('Delete product error:', error);
        }
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
