// Configuration file for the admin dashboard

// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Environment-specific configurations
const environments = {
    development: {
        api: {
            baseURL: 'http://localhost:8080',
        }
    },
    production: {
        api: {
            baseURL: 'https://api.tudominio.com', // Cambiar por tu dominio de producción
        }
    }
};

// Get current environment config
const currentEnv = isDevelopment ? 'development' : 'production';
const envConfig = environments[currentEnv];

export const config = {
    // Environment info
    environment: {
        isDevelopment,
        isProduction,
        current: currentEnv,
    },
    
    // Development Mode
    development: {
        useMockData: false, // Set to false when backend is ready
    },
    
    // Firebase Configuration
    firebase: {
        enabled: false, // Set to false to disable Firebase
        useFirebaseAuth: false, // Use Firebase Authentication
        useFirestore: false, // Use Firestore database
        useStorage: false, // Use Firebase Storage
    },
    
    // API Configuration
    api: {
        baseURL: envConfig.api.baseURL,
        authRequired: '/auth',
        timeout: 10000, // Request timeout in milliseconds
    },
    
    // Authentication Configuration
    auth: {
        tokenKey: 'admin_token',
        userKey: 'admin_user',
        tokenExpiryCheck: true, // Enable automatic token expiry checking
    },
    
    // UI Configuration
    ui: {
        notificationDuration: 3000, // Default notification display time
        loadingTimeout: 30000, // Loading timeout for long operations
        tablePageSize: 50, // Number of items per page in tables
    },
    
    // Feature Flags
    features: {
        enableProductImages: true,
        enableOrderFiltering: true,
        enableBulkOperations: false,
        enableExport: false,
    },
    
    // Validation Rules
    validation: {
        product: {
            minNameLength: 2,
            maxNameLength: 100,
            minDescriptionLength: 10,
            maxDescriptionLength: 500,
            minPrice: 0.01,
            maxPrice: 9999.99,
            minStock: 0,
            maxStock: 9999,
            validStatuses: ['active', 'inactive', 'deleted'],
        },
        order: {
            validStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        },
    },
};

// Helper function to get API URL
export const getApiUrl = (endpoint) => {
    return `${config.api.baseURL}${endpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Simply prepend the base URL. We expect imagePath to be clean already.
    return `${config.api.baseURL}${imagePath}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Helper function to log current environment (for debugging)
export const logEnvironment = () => {
    console.log('Environment:', config.environment.current);
    console.log('API Base URL:', config.api.baseURL);
    console.log('Is Development:', config.environment.isDevelopment);
    console.log('Is Production:', config.environment.isProduction);
};
