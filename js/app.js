import { AuthService } from './services/authService.js';
import { ProductService } from './services/productService.js';
import { OrderService } from './services/orderService.js';
import { HttpService } from './services/httpService.js';
import { FavQsService } from './services/favqsService.js';
import { UIManager } from './ui/uiManager.js';
import { ProductManager } from './ui/productManager.js';
import { OrderManager } from './ui/orderManager.js';
import { config, initConfig } from './config.js';

class AdminDashboard {
    constructor() {
        this.authService = new AuthService();
        this.httpService = new HttpService();
        this.productService = new ProductService();
        this.orderService = new OrderService();
        this.favqsService = null; // Will be initialized after config
        this.uiManager = new UIManager();
        this.productManager = new ProductManager(this.productService, this.uiManager);
        this.orderManager = new OrderManager(this.orderService, this.uiManager);
        
        // Make managers globally accessible for inline event handlers
        window.productManager = this.productManager;
        window.orderManager = this.orderManager;
        
        this.currentSection = 'products';
        this.init();
    }

    async init() {
        // Initialize configuration first
        await initConfig();
        
        // Initialize FavQs service after config is loaded
        this.favqsService = new FavQsService();
        
        // Setup HTTP interceptor for unauthorized responses
        this.httpService.setUnauthorizedCallback(() => {
            this.handleUnauthorized();
        });

        // Setup event listeners
        this.setupEventListeners();

        // Check if user is already authenticated
        const token = this.authService.getToken();
        if (token) {
            try {
                // Verify token is still valid
                await this.authService.verifyToken();
                this.showDashboard();
            } catch (error) {
                console.error('Token verification failed:', error);
                this.authService.logout();
                this.showLogin();
            }
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Register form
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });

        // Form toggle buttons
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        
        showRegisterBtn.addEventListener('click', () => {
            this.showRegisterForm();
        });
        
        showLoginBtn.addEventListener('click', () => {
            this.showLoginForm();
        });

        // Logout buttons (desktop and mobile)
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });
        
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');
        logoutBtnMobile.addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');

        try {
            this.uiManager.showLoading();
            await this.authService.login(email, password);
            this.showDashboard();
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            errorElement.textContent = error.message || 'Error en el inicio de sesión. Por favor intenta de nuevo.';
            errorElement.classList.remove('hidden');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const errorElement = document.getElementById('registerError');

        try {
            this.uiManager.showLoading();
            await this.authService.register(name, email, password);
            this.showDashboard();
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            errorElement.textContent = error.message || 'Error en el registro. Por favor intenta de nuevo.';
            errorElement.classList.remove('hidden');
        }
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('showRegisterBtn').classList.remove('hidden');
        document.getElementById('showLoginBtn').classList.add('hidden');
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('registerError').classList.add('hidden');
        document.getElementById('loginForm').reset();
    }

    showRegisterForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('showRegisterBtn').classList.add('hidden');
        document.getElementById('showLoginBtn').classList.remove('hidden');
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('registerError').classList.add('hidden');
        document.getElementById('registerForm').reset();
    }

    handleLogout() {
        this.authService.logout();
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        this.showLoginForm();
        this.loadQuote();
    }

    async showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Set user email (desktop and mobile)
        const userEmail = this.authService.getUserEmail();
        document.getElementById('userEmail').textContent = userEmail;
        document.getElementById('userEmailMobile').textContent = userEmail;

        // Load initial data
        await this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            this.uiManager.showLoading();
            
            // Load products and orders
            await Promise.all([
                this.productManager.loadProducts(),
                this.orderManager.loadOrders()
            ]);
            
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError('Error al cargar los datos del panel');
            console.error('Dashboard data loading error:', error);
        }
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show/hide sections
        document.getElementById('productsSection').classList.toggle('hidden', section !== 'products');
        document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');

        this.currentSection = section;
    }

    handleUnauthorized() {
        // Show error message
        this.uiManager.showError('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        
        // Redirect to login
        this.showLogin();
    }

    async loadQuote() {
        const quoteSection = document.getElementById('quoteSection');
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');

        try {
            // Show loading state
            quoteSection.classList.add('loading');
            quoteText.textContent = 'Cargando cita inspiradora...';
            quoteAuthor.textContent = '— Cargando...';

            // Ensure FavQs service is initialized
            if (!this.favqsService) {
                await initConfig();
                this.favqsService = new FavQsService();
            }

            // Fetch quote from FavQs API
            const quote = await this.favqsService.getMotivationalQuote();

            // Update UI with the quote
            quoteText.textContent = quote.text;
            quoteAuthor.textContent = `— ${quote.author}`;

            // Remove loading state
            quoteSection.classList.remove('loading');

            // Add a subtle animation
            quoteSection.style.opacity = '0';
            quoteSection.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                quoteSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                quoteSection.style.opacity = '1';
                quoteSection.style.transform = 'translateY(0)';
            }, 100);

        } catch (error) {
            console.error('Error loading quote:', error);
            
            // Show error state
            quoteSection.classList.remove('loading');
            quoteSection.classList.add('error');
            quoteText.textContent = 'No se pudo cargar la cita inspiradora.';
            quoteAuthor.textContent = '— Intenta recargar la página';
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
