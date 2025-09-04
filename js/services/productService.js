import { config, getApiUrl, getAuthHeaders } from '../config.js';
import { AuthService } from './authService.js';
import { mockData, simulateApiDelay, generateId } from './mockData.js';

export class ProductService {
    constructor() {
        this.baseURL = config.api.baseURL;
        this.authService = new AuthService();
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
                // Real API call
                const response = await fetch(`${this.baseURL}/products`, {
                    method: 'GET',
                    headers: this.authService.getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                return await response.json();
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
                
                const newProduct = {
                    id: generateId(),
                    ...productData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts.push(newProduct);
                return newProduct;
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/products`, {
                    method: 'POST',
                    headers: this.authService.getAuthHeaders(),
                    body: JSON.stringify(productData),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create product');
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
                
                const updatedProduct = {
                    ...this.mockProducts[productIndex],
                    ...productData,
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts[productIndex] = updatedProduct;
                return updatedProduct;
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/products/${id}`, {
                    method: 'PUT',
                    headers: this.authService.getAuthHeaders(),
                    body: JSON.stringify(productData),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update product');
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
                // Mock API call
                await simulateApiDelay(500);
                
                const productIndex = this.mockProducts.findIndex(p => p.id === id);
                if (productIndex === -1) {
                    throw new Error('Product not found');
                }
                
                this.mockProducts.splice(productIndex, 1);
                return true;
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/products/${id}`, {
                    method: 'DELETE',
                    headers: this.authService.getAuthHeaders(),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete product');
                }

                return true;
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

        if (!data.category || data.category.trim().length === 0) {
            errors.push('Product category is required');
        }

        return errors;
    }
}
