// Configuration file for the admin dashboard
export const config = {
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
        baseURL: 'http://localhost:8080', // Update this to match your backend URL
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

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};
