# Pastry Shop Admin Dashboard

A modern, responsive admin dashboard for managing a pastry shop's products and orders. Built with vanilla JavaScript, HTML, and CSS.

## Features

### Authentication
- Secure login system with JWT token management
- Automatic token verification and session management
- Logout functionality

### Products Management
- View all products in a clean, sortable table
- Add new products with image URLs, descriptions, and pricing
- Edit existing product details
- Delete products with confirmation
- Stock level tracking with visual indicators
- Category management

### Orders Management
- View all customer orders with detailed information
- Update order status (pending, confirmed, preparing, ready, completed, cancelled)
- Order history and tracking
- Customer information display
- Order total calculations

### UI/UX Features
- Modern, responsive design
- Loading states and error handling
- Toast notifications for user feedback
- Modal dialogs for forms
- Clean table layouts with hover effects
- Status badges with color coding
- Mobile-friendly interface

## Project Structure

```
├── index.html              # Main HTML file
├── styles/                 # CSS files
│   ├── main.css           # Base styles and variables
│   ├── components.css     # Component styles (buttons, layout)
│   ├── forms.css          # Form styles
│   ├── tables.css         # Table styles
│   └── modal.css          # Modal styles
├── js/                    # JavaScript modules
│   ├── app.js            # Main application file
│   ├── services/         # API services
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── orderService.js
│   └── ui/               # UI managers
│       ├── uiManager.js
│       ├── productManager.js
│       └── orderManager.js
└── README.md             # This file
```

## Setup Instructions

### 1. Prerequisites
- A web server (local or hosted)
- Backend API with the following endpoints (optional - mock data is enabled by default):
  - `POST /api/auth/login` - User authentication
  - `GET /api/auth/verify` - Token verification
  - `GET /api/products` - Get all products
  - `POST /api/products` - Create product
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product
  - `GET /api/orders` - Get all orders
  - `PUT /api/orders/:id/status` - Update order status

### 2. Configuration

#### Mock Data (Default)
The dashboard comes with mock data enabled by default for testing. You can log in with:
- **Email:** `admin@pastry.com`
- **Password:** `admin123`

#### Real Backend Integration
To use with your real backend, update the configuration in `js/config.js`:

```javascript
development: {
    useMockData: false, // Set to false to use real backend
},
api: {
    baseURL: 'http://localhost:3000/api', // Update to your backend URL
}
```

### 3. Installation
1. Clone or download this project
2. Place the files in your web server directory
3. Open `index.html` in a web browser
4. Log in with the mock credentials:
   - Email: `admin@pastry.com`
   - Password: `admin123`

### 4. Backend API Requirements

#### Authentication Endpoints
```javascript
// POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}

// GET /api/auth/verify
// Headers: Authorization: Bearer <token>
```

#### Products Endpoints
```javascript
// GET /api/products
// Headers: Authorization: Bearer <token>

// POST /api/products
{
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake",
  "price": 25.99,
  "stock": 10,
  "category": "cakes",
  "imageUrl": "https://example.com/image.jpg"
}

// PUT /api/products/:id
// Same body as POST

// DELETE /api/products/:id
```

#### Orders Endpoints
```javascript
// GET /api/orders
// Headers: Authorization: Bearer <token>

// PUT /api/orders/:id/status
{
  "status": "confirmed"
}
```

### 5. Expected Data Formats

#### Product Object
```javascript
{
  "id": "1",
  "name": "Chocolate Cake",
  "description": "Delicious chocolate cake with cream filling",
  "price": 25.99,
  "stock": 10,
  "category": "cakes",
  "imageUrl": "https://example.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Order Object
```javascript
{
  "id": "1",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "items": [
    {
      "id": "1",
      "name": "Chocolate Cake",
      "price": 25.99,
      "quantity": 2
    }
  ],
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

### Login (Mock Data)
1. Open the admin dashboard
2. Enter the mock credentials:
   - Email: `admin@pastry.com`
   - Password: `admin123`
3. Click "Sign In"

### Login (Real Backend)
1. Open the admin dashboard
2. Enter your admin credentials
3. Click "Sign In"

### Managing Products
1. Navigate to the "Products" tab
2. Click "Add New Product" to create a new product
3. Fill in the product details and save
4. Use "Edit" and "Delete" buttons to manage existing products

### Managing Orders
1. Navigate to the "Orders" tab
2. View all customer orders
3. Click "Update Status" to change order status
4. Monitor order progress through status updates

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Features
- JWT token-based authentication
- Secure token storage in localStorage
- Automatic token verification
- Protected API endpoints
- Input validation and sanitization

## Customization

### Styling
The dashboard uses CSS custom properties for easy theming. Update the variables in `styles/main.css`:

```css
:root {
  --primary-color: #8b5cf6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  /* ... other variables */
}
```

### Adding New Features
The modular architecture makes it easy to add new features:
1. Create new service files in `js/services/`
2. Create new UI manager files in `js/ui/`
3. Update the main `app.js` file to include new functionality

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure your backend allows requests from the frontend domain
2. **Authentication Failures**: Check that your JWT tokens are valid and not expired
3. **API Errors**: Verify that your backend endpoints match the expected format
4. **Loading Issues**: Check browser console for JavaScript errors

### Debug Mode
Open browser developer tools (F12) to see detailed error messages and API responses.

## License
This project is open source and available under the MIT License.
