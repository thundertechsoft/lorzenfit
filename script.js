// ============================================
// LORZENFIT WEBSITE - MAIN JAVASCRIPT FILE
// This JavaScript works for ALL 7 pages
// ============================================

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let cart = [];
let products = [];
let isAdmin = false;

// ===== DOM READY FUNCTION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lorzenfit Website Initialized');
    
    // Initialize common features
    initCommonFeatures();
    
    // Initialize page-specific features
    initPageFeatures();
    
    // Load initial data
    loadInitialData();
    
    // Check user authentication
    checkAuth();
});

// ===== COMMON FEATURES INITIALIZATION =====
function initCommonFeatures() {
    // Mobile menu toggle
    initMobileMenu();
    
    // Update cart count
    updateCartCount();
    
    // Initialize toast notifications
    initToast();
    
    // Initialize common event listeners
    initCommonEventListeners();
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('show');
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function initToast() {
    // Toast container already in HTML
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log('Toast:', message);
        return;
    }
    
    // Clear existing toast
    toast.className = 'toast';
    
    // Set message and type
    toast.textContent = message;
    toast.classList.add(type);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function initCommonEventListeners() {
    // Newsletter forms
    document.querySelectorAll('form[id="newsletterForm"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                subscribeNewsletter(email);
            }
        });
    });
    
    // Add to cart buttons (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productId = button.getAttribute('data-id');
            if (productId) {
                addToCart(productId);
            }
        }
    });
}

// ===== PAGE-SPECIFIC INITIALIZATION =====
function initPageFeatures() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    switch(page) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'products.html':
            initProductsPage();
            break;
        case 'about.html':
            initAboutPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
        case 'cart.html':
            initCartPage();
            break;
        case 'checkout.html':
            initCheckoutPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
}

// ===== HOME PAGE =====
function initHomePage() {
    loadFeaturedProducts();
    initTestimonialsSlider();
}

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    
    // In real app, load from Firebase
    // For demo, use sample products
    setTimeout(() => {
        const sampleProducts = [
            {
                id: '1',
                name: 'Casual Blue Shirt',
                price: 2499,
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 4.5,
                category: 'casual'
            },
            {
                id: '2',
                name: 'Formal White Shirt',
                price: 2999,
                image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?ixlib=rb-4.0.3&auto=format&fit=crop&w-687&q=80',
                rating: 4.0,
                category: 'formal'
            },
            {
                id: '3',
                name: 'Plaid Red Shirt',
                price: 2799,
                image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 5.0,
                category: 'casual'
            },
            {
                id: '4',
                name: 'Striped Green Shirt',
                price: 2299,
                image: 'https://images.unsplash.com/photo-1525450824786-227cbef70703?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 3.5,
                category: 'casual'
            }
        ];
        
        container.innerHTML = sampleProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        ${generateRatingStars(product.rating)}
                    </div>
                    <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }, 1000);
}

function initTestimonialsSlider() {
    // Simple auto-rotation for testimonials
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 1) {
        let currentIndex = 0;
        
        setInterval(() => {
            testimonials.forEach((card, index) => {
                card.style.opacity = index === currentIndex ? '1' : '0';
                card.style.transform = index === currentIndex ? 'translateY(0)' : 'translateY(20px)';
                card.style.position = index === currentIndex ? 'relative' : 'absolute';
                card.style.transition = 'all 0.5s ease';
            });
            
            currentIndex = (currentIndex + 1) % testimonials.length;
        }, 5000);
    }
}

// ===== PRODUCTS PAGE =====
function initProductsPage() {
    loadAllProducts();
    initProductFilters();
    initProductSorting();
}

