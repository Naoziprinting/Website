// API Service for Naozi Printing
class NaoziAPI {
    constructor() {
        this.API_URL = 'https://script.google.com/macros/s/AKfycbxruvo7gl2Cv5piZCKYAXUEYg_wfs2vtwJP9-mwVWGyH6w7a4zzgqNLQOVZKLH_3DeNWQ/exec';
        this.user = JSON.parse(localStorage.getItem('naozi_user') || 'null');
        this.token = localStorage.getItem('naozi_token') || null;
    }

    async request(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            // Tambahkan endpoint ke URL
            const url = method === 'GET' 
                ? `${this.API_URL}?endpoint=${endpoint}&${new URLSearchParams(data).toString()}`
                : `${this.API_URL}`;

            if (method === 'POST') {
                data.endpoint = endpoint;
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            
            // Handle redirect (Google Apps Script issue)
            if (response.redirected) {
                const redirectUrl = response.url;
                const redirectResponse = await fetch(redirectUrl, options);
                return await redirectResponse.json();
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Koneksi ke server gagal. Silakan coba lagi.'
            };
        }
    }

    // Test connection
    async testConnection() {
        return await this.request('test', 'GET');
    }

    // Initialize sheets
    async initializeSheets() {
        return await this.request('init', 'GET');
    }

    // Register new user
    async register(userData) {
        const result = await this.request('register', 'POST', userData);
        
        if (result.success) {
            // Auto login after register
            const loginResult = await this.login({
                email: userData.email,
                password: userData.password
            });
            
            return loginResult;
        }
        
        return result;
    }

    // Login
    async login(credentials) {
        const result = await this.request('login', 'POST', credentials);
        
        if (result.success) {
            this.user = result.user;
            this.token = result.token;
            
            localStorage.setItem('naozi_user', JSON.stringify(result.user));
            localStorage.setItem('naozi_token', result.token);
        }
        
        return result;
    }

    // Get services
    async getServices() {
        return await this.request('services', 'GET');
    }

    // Upload file
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const base64 = e.target.result.split(',')[1];
                    const result = await this.request('upload', 'POST', {
                        fileName: file.name,
                        mimeType: file.type,
                        content: base64
                    });
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }

    // Create order
    async createOrder(orderData) {
        // Upload file if exists
        let fileUrl = '';
        if (orderData.file) {
            const uploadResult = await this.uploadFile(orderData.file);
            if (uploadResult.success) {
                fileUrl = uploadResult.fileUrl;
            }
        }

        const orderPayload = {
            userId: this.user ? this.user.id : 'GUEST',
            serviceType: orderData.serviceType,
            quantity: orderData.quantity,
            fileUrl: fileUrl,
            customerInfo: {
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone,
                company: orderData.company,
                address: orderData.address,
                notes: orderData.notes,
                paperType: orderData.paperType,
                size: orderData.size
            }
        };

        return await this.request('order', 'POST', orderPayload);
    }

    // Get user orders
    async getUserOrders() {
        if (!this.user) {
            return { success: false, message: 'Silakan login terlebih dahulu' };
        }
        
        return await this.request('orders', 'GET', {
            userId: this.user.id,
            token: this.token
        });
    }

    // Logout
    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('naozi_user');
        localStorage.removeItem('naozi_token');
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.user !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }
}

// Create global API instance
window.naoziAPI = new NaoziAPI();
