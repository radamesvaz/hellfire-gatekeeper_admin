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
                    throw new Error('Invalid email or password');
                }
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Login failed');
                }

                const data = await response.json();
                
                // Store token and user info
                localStorage.setItem(this.tokenKey, data.token);
                localStorage.setItem(this.userKey, JSON.stringify({
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role
                }));

                return data;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(email, password) {
        try {
            if (config.firebase.useFirebaseAuth) {
                // Firebase Registration - no need to store in localStorage
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                return { user: userCredential.user };
            } else {
                throw new Error('Registration is only available with Firebase Authentication');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async verifyToken() {
        const token = this.getToken();
        if (!token) {
            throw new Error('No token found');
        }

        try {
            if (this.useMockData) {
                // Mock token verification
                await simulateApiDelay(300);
                
                if (token.startsWith('mock_jwt_token_')) {
                    return { valid: true, user: mockData.adminUser };
                } else {
                    throw new Error('Token verification failed');
                }
            } else {
                // Real API call
                const response = await fetch(`${this.baseURL}/auth/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }

                return await response.json();
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
