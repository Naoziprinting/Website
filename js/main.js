// Main JavaScript for Naozi Printing Website

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// Close menu when clicking outside on mobile
document.addEventListener('click', (event) => {
    if (window.innerWidth <= 768) {
        if (!event.target.closest('.nav-container')) {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
});

// Form Validation Helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9+\-\s()]{10,}$/;
    return re.test(phone);
}

// API Configuration
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // Ganti dengan URL Apps Script

// Check Login Status
function checkAuth() {
    const token = localStorage.getItem('naozi_token');
    const user = localStorage.getItem('naozi_user');
    
    if (token && user) {
        return JSON.parse(user);
    }
    return null;
}

// Redirect if not logged in for protected pages
function requireAuth(redirectTo = 'login.html') {
    const user = checkAuth();
    if (!user && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = redirectTo;
    }
    return user;
}

// Logout Function
function logout() {
    localStorage.removeItem('naozi_token');
    localStorage.removeItem('naozi_user');
    window.location.href = 'index.html';
}

// Show/Hide Loading
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

function hideLoading(element, originalContent) {
    if (element && originalContent) {
        element.innerHTML = originalContent;
    }
}

// Create Loading Spinner CSS
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--black);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .notification-success {
            background-color: var(--success);
        }
        
        .notification-error {
            background-color: var(--danger);
        }
        
        .notification-warning {
            background-color: var(--warning);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 10px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyle);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    document.body.appendChild(notification);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update login/logout button based on auth status
    const user = checkAuth();
    const loginButtons = document.querySelectorAll('.btn-login, .nav-link[href="login.html"]');
    
    if (user) {
        loginButtons.forEach(btn => {
            if (btn.classList.contains('btn-login')) {
                btn.innerHTML = `<i class="fas fa-user"></i> ${user.name.split(' ')[0]}`;
                btn.href = 'dashboard.html';
            } else if (btn.href.includes('login.html')) {
                btn.innerHTML = '<i class="fas fa-user"></i> Dashboard';
                btn.href = 'dashboard.html';
            }
        });
        
        // Add logout button if needed
        if (document.querySelector('.nav-menu') && !document.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'nav-link logout-btn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            logoutBtn.onclick = logout;
            document.querySelector('.nav-menu').appendChild(logoutBtn);
        }
    }
});
