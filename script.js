// ========== GLOBAL VARIABLES ==========
let cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];
let products = [];
let currentUser = null;

// ========== DOM CONTENT LOADED ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initCart();
    initProductFilters();
    initCheckout();
    initForms();
    initAnimations();
    initBackToTop();
    
    // Load products if on products page
    if (document.querySelector('.products-page')) {
        loadProducts();
    }
    
    // Load featured products if on home page
    if (document.querySelector('.featured-products')) {
        loadFeaturedProducts();
    }
    
    // Update cart count
    updateCartCount();
    
    // Check admin login
    checkAdminLogin();
});

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const userActions = document.querySelector('.user-actions');
    
    if (toggle) {
        toggle.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            userActions.style.display = userActions.style.display === 'flex' ? 'none' : 'flex';
            
            // Animate hamburger to X
            this.classList.toggle('active');
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                navMenu.style.display = 'flex';
                userActions.style.display = 'flex';
                toggle.classList.remove('active');
            } else {
                navMenu.style.display = 'none';
                userActions.style.display = 'none';
            }
        });
    }
}

// ========== CART FUNCTIONS ==========
function initCart() {
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];
    
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-to-cart') || 
            e.target.closest('.btn-add-to-cart')) {
            const button = e.target.classList.contains('btn-add-to-cart') ? 
                          e.target : e.target.closest('.btn-add-to-cart');
            const productId = button.dataset.id;
            addToCart(productId);
        }
        
        // Remove from cart
        if (e.target.classList.contains('btn-remove-item') || 
            e.target.closest('.btn-remove-item')) {
            const button = e.target.classList.contains('btn-remove-item') ? 
                          e.target : e.target.closest('.btn-remove-item');
            const productId = button.dataset.id;
            removeFromCart(productId);
        }
        
        // Clear cart
        if (e.target.classList.contains('btn-clear-cart')) {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        }
    });
    
    // Quantity changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);
            updateQuantity(productId, newQuantity);
        }
    });
    
    // Quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn') || 
            e.target.closest('.quantity-btn')) {
            const button = e.target.classList.contains('quantity-btn') ? 
                          e.target : e.target.closest('.quantity-btn');
            const productId = button.dataset.id;
            const isIncrease = button.classList.contains('increase');
            
            // Find current quantity
            const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
            let currentQuantity = parseInt(input.value);
            
            if (isIncrease) {
                currentQuantity++;
            } else {
                currentQuantity = Math.max(1, currentQuantity - 1);
            }
            
            input.value = currentQuantity;
            updateQuantity(productId, currentQuantity);
        }
    });
}

function addToCart(productId) {
    // Find product
    const product = getProductById(productId);
    if (!product) return;
    
    // Check if already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice || product.price,
            image: product.image,
            quantity: 1,
            size: product.size || 'M',
            color: product.color || 'Black'
        });
    }
    
    // Save to localStorage
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    showNotification('Product added to cart!', 'success');
    
    // Update cart page if open
    if (document.querySelector('.cart-section')) {
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Product removed from cart', 'warning');
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('soloWearCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Cart cleared', 'info');
}

function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    countElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Update cart item count in header
    const cartItemCount = document.getElementById('cartItemCount');
    if (cartItemCount) {
        cartItemCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('totalAmount');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some amazing t-shirts to your cart!</p>
                <a href="products.html" class="btn-primary">Continue Shopping</a>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = 'Rs. 0';
        if (totalElement) totalElement.textContent = 'Rs. 0';
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    
    cartItemsContainer.innerHTML = cart.map(item => {
        const price = item.salePrice || item.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size} | Color: ${item.color}</p>
                    </div>
                </div>
                <div class="cart-item-price">Rs. ${price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" data-id="${item.id}" 
                               value="${item.quantity}" min="1">
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-total">Rs. ${itemTotal.toLocaleString()}</div>
                <div class="cart-item-remove">
                    <button class="btn-remove-item" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Update totals
    const shipping = 200;
    const total = subtotal + shipping;
    
    if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (totalElement) totalElement.textContent = `Rs. ${total.toLocaleString()}`;
    
    // Update checkout page totals too
    updateCheckoutTotals(subtotal, shipping, total);
}

// ========== PRODUCT FUNCTIONS ==========
function initProductFilters() {
    // Price slider
    const priceSlider = document.getElementById('priceSlider');
    const selectedPrice = document.getElementById('selectedPrice');
    
    if (priceSlider && selectedPrice) {
        priceSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            selectedPrice.textContent = `Rs. ${value.toLocaleString()}`;
            filterProducts();
        });
    }
    
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    // Size buttons
    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            filterProducts();
        });
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            filterProducts();
        });
    });
    
    // Apply filters button
    const applyBtn = document.querySelector('.btn-apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', filterProducts);
    }
    
    // Clear filters button
    const clearBtn = document.querySelector('.btn-clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
    
    // Sort options
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }
}

