// Admin Authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    auth.onAuthStateChanged(user => {
        if (!user && window.location.pathname.includes('admin')) {
            // Redirect to login if not on login page
            if (!window.location.pathname.includes('login')) {
                window.location.href = 'admin-login.html';
            }
        }
    });
    
    // Logout button
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    
    // Load admin dashboard data
    if (document.getElementById('totalProducts')) {
        loadDashboardData();
    }
});

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'admin-login.html';
    });
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get total products
        const productsSnapshot = await db.collection('products').get();
        document.getElementById('totalProducts').textContent = productsSnapshot.size;
        
        // Get total orders
        const ordersSnapshot = await db.collection('orders').get();
        document.getElementById('totalOrders').textContent = ordersSnapshot.size;
        
        // Calculate revenue
        let revenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            revenue += order.total || 0;
        });
        document.getElementById('totalRevenue').textContent = `Rs. ${revenue}`;
        
        // Load recent orders
        const recentOrders = await db.collection('orders')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        const ordersContainer = document.getElementById('recentOrders');
        if (recentOrders.empty) {
            ordersContainer.innerHTML = '<p>No orders yet</p>';
            return;
        }
        
        let ordersHTML = '<div class="orders-list">';
        recentOrders.forEach(doc => {
            const order = doc.data();
            ordersHTML += `
                <div class="order-item">
                    <div>
                        <strong>Order #${doc.id.substring(0, 8)}</strong>
                        <p>${new Date(order.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span class="status ${order.status}">${order.status}</span>
                        <p>Rs. ${order.total}</p>
                    </div>
                </div>
            `;
        });
        ordersHTML += '</div>';
        ordersContainer.innerHTML = ordersHTML;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Add these styles for admin
const adminStyles = `
    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: white;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .status {
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .status.pending { background: #ffeaa7; color: #e17055; }
    .status.completed { background: #55efc4; color: #00b894; }
    .status.cancelled { background: #fab1a0; color: #d63031; }
    
    .orders-list {
        margin-top: 20px;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);
