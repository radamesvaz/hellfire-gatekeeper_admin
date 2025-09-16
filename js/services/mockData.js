// Mock data for testing the admin dashboard
export const mockData = {
    // Dummy admin user
    adminUser: {
        email: 'admin@pastry.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    },

    // Sample products
    products: [
        {
            id: '1',
            name: 'Chocolate Cake',
            description: 'Delicious chocolate cake with rich chocolate ganache and fresh berries',
            price: 25.99,
            stock: 15,
            category: 'cakes',
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
        },
        {
            id: '2',
            name: 'Vanilla Cupcakes',
            description: 'Soft vanilla cupcakes with buttercream frosting and sprinkles',
            price: 3.99,
            stock: 8,
            category: 'cakes',
            imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&h=200&fit=crop',
            createdAt: '2024-01-14T14:20:00.000Z',
            updatedAt: '2024-01-14T14:20:00.000Z'
        },
        {
            id: '3',
            name: 'Chocolate Chip Cookies',
            description: 'Classic chocolate chip cookies with crispy edges and chewy center',
            price: 2.49,
            stock: 25,
            category: 'cookies',
            imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop',
            createdAt: '2024-01-13T09:15:00.000Z',
            updatedAt: '2024-01-13T09:15:00.000Z'
        },
        {
            id: '4',
            name: 'Croissants',
            description: 'Buttery, flaky croissants made with French butter and premium flour',
            price: 4.99,
            stock: 12,
            category: 'pastries',
            imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop',
            createdAt: '2024-01-12T06:45:00.000Z',
            updatedAt: '2024-01-12T06:45:00.000Z'
        },
        {
            id: '5',
            name: 'Sourdough Bread',
            description: 'Artisan sourdough bread with a crispy crust and tangy flavor',
            price: 6.99,
            stock: 5,
            category: 'breads',
            imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&h=200&fit=crop',
            createdAt: '2024-01-11T07:30:00.000Z',
            updatedAt: '2024-01-11T07:30:00.000Z'
        },
        {
            id: '6',
            name: 'Tiramisu',
            description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
            price: 8.99,
            stock: 3,
            category: 'desserts',
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop',
            createdAt: '2024-01-10T16:20:00.000Z',
            updatedAt: '2024-01-10T16:20:00.000Z'
        }
    ],

    // Sample orders
    orders: [
        {
            id: '1',
            customer: {
                name: 'John Smith',
                email: 'john.smith@email.com'
            },
            items: [
                {
                    id: '1',
                    name: 'Chocolate Cake',
                    price: 25.99,
                    quantity: 1
                },
                {
                    id: '3',
                    name: 'Chocolate Chip Cookies',
                    price: 2.49,
                    quantity: 3
                }
            ],
            status: 'pending',
            paid: false,
            phone: '555-0123',
            createdAt: '2024-01-15T14:30:00.000Z',
            updatedAt: '2024-01-15T14:30:00.000Z'
        },
        {
            id: '2',
            customer: {
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com'
            },
            items: [
                {
                    id: '4',
                    name: 'Croissants',
                    price: 4.99,
                    quantity: 2
                },
                {
                    id: '5',
                    name: 'Sourdough Bread',
                    price: 6.99,
                    quantity: 1
                }
            ],
            status: 'confirmed',
            paid: true,
            phone: '555-0456',
            createdAt: '2024-01-15T12:15:00.000Z',
            updatedAt: '2024-01-15T12:15:00.000Z'
        },
        {
            id: '3',
            customer: {
                name: 'Mike Wilson',
                email: 'mike.wilson@email.com'
            },
            items: [
                {
                    id: '2',
                    name: 'Vanilla Cupcakes',
                    price: 3.99,
                    quantity: 6
                }
            ],
            status: 'preparing',
            paid: false,
            phone: '555-0789',
            createdAt: '2024-01-15T10:45:00.000Z',
            updatedAt: '2024-01-15T10:45:00.000Z'
        },
        {
            id: '4',
            customer: {
                name: 'Emily Davis',
                email: 'emily.davis@email.com'
            },
            items: [
                {
                    id: '6',
                    name: 'Tiramisu',
                    price: 8.99,
                    quantity: 2
                },
                {
                    id: '3',
                    name: 'Chocolate Chip Cookies',
                    price: 2.49,
                    quantity: 5
                }
            ],
            status: 'ready',
            paid: true,
            phone: '555-0321',
            createdAt: '2024-01-15T09:20:00.000Z',
            updatedAt: '2024-01-15T09:20:00.000Z'
        },
        {
            id: '5',
            customer: {
                name: 'David Brown',
                email: 'david.brown@email.com'
            },
            items: [
                {
                    id: '1',
                    name: 'Chocolate Cake',
                    price: 25.99,
                    quantity: 1
                },
                {
                    id: '4',
                    name: 'Croissants',
                    price: 4.99,
                    quantity: 3
                }
            ],
            status: 'completed',
            paid: true,
            phone: '555-0654',
            createdAt: '2024-01-14T16:30:00.000Z',
            updatedAt: '2024-01-14T16:30:00.000Z'
        },
        {
            id: '6',
            customer: {
                name: 'Lisa Anderson',
                email: 'lisa.anderson@email.com'
            },
            items: [
                {
                    id: '5',
                    name: 'Sourdough Bread',
                    price: 6.99,
                    quantity: 2
                }
            ],
            status: 'cancelled',
            paid: false,
            phone: '555-0987',
            createdAt: '2024-01-14T14:00:00.000Z',
            updatedAt: '2024-01-14T14:00:00.000Z'
        }
    ]
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to generate new IDs
export const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

