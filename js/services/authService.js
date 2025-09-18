import { config, getApiUrl, getAuthHeaders } from '../config.js';
import { mockData, simulateApiDelay } from './mockData.js';
import { auth } from '../firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export class AuthService {
    constructor() {
        this.baseURL = config.api.baseURL;
        this.tokenKey = config.auth.tokenKey;
        this.userKey = config.auth.userKey;
        this.useMockData = config.development.useMockData;
    }

    async login(email, password) {
        try {
            if (config.firebase.useFirebaseAuth) {
                // Firebase Authentication - no need to store in localStorage
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                return { user: userCredential.user };
            } else if (this.useMockData) {
                // Mock authentication
                await simulateApiDelay(800);
                
                if (email === mockData.adminUser.email && password === mockData.adminUser.password) {
                    const mockToken = 'mock_jwt_token_' + Date.now();
                    const data = {
                        token: mockToken,
                        user: mockData.adminUser
                    };
                    
                    // Store token and user info
                    localStorage.setItem(this.tokenKey, data.token);
                    localStorage.setItem(this.userKey, JSON.stringify({
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role
                    }));

                    return data;
                } else {
                    throw new Error('Correo electrónico o contraseña inválidos');
                }
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error en el inicio de sesión');
                }

                const data = await response.json();
                
                // Store only token (backend only returns token)
                localStorage.setItem(this.tokenKey, data.token);
                
                // Store basic user info from login form
                localStorage.setItem(this.userKey, JSON.stringify({
                    email: email, // Use email from login form
                    role: 'admin' // Default role
                }));

                return data;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            if (config.firebase.useFirebaseAuth) {
                // Firebase Registration - no need to store in localStorage
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                return { user: userCredential.user };
            } else {
                // Real API call for registration
                const response = await fetch(`${this.baseURL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error en el registro');
                }

                const data = await response.json();
                
                // Store only token (backend only returns token)
                localStorage.setItem(this.tokenKey, data.token);
                
                // Store basic user info from registration form
                localStorage.setItem(this.userKey, JSON.stringify({
                    name: name, // Store name from registration form
                    email: email, // Use email from registration form
                    role: 'admin' // Default role
                }));

                return data;
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async verifyToken() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No se encontró token');
        }

        try {
            if (this.useMockData) {
                // Mock token verification
                await simulateApiDelay(300);
                
                if (token.startsWith('mock_jwt_token_')) {
                    return { valid: true, user: mockData.adminUser };
                } else {
                    throw new Error('Error en la verificación del token');
                }
            } else {
                // Skip verification for now - assume token is valid if it exists
                // TODO: Implement /verify endpoint in backend
                return { valid: true };
            }
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    async logout() {
        if (config.firebase.useFirebaseAuth) {
            await signOut(auth);
        } else {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
        }
    }

    getToken() {
        if (config.firebase.useFirebaseAuth) {
            return auth.currentUser ? auth.currentUser.uid : null;
        }
        return localStorage.getItem(this.tokenKey);
    }

    getUserEmail() {
        if (config.firebase.useFirebaseAuth) {
            return auth.currentUser ? auth.currentUser.email : null;
        }
        const user = localStorage.getItem(this.userKey);
        if (user) {
            const userData = JSON.parse(user);
            return userData.email;
        }
        return null;
    }

    getUser() {
        if (config.firebase.useFirebaseAuth) {
            return auth.currentUser;
        }
        const user = localStorage.getItem(this.userKey);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }

    isAuthenticated() {
        if (config.firebase.useFirebaseAuth) {
            return !!auth.currentUser;
        }
        return !!this.getToken();
    }

    // Helper method to get headers with authentication
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
}