function loadAllProducts() {
    const container = document.getElementById('allProducts');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading products...</p></div>';
    
    // In real app, load from Firebase
    setTimeout(() => {
        const allProducts = [
            {
                id: '1',
                name: 'Casual Blue Shirt',
                price: 2499,
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 4.5,
                category: 'casual',
                stock: 25,
                sizes: ['S', 'M', 'L']
            },
            {
                id: '2',
                name: 'Formal White Shirt',
                price: 2999,
                image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 4.0,
                category: 'formal',
                stock: 15,
                sizes: ['M', 'L', 'XL']
            },
            {
                id: '3',
                name: 'Plaid Red Shirt',
                price: 2799,
                image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 5.0,
                category: 'casual',
                stock: 30,
                sizes: ['XS', 'S', 'M', 'L']
            },
            {
                id: '4',
                name: 'Striped Green Shirt',
                price: 2299,
                image: 'https://images.unsplash.com/photo-1525450824786-227cbef70703?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 3.5,
                category: 'casual',
                stock: 10,
                sizes: ['S', 'M']
            },
            {
                id: '5',
                name: 'Party Blue Shirt',
                price: 3299,
                image: 'https://images.unsplash.com/photo-1525450824786-227cbef70703?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 4.2,
                category: 'party',
                stock: 20,
                sizes: ['M', 'L', 'XL']
            },
            {
                id: '6',
                name: 'Sports Black Shirt',
                price: 1999,
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
                rating: 4.7,
                category: 'sports',
                stock: 35,
                sizes: ['XS', 'S', 'M', 'L', 'XL']
            }
        ];
        
        container.innerHTML = allProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.stock < 10 ? '<span class="product-badge">Low Stock</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        ${generateRatingStars(product.rating)}
                    </div>
                    <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                    <p class="product-sizes"><small>Sizes: ${product.sizes.join(', ')}</small></p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
        
        updateProductsCount(allProducts.length);
    }, 1000);
}

function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter products
            productCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update count
            const visibleCount = document.querySelectorAll('.product-card[style="display: block"]').length;
            updateProductsCount(visibleCount);
        });
    });
}

function initProductSorting() {
    const sortSelect = document.getElementById('sortProducts');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const container = document.getElementById('allProducts');
        const productCards = Array.from(container.querySelectorAll('.product-card'));
        
        productCards.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            const nameA = a.querySelector('.product-title').textContent.toLowerCase();
            const nameB = b.querySelector('.product-title').textContent.toLowerCase();
            
            switch(this.value) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'name':
                    return nameA.localeCompare(nameB);
                case 'newest':
                    return 0; // In real app, sort by date
                case 'popular':
                    return 0; // In real app, sort by popularity
                default:
                    return 0;
            }
        });
        
        // Reorder products
        productCards.forEach(card => container.appendChild(card));
    });
}

function updateProductsCount(count) {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `${count} Products Found`;
    }
}

// ===== ABOUT PAGE =====
function initAboutPage() {
    // No special initialization needed for about page
    console.log('About page initialized');
}

// ===== CONTACT PAGE =====
function initContactPage() {
    initContactForm();
    initFAQAccordion();
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };
        
        // In real app, save to Firebase
        saveContactMessage(formData);
        
        // Show success message
        showToast('Thank you for your message! We will contact you soon.', 'success');
        
        // Reset form
        contactForm.reset();
    });
}

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ===== CART PAGE =====
function initCartPage() {
    loadCart();
    initCartActions();
    loadRecommendedProducts();
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    const container = document.getElementById('cartItems');
    const emptyMessage = document.getElementById('cartEmpty');
    const summary = document.getElementById('cartSummary');
    const itemCount = document.getElementById('itemCount');
    
    if (!container) return;
    
    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (summary) summary.style.display = 'none';
        if (itemCount) itemCount.textContent = '0 items';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (summary) summary.style.display = 'block';
    if (itemCount) itemCount.textContent = `${cart.length} ${cart.length === 1 ? 'item' : 'items'}`;
    
    // Clear existing items except empty message
    const existingItems = container.querySelector('.cart-items-list');
    if (existingItems) {
        existingItems.remove();
    }
    
    // Create items list
    const itemsList = document.createElement('div');
    itemsList.className = 'cart-items-list';
    
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-size">Size: ${item.size || 'M'}</p>
                <p class="cart-item-price">Rs. ${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity || 1}" min="1" onchange="updateCartItemInput(${index}, this.value)">
                <button class="quantity-btn plus" onclick="updateCartItemQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
            </div>
            <div class="cart-item-remove">
                <button class="remove-btn" onclick="removeCartItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        itemsList.appendChild(itemElement);
    });
    
    container.appendChild(itemsList);
    
    // Update cart summary
    updateCartSummary();
}

function initCartActions() {
    // Coupon code
    const applyCouponBtn = document.getElementById('applyCoupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            const couponCode = document.getElementById('couponCode').value;
            if (couponCode === 'LORZEN10') {
                showToast('Coupon applied! 10% discount added.', 'success');
            } else {
                showToast('Invalid coupon code', 'error');
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (cart.length === 0) {
                e.preventDefault();
                showToast('Your cart is empty', 'error');
            }
        });
    }
}