function loadProducts() {
    // This should fetch from your backend API
    // For demo, we'll use sample data
    products = [
        {
            id: 1,
            name: "Premium Cotton T-Shirt",
            description: "100% premium cotton, comfortable and durable",
            price: 1999,
            salePrice: 1499,
            image: "images/products/tshirt1.jpg",
            category: "men",
            subcategories: ["printed"],
            sizes: ["S", "M", "L", "XL"],
            colors: ["black", "white", "blue"],
            stock: 50,
            rating: 4.5,
            reviews: 128
        },
        // Add more products...
    ];
    
    displayProducts(products);
}

function displayProducts(productsToShow) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-badge">New</div>
                <div class="product-actions">
                    <button class="quick-view" data-id="${product.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="add-wishlist" data-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">Rs. ${product.salePrice.toLocaleString()}</span>
                    <span class="original-price">Rs. ${product.price.toLocaleString()}</span>
                    <span class="discount">-${Math.round((1 - product.salePrice/product.price) * 100)}%</span>
                </div>
                <div class="product-rating">
                    ${getStarRating(product.rating)}
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    let filtered = [...products];
    
    // Filter by price
    const maxPrice = parseInt(document.getElementById('priceSlider')?.value) || 10000;
    filtered = filtered.filter(p => p.salePrice <= maxPrice);
    
    // Filter by category
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                                   .map(cb => cb.value);
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    
    // Filter by size
    const selectedSizes = Array.from(document.querySelectorAll('.size-btn.active'))
                               .map(btn => btn.dataset.size);
    if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => 
            p.sizes.some(size => selectedSizes.includes(size))
        );
    }
    
    // Filter by color
    const selectedColors = Array.from(document.querySelectorAll('.color-btn.active'))
                                .map(btn => btn.dataset.color);
    if (selectedColors.length > 0) {
        filtered = filtered.filter(p => 
            p.colors.some(color => selectedColors.includes(color))
        );
    }
    
    displayProducts(filtered);
}

function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.salePrice - b.salePrice);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.salePrice - a.salePrice);
            break;
        case 'newest':
            // Assuming products have a date property
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'popular':
            sorted.sort((a, b) => b.reviews - a.reviews);
            break;
    }
    
    displayProducts(sorted);
}

function clearFilters() {
    // Reset all filters
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('priceSlider').value = 5000;
    document.getElementById('selectedPrice').textContent = 'Rs. 5,000';
    
    filterProducts();
}

function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ========== CHECKOUT FUNCTIONS ==========
function initCheckout() {
    // Payment method toggle
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const method = this.value;
            
            // Hide all payment details
            document.querySelectorAll('.easypaisa-details, .card-details').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show selected payment details
            if (method === 'easypaisa') {
                document.getElementById('easypaisaDetails').style.display = 'block';
            } else if (method === 'card') {
                document.getElementById('cardDetails').style.display = 'block';
            }
        });
    });
    
    // Form navigation
    const nextToPayment = document.getElementById('nextToPayment');
    const backToShipping = document.getElementById('backToShipping');
    
    if (nextToPayment) {
        nextToPayment.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate shipping form
            const shippingForm = document.getElementById('shippingForm');
            if (!shippingForm.checkValidity()) {
                shippingForm.reportValidity();
                return;
            }
            
            // Switch to payment form
            shippingForm.classList.remove('active');
            document.getElementById('paymentForm').classList.add('active');
            
            // Update steps
            updateCheckoutSteps(2);
        });
    }
    
    if (backToShipping) {
        backToShipping.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Switch back to shipping form
            document.getElementById('paymentForm').classList.remove('active');
            document.getElementById('shippingForm').classList.add('active');
            
            // Update steps
            updateCheckoutSteps(1);
        });
    }
    
    // Place order
    const placeOrderBtn = document.getElementById('placeOrder');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate payment form
            const paymentForm = document.getElementById('paymentForm');
            if (!paymentForm.checkValidity()) {
                paymentForm.reportValidity();
                return;
            }
            
            // Process order
            processOrder();
        });
    }
}

function updateCheckoutSteps(step) {
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index < step) {
            el.classList.add('active');
        }
    });
}

