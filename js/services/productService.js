import { config, getApiUrl, getAuthHeaders } from '../config.js';
import { AuthService } from './authService.js';
import { HttpService } from './httpService.js';
import { mockData, simulateApiDelay, generateId } from './mockData.js';

export class ProductService {
    constructor() {
        this.baseURL = config.api.baseURL;
        this.authService = new AuthService();
        this.httpService = new HttpService();
        this.useMockData = config.development.useMockData;
        
        // Initialize mock data storage
        if (this.useMockData) {
            this.mockProducts = [...mockData.products];
        }
    }

    async getAllProducts() {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(600);
                return this.mockProducts;
            } else {
                // Real API call using HttpService
                const response = await this.httpService.get(`${this.baseURL}/products`);

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const products = await response.json();
                // Transform server data to match our expected format
                return this.transformProductsData(products);
            }
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`, {
                method: 'GET',
                headers: this.authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }

            return await response.json();
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(800);
                
                // Process images for mock data
                const processedData = this.processProductImages(productData);
                
                const newProduct = {
                    id: generateId(),
                    ...processedData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts.push(newProduct);
                return newProduct;
            } else {
                // Real API call using FormData for file uploads
                const formData = this.createFormData(productData);
                const response = await this.httpService.postFormData(`${this.baseURL}/auth/products`, formData);

                if (!response.ok) {
                    // Get the error message from response
                    const errorText = await response.text();
                    console.log('Backend error response:', errorText);
                    throw new Error(errorText || 'Failed to create product');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            if (this.useMockData) {
                // Mock API call
                await simulateApiDelay(700);
                
                const productIndex = this.mockProducts.findIndex(p => p.id === id);
                if (productIndex === -1) {
                    throw new Error('Product not found');
                }
                
                // Process images for mock data
                const processedData = this.processProductImages(productData);
                
                const updatedProduct = {
                    ...this.mockProducts[productIndex],
                    ...processedData,
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts[productIndex] = updatedProduct;
                return updatedProduct;
            } else {
                // Real API call using FormData for file uploads
                const formData = this.createFormData(productData);
                const response = await this.httpService.putFormData(`${this.baseURL}/auth/products/${id}`, formData);

                if (!response.ok) {
                    // Get the error message from response
                    const errorText = await response.text();
                    console.log('Backend error response:', errorText);
                    throw new Error(errorText || 'Failed to update product');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            if (this.useMockData) {
                // Mock API call - logical delete by changing status
                await simulateApiDelay(500);
                
                const productIndex = this.mockProducts.findIndex(p => p.id === id);
                if (productIndex === -1) {
                    throw new Error('Product not found');
                }
                
                // Change status to 'deleted' instead of removing from array
                this.mockProducts[productIndex].status = 'deleted';
                this.mockProducts[productIndex].updatedAt = new Date().toISOString();
                return this.mockProducts[productIndex];
            } else {
                // Real API call using PATCH method for logical delete
                const response = await this.httpService.patch(`${this.baseURL}/auth/products/${id}`, {
                    status: 'deleted'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete product');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    }

    // Helper method to validate product data
    validateProductData(data) {
        const errors = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('Product name is required');
        }

        if (!data.description || data.description.trim().length === 0) {
            errors.push('Product description is required');
        }

        if (!data.price || isNaN(data.price) || data.price <= 0) {
            errors.push('Valid price is required');
        }

        if (!data.stock || isNaN(data.stock) || data.stock < 0) {
            errors.push('Valid stock quantity is required');
        }

        if (!data.status || data.status.trim().length === 0) {
            errors.push('Product status is required');
        }

        return errors;
    }

    // Transform server data to match our expected format
    transformProductsData(serverProducts) {
        return serverProducts.map(product => {
            // Clean image URLs - replace spaces with underscores
            const cleanImageUrls = product.image_urls ? 
                product.image_urls.map(url => url.replace(/\s+/g, '_')) : [];
            
            return {
                id: product.id_product,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                imageUrl: cleanImageUrls.length > 0 ? cleanImageUrls[0] : null,
                imageUrls: cleanImageUrls,
                status: product.status,
                available: product.available,
                createdAt: product.created_on
            };
        });
    }

    // Get dummy image based on product name
    getDummyImage(productName) {
        const name = productName.toLowerCase();
        
        // Map product names to appropriate dummy images
        if (name.includes('brownie') || name.includes('chocolate')) {
            return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop&crop=center';
        } else if (name.includes('suspiro') || name.includes('merengue')) {
            return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&crop=center';
        } else if (name.includes('torta') || name.includes('cake')) {
            return 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=200&h=200&fit=crop&crop=center';
        } else if (name.includes('cookie') || name.includes('galleta')) {
            return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop&crop=center';
        } else if (name.includes('pan') || name.includes('bread')) {
            return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center';
        } else {
            // Default pastry image
            return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop&crop=center';
        }
    }

    // Process product images for mock data
    processProductImages(productData) {
        const processedData = { ...productData };
        
        if (productData.images && productData.images.length > 0) {
            // For mock data, we'll simulate image URLs that match the backend format
            const mockImageUrls = productData.images.map((file, index) => {
                // Create mock URLs that match the backend pattern
                return `/uploads/products/mock_${Date.now()}_${index}_${file.name}`;
            });
            
            // Set the image_urls array to match backend format
            processedData.image_urls = mockImageUrls;
            
            // Set the first image as the main image URL for backward compatibility
            if (mockImageUrls.length > 0) {
                processedData.imageUrl = mockImageUrls[0];
            }
            
            // Remove the files array as we don't need it in the processed data
            delete processedData.images;
        }
        
        return processedData;
    }

    // Create FormData for file uploads
    createFormData(productData) {
        const formData = new FormData();
        
        // Add basic product fields (matching backend expectations)
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('stock', productData.stock);
        formData.append('status', productData.status);
        
        // Convert available to boolean if it's a string
        const availableValue = productData.available !== undefined ? 
            (typeof productData.available === 'string' ? productData.available === 'true' : productData.available) : 
            true;
        formData.append('available', availableValue);
        
        // Add images if they exist (using "images" field name as expected by backend)
        if (productData.images && productData.images.length > 0) {
            productData.images.forEach((file, index) => {
                formData.append('images', file);
            });
        }
        
        
        return formData;
    }
}
