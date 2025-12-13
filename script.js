// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    updateCartCount();
    
    // WhatsApp button already in HTML
    
    // Load products if on products page
    if (document.getElementById('productsGrid')) {
        loadProducts();
    }
    
    // Load featured products if on home page
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Cart functionality
    if (document.getElementById('cartItems')) {
        loadCartItems();
    }
    
    // Product detail page
    if (document.getElementById('addToCart')) {
        setupProductDetail();
    }
    
    // Checkout button
    if (document.getElementById('checkoutBtn')) {
        document.getElementById('checkoutBtn').addEventListener('click', checkout);
    }
    
    // EasyPaisa button
    if (document.getElementById('easypaisaBtn')) {
        document.getElementById('easypaisaBtn').addEventListener('click', easypaisaCheckout);
    }
});

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cartCount').forEach(el => {
        el.textContent = totalItems;
    });
}

// Load products from Firebase
async function loadProducts() {
    try {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        
        const snapshot = await db.collection('products').get();
        
        if (snapshot.empty) {
            productsGrid.innerHTML = '<p>No products found</p>';
            return;
        }
        
        productsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            const productCard = `
                <div class="product-card">
                    <img src="${product.image || 'assets/default-shirt.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">Rs. ${product.price}</p>
                    <button class="btn add-to-cart" data-id="${doc.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                        Add to Cart
                    </button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
        
        // Add event listeners to Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = parseInt(this.getAttribute('data-price'));
                const image = this.getAttribute('data-image');
                addToCart(id, name, price, image);
            });
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products</p>';
    }
}

// Add product to cart
function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('solowere_cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success message with animation
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.innerHTML = `<i class="fas fa-check"></i> ${name} added to cart!`;
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: #4ECDC4;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Load cart items on cart page
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.innerHTML = '';
        updateCartSummary([]);
        return;
    }
    
    emptyCart.style.display = 'none';
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || 'assets/default-shirt.jpg'}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="price">Rs. ${item.price}</p>
                <div class="quantity-controls">
                    <button class="qty-btn decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn increase" data-index="${index}">+</button>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    updateCartSummary(cart);
    
    // Add event listeners
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            updateQuantity(parseInt(this.getAttribute('data-index')), -1);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            updateQuantity(parseInt(this.getAttribute('data-index')), 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFromCart(parseInt(this.getAttribute('data-index')));
        });
    });
}

// Update quantity
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('solowere_cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('solowere_cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Update cart summary
function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 200 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `Rs. ${subtotal}`;
    document.getElementById('shipping').textContent = `Rs. ${shipping}`;
    document.getElementById('total').textContent = `Rs. ${total}`;
}

// Checkout function
function checkout() {
    const cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Save order to Firebase
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 200,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // In real implementation, you would save to Firebase
    // db.collection('orders').add(orderData);
    
    // For now, just show alert
    alert('Order placed successfully! We will contact you soon.');
    localStorage.removeItem('solowere_cart');
    updateCartCount();
    window.location.href = 'index.html';
}

// EasyPaisa checkout
function easypaisaCheckout() {
    const cart = JSON.parse(localStorage.getItem('solowere_cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 200;
    
    // EasyPaisa integration would go here
    // This is just a demo
    alert(`Redirecting to EasyPaisa payment for Rs. ${total}`);
    
    // In real implementation:
    // 1. Create order in your backend
    // 2. Generate EasyPaisa payment request
    // 3. Redirect to EasyPaisa payment page
}

// Load featured products
async function loadFeaturedProducts() {
    try {
        const snapshot = await db.collection('products').limit(4).get();
        const featuredDiv = document.getElementById('featuredProducts');
        
        if (snapshot.empty) {
            featuredDiv.innerHTML = '<p>No products available</p>';
            return;
        }
        
        featuredDiv.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            const productCard = `
                <div class="product-card">
                    <img src="${product.image || 'assets/default-shirt.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">Rs. ${product.price}</p>
                    <button class="btn add-to-cart" data-id="${doc.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                        Add to Cart
                    </button>
                </div>
            `;
            featuredDiv.innerHTML += productCard;
        });
        
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Setup product detail page
function setupProductDetail() {
    // This would load product details from URL parameters
    // For demo, just setup the buttons
    
    document.getElementById('decreaseQty').addEventListener('click', function() {
        let qty = parseInt(document.getElementById('quantity').textContent);
        if (qty > 1) {
            document.getElementById('quantity').textContent = qty - 1;
        }
    });
    
    document.getElementById('increaseQty').addEventListener('click', function() {
        let qty = parseInt(document.getElementById('quantity').textContent);
        document.getElementById('quantity').textContent = qty + 1;
    });
    
    document.getElementById('addToCart').addEventListener('click', function() {
        // Get product details from page
        const name = document.getElementById('productTitle').textContent;
        const price = parseInt(document.getElementById('productPrice').textContent.replace('Rs. ', ''));
        const qty = parseInt(document.getElementById('quantity').textContent);
        
        // For demo - using random ID
        addToCart('demo-' + Date.now(), name, price, 'assets/default-shirt.jpg');
    });
}