function updateCartItemQuantity(index, change) {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        
        localStorage.setItem('lorzenfit_cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function updateCartItemInput(index, value) {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    if (cart[index]) {
        const newQuantity = parseInt(value) || 1;
        cart[index].quantity = newQuantity < 1 ? 1 : newQuantity;
        
        localStorage.setItem('lorzenfit_cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function removeCartItem(index) {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    cart.splice(index, 1);
    localStorage.setItem('lorzenfit_cart', JSON.stringify(cart));
    
    loadCart();
    updateCartCount();
    showToast('Item removed from cart', 'success');
}

function updateCartSummary() {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
    });
    
    const shipping = 200;
    const tax = subtotal * 0.13; // 13% tax
    const total = subtotal + shipping + tax;
    
    // Update summary elements
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (shippingElement) shippingElement.textContent = `Rs. ${shipping.toLocaleString()}`;
    if (taxElement) taxElement.textContent = `Rs. ${tax.toLocaleString()}`;
    if (totalElement) totalElement.textContent = `Rs. ${total.toLocaleString()}`;
}

function loadRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    if (!container) return;
    
    // In real app, load from Firebase based on browsing history
    const recommended = [
        {
            id: '7',
            name: 'Denim Blue Shirt',
            price: 2699,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
        },
        {
            id: '8',
            name: 'Checkered Black Shirt',
            price: 2899,
            image: 'https://images.unsplash.com/photo-1525450824786-227cbef70703?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
        }
    ];
    
    container.innerHTML = recommended.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// ===== CHECKOUT PAGE =====
function initCheckoutPage() {
    loadCheckoutSummary();
    initPaymentMethods();
    initCheckoutForm();
}