function updateCheckoutTotals(subtotal, shipping, total) {
    // Update checkout page totals
    document.getElementById('checkoutSubtotal')?.textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('checkoutShipping')?.textContent = `Rs. ${shipping.toLocaleString()}`;
    document.getElementById('checkoutTotal')?.textContent = `Rs. ${total.toLocaleString()}`;
    
    // Update order items
    const orderItems = document.getElementById('orderItems');
    if (orderItems) {
        orderItems.innerHTML = cart.map(item => {
            const price = item.salePrice || item.price;
            const itemTotal = price * item.quantity;
            
            return `
                <div class="order-item">
                    <div class="order-item-info">
                        <div class="order-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-item-details">
                            <h4>${item.name}</h4>
                            <p>Qty: ${item.quantity} × Rs. ${price}</p>
                        </div>
                    </div>
                    <div class="order-item-price">Rs. ${itemTotal.toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }
}

function processOrder() {
    // Get form data
    const orderData = {
        customer: {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value
        },
        shipping: document.querySelector('input[name="shipping"]:checked').value,
        payment: document.querySelector('input[name="payment"]:checked').value,
        items: cart,
        subtotal: calculateSubtotal(),
        shipping: 200,
        total: calculateSubtotal() + 200,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // If EasyPaisa, add transaction details
    if (orderData.payment === 'easypaisa') {
        orderData.easypaisa = {
            transactionId: document.getElementById('transactionId').value,
            screenshot: document.getElementById('paymentScreenshot').files[0]
        };
    }
    
    // Send to backend (AJAX request)
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear cart
            clearCart();
            
            // Show success message
            showNotification('Order placed successfully!', 'success');
            
            // Redirect to confirmation page
            window.location.href = `order-confirmation.html?order=${data.orderId}`;
        } else {
            showNotification('Error placing order. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
    });
}

function calculateSubtotal() {
    return cart.reduce((sum, item) => {
        const price = item.salePrice || item.price;
        return sum + (price * item.quantity);
    }, 0);
}

// ========== FORM FUNCTIONS ==========
function initForms() {
    // Form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                highlightInvalidFields(this);
            }
        });
    });
    
    // Real-time validation
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function highlightInvalidFields(form) {
    form.querySelectorAll(':invalid').forEach(field => {
        field.classList.add('invalid');
    });
}

function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('invalid');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
    }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// ========== ANIMATIONS ==========
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements to animate
    document.querySelectorAll('.feature, .category-card, .product-card').forEach(el => {
        observer.observe(el);
    });
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const button = document.querySelector('.back-to-top');
    
    if (button) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        });
        
        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ========== ADMIN FUNCTIONS ==========
function checkAdminLogin() {
    if (window.location.pathname.includes('admin/')) {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (!isLoggedIn && !window.location.pathname.includes('admin/index.html')) {
            window.location.href = 'admin/index.html';
        }
    }
}

// ========== HELPER FUNCTIONS ==========
function getProductById(id) {
    // This should fetch from your backend
    // For demo, return dummy product
    return {
        id: id,
        name: "Premium T-Shirt",
        price: 1999,
        salePrice: 1499,
        image: "images/products/tshirt1.jpg"
    };
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(price);
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    const searchInput = document.querySelector('.search-container input');
    const searchSuggestions = document.querySelector('.search-suggestions');
    
    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            if (query.length < 2) {
                searchSuggestions.innerHTML = '';
                searchSuggestions.classList.remove('show');
                return;
            }
            
            // Fetch search suggestions
            fetchSearchSuggestions(query).then(suggestions => {
                if (suggestions.length > 0) {
                    searchSuggestions.innerHTML = suggestions.map(item => `
                        <a href="product-detail.html?id=${item.id}">
                            <img src="${item.image}" alt="${item.name}">
                            <span>${item.name}</span>
                            <span class="price">${formatPrice(item.price)}</span>
                        </a>
                    `).join('');
                    searchSuggestions.classList.add('show');
                } else {
                    searchSuggestions.innerHTML = '<div class="no-results">No results found</div>';
                    searchSuggestions.classList.add('show');
                }
            });
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('show');
            }
        });
    }
}

async function fetchSearchSuggestions(query) {
    // This should be an API call
    return [
        {
            id: 1,
            name: "Premium Cotton T-Shirt",
            image: "images/products/tshirt1.jpg",
            price: 1499
        }
    ];
}

// ========== WISHLIST FUNCTIONS ==========
function initWishlist() {
    let wishlist = JSON.parse(localStorage.getItem('soloWearWishlist')) || [];
    
    // Toggle wishlist
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-wishlist') || 
            e.target.closest('.add-wishlist')) {
            const button = e.target.classList.contains('add-wishlist') ? 
                          e.target : e.target.closest('.add-wishlist');
            const productId = button.dataset.id;
            toggleWishlist(productId, button);
        }
    });
}

function toggleWishlist(productId, button) {
    let wishlist = JSON.parse(localStorage.getItem('soloWearWishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        // Remove from wishlist
        wishlist.splice(index, 1);
        button.innerHTML = '<i class="far fa-heart"></i>';
        showNotification('Removed from wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push(productId);
        button.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('soloWearWishlist', JSON.stringify(wishlist));
}

// ========== LAZY LOADING ==========
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ========== INITIALIZE EVERYTHING ==========
function initializeApp() {
    initMobileMenu();
    initCart();
    initSearch();
    initWishlist();
    initProductFilters();
    initCheckout();
    initForms();
    initAnimations();
    initBackToTop();
    initLazyLoading();
    
    // Load appropriate content based on page
    if (document.querySelector('.products-page')) {
        loadProducts();
    }
    
    if (document.querySelector('.featured-products')) {
        loadFeaturedProducts();
    }
    
    updateCartCount();
    checkAdminLogin();
}

// Start the application
initializeApp();
