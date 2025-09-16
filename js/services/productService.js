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
                
                // For mock data, we'll create the product without images first
                const processedData = { ...productData };
                // Remove images from the data as they'll be handled separately
                delete processedData.images;
                
                const newProduct = {
                    id: generateId(),
                    ...processedData,
                    image_urls: [], // Start with empty image array
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts.push(newProduct);
                return newProduct;
            } else {
                // Real API call - send only product data (no images)
                const productDataOnly = { ...productData };
                // Remove images from the data as they'll be handled separately
                delete productDataOnly.images;
                
                // Convert data types to match backend expectations
                if (productDataOnly.price !== undefined) {
                    productDataOnly.price = parseFloat(productDataOnly.price);
                }
                if (productDataOnly.stock !== undefined) {
                    productDataOnly.stock = parseInt(productDataOnly.stock);
                }
                if (productDataOnly.available !== undefined) {
                    productDataOnly.available = typeof productDataOnly.available === 'string' ? 
                        productDataOnly.available === 'true' : productDataOnly.available;
                }
                
                console.log('Sending product data:', productDataOnly);
                console.log('Data types:', {
                    name: typeof productDataOnly.name,
                    description: typeof productDataOnly.description,
                    price: typeof productDataOnly.price,
                    stock: typeof productDataOnly.stock,
                    available: typeof productDataOnly.available,
                    status: typeof productDataOnly.status
                });
                
                const response = await this.httpService.post(`${this.baseURL}/auth/products`, productDataOnly);

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

    async uploadProductImages(productId, images) {
        try {
            if (this.useMockData) {
                // Mock API call for image upload
                await simulateApiDelay(1000);
                
                // Find the product in mock data
                const productIndex = this.mockProducts.findIndex(p => p.id === productId);
                if (productIndex === -1) {
                    throw new Error('Product not found');
                }
                
                // Simulate image URLs that match the backend format
                const mockImageUrls = images.map((file, index) => {
                    return `/uploads/products/mock_${Date.now()}_${index}_${file.name}`;
                });
                
                // Add new images to existing ones
                const existingImages = this.mockProducts[productIndex].image_urls || [];
                const allImages = [...existingImages, ...mockImageUrls];
                
                // Update the product with new images
                this.mockProducts[productIndex].image_urls = allImages;
                this.mockProducts[productIndex].imageUrl = allImages[0]; // Set first image as main
                this.mockProducts[productIndex].updatedAt = new Date().toISOString();
                
                return {
                    message: "Images added successfully",
                    new_images: mockImageUrls,
                    all_images: allImages
                };
            } else {
                // Real API call using FormData for image uploads
                const formData = new FormData();
                
                // Add images to form data (using "images" field name as expected by backend)
                images.forEach((file) => {
                    formData.append('images', file);
                });
                
                const response = await this.httpService.postFormData(`${this.baseURL}/auth/products/${productId}/images`, formData);

                if (!response.ok) {
                    // Get the error message from response
                    const errorText = await response.text();
                    console.log('Backend error response:', errorText);
                    throw new Error(errorText || 'Failed to upload images');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Upload product images error:', error);
            throw error;
        }
    }

    async deleteProductImage(productId, imageUrl) {
        try {
            if (this.useMockData) {
                // Mock API call for image deletion
                await simulateApiDelay(500);
                
                // Find the product in mock data
                const productIndex = this.mockProducts.findIndex(p => p.id === productId);
                if (productIndex === -1) {
                    throw new Error('Product not found');
                }
                
                // Remove the image from the product's imageUrls array
                const currentImages = this.mockProducts[productIndex].image_urls || [];
                const updatedImages = currentImages.filter(url => url !== imageUrl);
                
                // Update the product with remaining images
                this.mockProducts[productIndex].image_urls = updatedImages;
                this.mockProducts[productIndex].imageUrl = updatedImages.length > 0 ? updatedImages[0] : null;
                this.mockProducts[productIndex].updatedAt = new Date().toISOString();
                
                return {
                    message: "Image deleted successfully",
                    remaining_images: updatedImages
                };
            } else {
                // Real API call using DELETE method
                const encodedImageUrl = encodeURIComponent(imageUrl);
                const deleteUrl = `${this.baseURL}/auth/products/${productId}/images?imageUrl=${encodedImageUrl}`;
                
                console.log('Deleting image:', {
                    productId,
                    imageUrl,
                    encodedImageUrl,
                    deleteUrl
                });
                
                const response = await this.httpService.delete(deleteUrl);

                if (!response.ok) {
                    // Get the error message from response
                    const errorText = await response.text();
                    console.log('Backend error response:', errorText);
                    console.log('Response status:', response.status);
                    throw new Error(errorText || 'Failed to delete image');
                }

                return await response.json();
            }
        } catch (error) {
            console.error('Delete product image error:', error);
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
                
                // For updates, we'll handle images separately if they exist
                const processedData = { ...productData };
                // Remove images from the data as they'll be handled separately
                delete processedData.images;
                
                const updatedProduct = {
                    ...this.mockProducts[productIndex],
                    ...processedData,
                    updatedAt: new Date().toISOString()
                };
                
                this.mockProducts[productIndex] = updatedProduct;
                return updatedProduct;
            } else {
                // Real API call - send only product data (no images)
                const productDataOnly = { ...productData };
                // Remove images from the data as they'll be handled separately
                delete productDataOnly.images;
                
                // Convert data types to match backend expectations
                if (productDataOnly.price !== undefined) {
                    productDataOnly.price = parseFloat(productDataOnly.price);
                }
                if (productDataOnly.stock !== undefined) {
                    productDataOnly.stock = parseInt(productDataOnly.stock);
                }
                if (productDataOnly.available !== undefined) {
                    productDataOnly.available = typeof productDataOnly.available === 'string' ? 
                        productDataOnly.available === 'true' : productDataOnly.available;
                }
                
                console.log('Sending update data:', productDataOnly);
                
                const response = await this.httpService.put(`${this.baseURL}/auth/products/${id}`, productDataOnly);

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
            // Use image_urls as is from the server
            const imageUrls = product.image_urls || [];
            
            return {
                id: product.id_product,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
                imageUrls: imageUrls,
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

    // Create FormData for image uploads only
    createImageFormData(images) {
        const formData = new FormData();
        
        // Add images (using "images" field name as expected by backend)
        images.forEach((file) => {
            formData.append('images', file);
        });
        
        return formData;
    }
}
