// Global state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let selectedRating = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabs();
    initCart();
    initAuth();
    initForms();
    initReviews();
    updateCartCount();
    updateAuthButton();
});

// Navigation
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#') && link.getAttribute('href') !== '#cart') {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#cart') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
        } else {
            navbar.style.backgroundColor = 'var(--dark-gray)';
        }
    });
}

// Tabs
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-auth-tab');
            
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-form`).classList.add('active');
            
            const title = tabName === 'login' ? 'Вход в личный кабинет' : 'Регистрация';
            document.getElementById('auth-modal-title').textContent = title;
        });
    });
}

// Cart functionality
function initCart() {
    const addToCartBtns = document.querySelectorAll('.btn-add-cart');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            const servicePrice = parseInt(card.getAttribute('data-price'));
            const serviceId = card.getAttribute('data-service');
            
            addToCart({
                id: serviceId,
                name: serviceName,
                price: servicePrice
            });
        });
    });

    // Cart modal
    document.querySelector('.cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('cart-modal');
        renderCart();
    });

    document.getElementById('close-cart').addEventListener('click', () => {
        closeModal('cart-modal');
    });

    document.getElementById('clear-cart').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите очистить корзину?')) {
            cart = [];
            saveCart();
            renderCart();
            updateCartCount();
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        if (!currentUser) {
            alert('Для оформления заказа необходимо войти в личный кабинет');
            closeModal('cart-modal');
            openModal('auth-modal');
            return;
        }

        // Add services to user history
        const user = users.find(u => u.email === currentUser.email);
        if (user) {
            if (!user.serviceHistory) {
                user.serviceHistory = [];
            }
            
            cart.forEach(item => {
                user.serviceHistory.push({
                    ...item,
                    date: new Date().toLocaleDateString('ru-RU')
                });
            });
            
            currentUser.serviceHistory = user.serviceHistory;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        alert('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        closeModal('cart-modal');
    });
}

function addToCart(service) {
    const existingItem = cart.find(item => item.id === service.id);
    
    if (existingItem) {
        alert('Эта услуга уже добавлена в корзину');
        return;
    }
    
    cart.push(service);
    saveCart();
    updateCartCount();
    
    // Show notification
    showNotification('Услуга добавлена в корзину');
}

function removeFromCart(serviceId) {
    cart = cart.filter(item => item.id !== serviceId);
    saveCart();
    renderCart();
    updateCartCount();
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toLocaleString('ru-RU')}₽</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toLocaleString('ru-RU');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

// Authentication
function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    
    authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            openModal('profile-modal');
            renderProfile();
        } else {
            openModal('auth-modal');
        }
    });

    document.getElementById('close-auth').addEventListener('click', () => {
        closeModal('auth-modal');
    });

    document.getElementById('close-profile').addEventListener('click', () => {
        closeModal('profile-modal');
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthButton();
            closeModal('auth-modal');
            showNotification('Добро пожаловать!');
        } else {
            alert('Неверный email или пароль');
        }
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const carBrand = document.getElementById('register-car-brand').value;
        const carModel = document.getElementById('register-car-model').value;
        const carYear = document.getElementById('register-car-year').value;
        
        // Check if user exists
        if (users.find(u => u.email === email)) {
            alert('Пользователь с таким email уже существует');
            return;
        }
        
        const newUser = {
            name,
            email,
            password,
            carBrand,
            carModel,
            carYear,
            serviceHistory: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateAuthButton();
        closeModal('auth-modal');
        showNotification('Регистрация успешна! Добро пожаловать!');
        
        // Reset form
        document.getElementById('register-form').reset();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateAuthButton();
            closeModal('profile-modal');
            showNotification('Вы вышли из личного кабинета');
        }
    });
}

function updateAuthButton() {
    const authBtn = document.getElementById('auth-btn');
    if (currentUser) {
        authBtn.textContent = currentUser.name.split(' ')[0];
        authBtn.style.color = 'var(--primary-red)';
    } else {
        authBtn.textContent = 'Вход';
        authBtn.style.color = '';
    }
}

function renderProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-car-brand').textContent = currentUser.carBrand;
    document.getElementById('profile-car-model').textContent = currentUser.carModel;
    document.getElementById('profile-car-year').textContent = currentUser.carYear;
    
    const historyContainer = document.getElementById('profile-service-history');
    
    if (!currentUser.serviceHistory || currentUser.serviceHistory.length === 0) {
        historyContainer.innerHTML = '<p class="service-history-empty">История услуг пуста</p>';
        return;
    }
    
    let html = '';
    currentUser.serviceHistory.forEach(service => {
        html += `
            <div class="service-history-item">
                <h4>${service.name}</h4>
                <p>Дата: ${service.date}</p>
                <p>Стоимость: ${service.price.toLocaleString('ru-RU')}₽</p>
            </div>
        `;
    });
    
    historyContainer.innerHTML = html;
}

// Forms
function initForms() {
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.');
        e.target.reset();
    });
}

// Reviews
function initReviews() {
    document.getElementById('add-review-btn').addEventListener('click', () => {
        openModal('review-modal');
    });

    document.getElementById('close-review').addEventListener('click', () => {
        closeModal('review-modal');
    });

    // Rating input
    const ratingStars = document.querySelectorAll('#rating-input i');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateRatingDisplay();
        });

        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });

    document.getElementById('rating-input').addEventListener('mouseleave', updateRatingDisplay);

    // Review form
    document.getElementById('review-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (selectedRating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }
        
        const name = document.getElementById('review-name').value;
        const car = document.getElementById('review-car').value;
        const text = document.getElementById('review-text').value;
        
        // Add review to page
        const reviewsGrid = document.querySelector('.reviews-grid');
        const newReview = document.createElement('div');
        newReview.className = 'review-card';
        
        let starsHtml = '';
        for (let i = 0; i < selectedRating; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        newReview.innerHTML = `
            <div class="review-rating">
                ${starsHtml}
            </div>
            <p class="review-text">"${text}"</p>
            <div class="review-author">
                <div class="author-avatar">${initials}</div>
                <div>
                    <h4>${name}</h4>
                    <p>${car}</p>
                </div>
            </div>
        `;
        
        reviewsGrid.appendChild(newReview);
        
        closeModal('review-modal');
        showNotification('Спасибо за ваш отзыв!');
        
        // Reset form
        document.getElementById('review-form').reset();
        selectedRating = 0;
        updateRatingDisplay();
    });
}

function updateRatingDisplay() {
    const ratingStars = document.querySelectorAll('#rating-input i');
    ratingStars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: var(--primary-red);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