function loadCheckoutSummary() {
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    const container = document.getElementById('orderItems');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateCheckoutTotals(0, 0, 0, 0);
        return;
    }
    
    let subtotal = 0;
    container.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <p>Size: ${item.size || 'M'}</p>
                <p>Quantity: ${item.quantity || 1}</p>
            </div>
            <div class="order-item-price">
                Rs. ${itemTotal.toLocaleString()}
            </div>
        `;
        container.appendChild(itemElement);
    });
    
    const shipping = 200;
    const tax = subtotal * 0.13;
    const total = subtotal + shipping + tax;
    
    updateCheckoutTotals(subtotal, shipping, tax, total);
}

function updateCheckoutTotals(subtotal, shipping, tax, total) {
    const elements = {
        'orderSubtotal': subtotal,
        'orderShipping': shipping,
        'orderTax': tax,
        'orderTotal': total
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `Rs. ${value.toLocaleString()}`;
        }
    }
}

function initPaymentMethods() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Show/hide appropriate forms
            const method = this.getAttribute('data-method');
            const easypaisaForm = document.getElementById('easypaisaInstructions');
            const cardForm = document.getElementById('cardPaymentForm');
            
            if (easypaisaForm) {
                easypaisaForm.style.display = method === 'easypaisa' ? 'block' : 'none';
            }
            
            if (cardForm) {
                cardForm.style.display = method === 'card' ? 'block' : 'none';
            }
        });
    });
}

function initCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate cart
        if (cart.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }
        
        // Get selected payment method
        const selectedPayment = document.querySelector('.payment-option.active').getAttribute('data-method');
        
        // Prepare order data
        const orderData = {
            orderId: 'LORZ' + Date.now(),
            customerName: document.getElementById('fullName').value,
            customerEmail: document.getElementById('email').value,
            customerPhone: document.getElementById('phone').value,
            shippingAddress: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            notes: document.getElementById('notes').value,
            paymentMethod: selectedPayment,
            items: cart,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        // Calculate totals
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += (item.price || 0) * (item.quantity || 1);
        });
        
        orderData.subtotal = subtotal;
        orderData.shipping = 200;
        orderData.tax = subtotal * 0.13;
        orderData.total = orderData.subtotal + orderData.shipping + orderData.tax;
        
        // Process payment based on method
        try {
            if (selectedPayment === 'easypaisa') {
                const paymentResult = await processEasyPaisaPayment(orderData);
                if (!paymentResult.success) {
                    throw new Error('EasyPaisa payment failed');
                }
                orderData.paymentStatus = 'initiated';
                orderData.transactionId = paymentResult.transactionId;
            } else if (selectedPayment === 'card') {
                orderData.paymentStatus = 'processing';
            } else {
                orderData.paymentStatus = 'pending';
            }
            
            // Save order
            await saveOrder(orderData);
            
            // Clear cart
            localStorage.removeItem('lorzenfit_cart');
            updateCartCount();
            
            // Show success message
            showToast('Order placed successfully!', 'success');
            
            // Redirect to success page
            setTimeout(() => {
                window.location.href = 'order-success.html?order=' + orderData.orderId;
            }, 2000);
            
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Error: ' + error.message, 'error');
        }
    });
}

// ===== ADMIN PAGE =====
function initAdminPage() {
    // Check admin access
    if (!checkAdminAccess()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize admin features
    initAdminSidebar();
    initAdminTabs();
    initAdminForms();
    loadAdminStats();
    loadAdminProducts();
    loadAdminOrders();
}

function checkAdminAccess() {
    // In real app, check Firebase authentication
    // For demo, check localStorage
    const adminToken = localStorage.getItem('lorzenfit_admin_token');
    return adminToken === 'admin_access_granted';
}

function initAdminSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const adminContent = document.getElementById('adminContent');
    
    if (sidebarToggle && adminSidebar && adminContent) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('collapsed');
            adminContent.classList.toggle('expanded');
        });
    }
}

function initAdminTabs() {
    const menuItems = document.querySelectorAll('.sidebar-menu a, .action-card[data-tab]');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get tab name
            const tabName = this.getAttribute('data-tab');
            if (!tabName) return;
            
            // Switch tab
            switchAdminTab(tabName);
            
            // Update active menu item
            if (this.closest('.sidebar-menu')) {
                document.querySelectorAll('.sidebar-menu a').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Update page title
        updateAdminPageTitle(tabName);
        
        // Load tab-specific data
        switch(tabName) {
            case 'dashboard':
                loadAdminStats();
                break;
            case 'products':
                loadAdminProducts();
                break;
            case 'orders':
                loadAdminOrders();
                break;
        }
    }
}

function updateAdminPageTitle(tabName) {
    const titleElement = document.getElementById('adminPageTitle');
    const subtitleElement = document.getElementById('adminPageSubtitle');
    
    if (!titleElement || !subtitleElement) return;
    
    const titles = {
        'dashboard': { main: 'Dashboard', sub: 'Welcome to Lorzenfit Admin Panel' },
        'products': { main: 'Manage Products', sub: 'View and manage your product catalog' },
        'add-product': { main: 'Add New Product', sub: 'Add shirts with front and back images' },
        'orders': { main: 'Orders', sub: 'View and manage customer orders' },
        'customers': { main: 'Customers', sub: 'Manage customer information' },
        'analytics': { main: 'Analytics', sub: 'View sales and website analytics' },
        'settings': { main: 'Settings', sub: 'Configure website settings' },
        'payment': { main: 'Payment Settings', sub: 'Configure payment gateways' }
    };
    
    const title = titles[tabName] || { main: 'Admin Panel', sub: 'Lorzenfit Administration' };
    titleElement.textContent = title.main;
    subtitleElement.textContent = title.sub;
}

function initAdminForms() {
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const productData = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                description: document.getElementById('productDescription').value,
                stock: parseInt(document.getElementById('productStock').value),
                colors: document.getElementById('productColors')?.value.split(',').map(c => c.trim()) || [],
                tags: document.getElementById('productTags')?.value.split(',').map(t => t.trim()) || [],
                seoTitle: document.getElementById('seoTitle')?.value || '',
                seoDescription: document.getElementById('seoDescription')?.value || '',
                slug: document.getElementById('productSlug')?.value || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Get sizes
            const sizeCheckboxes = document.querySelectorAll('input[name="size"]:checked');
            productData.sizes = Array.from(sizeCheckboxes).map(cb => cb.value);
            
            // Handle images
            const frontImage = document.getElementById('frontImage')?.files[0];
            const backImage = document.getElementById('backImage')?.files[0];
            
            if (!frontImage || !backImage) {
                showToast('Please upload both front and back images', 'error');
                return;
            }
            
            // Save product
            saveAdminProduct(productData, frontImage, backImage);
        });
    }
    
    // EasyPaisa configuration form
    const easypaisaForm = document.getElementById('easypaisaConfigForm');
    if (easypaisaForm) {
        easypaisaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const config = {
                merchantId: document.getElementById('easypaisaMerchantId').value,
                storeId: document.getElementById('easypaisaStoreId').value,
                apiKey: document.getElementById('easypaisaApiKey').value,
                secureKey: document.getElementById('easypaisaSecureKey').value,
                mode: document.querySelector('input[name="easypaisaMode"]:checked')?.value || 'sandbox',
                enabled: document.getElementById('easypaisaEnabled')?.checked || false,
                updatedAt: new Date().toISOString()
            };
            
            saveEasyPaisaConfig(config);
        });
        
        // Load saved config
        loadEasyPaisaConfig();
        
        // Test API button
        const testApiBtn = document.getElementById('testEasyPaisaApi');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', testEasyPaisaAPI);
        }
    }
    
    // Settings menu
    const settingsMenu = document.querySelectorAll('.settings-menu a');
    settingsMenu.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active menu item
            settingsMenu.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected panel
            const panelId = this.getAttribute('data-settings') + 'Settings';
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            const selectedPanel = document.getElementById(panelId);
            if (selectedPanel) {
                selectedPanel.classList.add('active');
            }
        });
    });
}

function loadAdminStats() {
    // Load products count
    const products = JSON.parse(localStorage.getItem('lorzenfit_products')) || [];
    document.getElementById('totalProducts').textContent = products.length;
    
    // Load orders count
    const orders = JSON.parse(localStorage.getItem('lorzenfit_orders')) || [];
    document.getElementById('totalOrders').textContent = orders.length;
    
    // Calculate revenue
    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = 'Rs. ' + revenue.toLocaleString();
    
    // Calculate customers (unique emails)
    const customers = new Set(orders.map(order => order.customerEmail)).size;
    document.getElementById('totalCustomers').textContent = customers;
    
    // Load recent orders for dashboard
    loadRecentOrdersTable();
}

function loadAdminProducts() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    const products = JSON.parse(localStorage.getItem('lorzenfit_products')) || [];
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-tshirt"></i>
                        <p>No products found</p>
                        <button class="btn btn-primary" data-tab="add-product">Add Your First Product</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><input type="checkbox" class="product-checkbox"></td>
            <td>
                <div class="product-cell">
                    <div class="product-image">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="product-info">
                        <strong>${product.name}</strong>
                        <small>ID: ${product.id || 'N/A'}</small>
                    </div>
                </div>
            </td>
            <td><span class="category-badge">${product.category || 'casual'}</span></td>
            <td><strong>Rs. ${(product.price || 0).toLocaleString()}</strong></td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="status-badge ${(product.stock || 0) > 0 ? 'in-stock' : 'out-stock'}">
                    ${(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Edit" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Delete" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon" title="View" onclick="viewProduct('${product.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadAdminOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;
    
    const orders = JSON.parse(localStorage.getItem('lorzenfit_orders')) || [];
    const recentOrders = orders.slice(0, 5); // Show 5 most recent
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.orderId || 'N/A'}</strong></td>
            <td>${order.customerName || 'Customer'}</td>
            <td>Rs. ${order.total ? order.total.toLocaleString() : '0'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function loadRecentOrdersTable() {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;
    
    const orders = JSON.parse(localStorage.getItem('lorzenfit_orders')) || [];
    const recentOrders = orders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.orderId || 'N/A'}</strong></td>
            <td>${order.customerName || 'Customer'}</td>
            <td>Rs. ${order.total ? order.total.toLocaleString() : '0'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// ===== UTILITY FUNCTIONS =====
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

function addToCart(productId) {
    // In real app, get product from Firebase
    // For demo, use sample product
    const sampleProduct = {
        id: productId,
        name: 'Sample Shirt ' + productId,
        price: 2499,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
        size: 'M'
    };
    
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        // Update quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        // Add new item
        sampleProduct.quantity = 1;
        cart.push(sampleProduct);
    }
    
    // Save to localStorage
    localStorage.setItem('lorzenfit_cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    showToast('Product added to cart!', 'success');
    
    // If on cart page, reload cart
    if (window.location.pathname.includes('cart.html')) {
        loadCart();
    }
}

function subscribeNewsletter(email) {
    // In real app, save to Firebase
    const subscriptions = JSON.parse(localStorage.getItem('lorzenfit_newsletter')) || [];
    subscriptions.push({
        email: email,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('lorzenfit_newsletter', JSON.stringify(subscriptions));
    showToast('Thank you for subscribing!', 'success');
}

function saveContactMessage(formData) {
    // In real app, save to Firebase
    const messages = JSON.parse(localStorage.getItem('lorzenfit_contact_messages')) || [];
    messages.push(formData);
    localStorage.setItem('lorzenfit_contact_messages', JSON.stringify(messages));
}

function saveOrder(orderData) {
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('lorzenfit_orders')) || [];
    orders.push(orderData);
    localStorage.setItem('lorzenfit_orders', JSON.stringify(orders));
    
    // In real app, save to Firebase
    // if (db && typeof db.collection === 'function') {
    //     await db.collection('orders').add(orderData);
    // }
    
    return Promise.resolve();
}

function processEasyPaisaPayment(orderData) {
    // In real app, integrate with EasyPaisa API
    // For demo, simulate payment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: 'EASYP' + Date.now(),
                message: 'Payment initiated successfully'
            });
        }, 1500);
    });
}

function saveAdminProduct(productData, frontImage, backImage) {
    // In real app, save to Firebase with image upload
    // For demo, save to localStorage
    
    productData.id = 'prod_' + Date.now();
    productData.images = {
        front: frontImage.name,
        back: backImage.name
    };
    
    const products = JSON.parse(localStorage.getItem('lorzenfit_products')) || [];
    products.push(productData);
    localStorage.setItem('lorzenfit_products', JSON.stringify(products));
    
    showToast('Product added successfully!', 'success');
    
    // Reset form
    document.getElementById('addProductForm').reset();
    
    // Clear image previews
    document.getElementById('frontImagePreview').innerHTML = '';
    document.getElementById('backImagePreview').innerHTML = '';
    
    // Reload products table
    loadAdminProducts();
    loadAdminStats();
}

function saveEasyPaisaConfig(config) {
    localStorage.setItem('lorzenfit_easypaisa_config', JSON.stringify(config));
    showToast('EasyPaisa settings saved!', 'success');
}

function loadEasyPaisaConfig() {
    const savedConfig = localStorage.getItem('lorzenfit_easypaisa_config');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        document.getElementById('easypaisaMerchantId').value = config.merchantId || '';
        document.getElementById('easypaisaStoreId').value = config.storeId || '';
        document.getElementById('easypaisaApiKey').value = config.apiKey || '';
        document.getElementById('easypaisaSecureKey').value = config.secureKey || '';
        
        if (config.mode) {
            const radio = document.querySelector(`input[name="easypaisaMode"][value="${config.mode}"]`);
            if (radio) radio.checked = true;
        }
        
        if (document.getElementById('easypaisaEnabled')) {
            document.getElementById('easypaisaEnabled').checked = config.enabled !== false;
        }
    }
}

function testEasyPaisaAPI() {
    const testResult = document.getElementById('apiTestResult');
    const merchantId = document.getElementById('easypaisaMerchantId').value;
    
    testResult.innerHTML = '<div class="loading">Testing connection...</div>';
    
    setTimeout(() => {
        if (merchantId) {
            testResult.innerHTML = '<div class="success"><i class="fas fa-check-circle"></i> Connection successful! EasyPaisa API is ready.</div>';
        } else {
            testResult.innerHTML = '<div class="error"><i class="fas fa-times-circle"></i> Please enter Merchant ID to test connection.</div>';
        }
    }, 1000);
}

function editProduct(productId) {
    showToast(`Editing product ${productId}`, 'info');
    // In real app, load product data into form
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('lorzenfit_products')) || [];
        const updatedProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('lorzenfit_products', JSON.stringify(updatedProducts));
        
        showToast('Product deleted successfully', 'success');
        loadAdminProducts();
        loadAdminStats();
    }
}

function viewProduct(productId) {
    showToast(`Viewing product ${productId}`, 'info');
    // In real app, show product details
}

function checkAuth() {
    // In real app, check Firebase auth
    // For demo, check localStorage
    const adminToken = localStorage.getItem('lorzenfit_admin_token');
    if (adminToken === 'admin_access_granted') {
        isAdmin = true;
    }
}

function loadInitialData() {
    // Load products
    products = JSON.parse(localStorage.getItem('lorzenfit_products')) || [];
    
    // Load cart
    cart = JSON.parse(localStorage.getItem('lorzenfit_cart')) || [];
    
    // Initialize admin access (for demo)
    if (window.location.pathname.includes('admin.html')) {
        // For demo, auto-login
        localStorage.setItem('lorzenfit_admin_token', 'admin_access_granted');
    }
}

// ===== GLOBAL FUNCTIONS (for inline onclick) =====
window.updateCartItemQuantity = updateCartItemQuantity;
window.updateCartItemInput = updateCartItemInput;
window.removeCartItem = removeCartItem;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewProduct = viewProduct;

// Export for use in HTML
window.showToast = showToast;
window.addToCart = addToCart;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFeatures);
} else {
    initCommonFeatures();
}
