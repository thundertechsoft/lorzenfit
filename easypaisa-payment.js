// ============================================
// LORZENFIT WEBSITE - EASYPAISA PAYMENT INTEGRATION
// ============================================

class EasyPaisaPayment {
    constructor(config = {}) {
        // Default configuration
        this.config = {
            merchantId: '',
            apiKey: '',
            storeId: '',
            secureKey: '',
            isSandbox: true, // Set to false for production
            currency: 'PKR',
            ...config
        };
        
        // API endpoints
        this.endpoints = {
            sandbox: {
                initiate: 'https://easypay.easypaisa.com.pk/easypay/Index.jsf',
                verify: 'https://easypay.easypaisa.com.pk/easypay/Confirm.jsf',
                refund: 'https://easypay.easypaisa.com.pk/easypay/Refund.jsf'
            },
            production: {
                initiate: 'https://easypay.easypaisa.com.pk/easypay/Index.jsf',
                verify: 'https://easypay.easypaisa.com.pk/easypay/Confirm.jsf',
                refund: 'https://easypay.easypaisa.com.pk/easypay/Refund.jsf'
            }
        };
        
        // Payment status codes
        this.statusCodes = {
            '00': 'Transaction Successful',
            '01': 'Transaction Failed',
            '02': 'Transaction Pending',
            '03': 'Transaction Cancelled',
            '04': 'Transaction Timeout',
            '05': 'Duplicate Transaction',
            '99': 'Unknown Error'
        };
        
        this.initialize();
    }
    
    initialize() {
        console.log('EasyPaisa Payment initialized');
        this.loadConfig();
    }
    
    // Load configuration from localStorage
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('lorzenfit_easypaisa_config');
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
                console.log('EasyPaisa config loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading EasyPaisa config:', error);
        }
        return this.config;
    }
    
    // Save configuration to localStorage
    saveConfig() {
        try {
            localStorage.setItem('lorzenfit_easypaisa_config', JSON.stringify(this.config));
            console.log('EasyPaisa config saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving EasyPaisa config:', error);
            return false;
        }
    }
    
    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
        return this.config;
    }
    
    // Generate transaction hash (for security)
    generateHash(data) {
        // Note: In production, hashing should be done on the server side
        // This is a simplified version for demo purposes
        
        const {
            merchantId,
            storeId,
            amount,
            orderId,
            transactionDateTime
        } = data;
        
        const hashString = `${merchantId}${storeId}${orderId}${amount}${transactionDateTime}${this.config.secureKey}`;
        
        // Simple hash function (in production, use proper crypto)
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            const char = hashString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(16).substring(0, 32);
    }
    
    // Generate unique order ID
    generateOrderId(prefix = 'LORZ') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}${timestamp}${random}`;
    }
    
    // Generate transaction date time
    generateTransactionDateTime() {
        const now = new Date();
        return now.toISOString().replace(/[-:]/g, '').split('.')[0];
    }
    
    // Validate payment configuration
    validateConfig() {
        const errors = [];
        
        if (!this.config.merchantId) {
            errors.push('Merchant ID is required');
        }
        
        if (!this.config.apiKey) {
            errors.push('API Key is required');
        }
        
        if (!this.config.storeId) {
            console.warn('Store ID is missing (optional)');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    // Initiate payment
    async initiatePayment(paymentData) {
        const validation = this.validateConfig();
        if (!validation.isValid) {
            throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
        }
        
        const {
            amount,
            description = 'Lorzenfit Purchase',
            customerName = 'Customer',
            customerEmail = '',
            customerMobile = '',
            orderId = this.generateOrderId()
        } = paymentData;
        
        // Prepare payment request
        const transactionDateTime = this.generateTransactionDateTime();
        
        const paymentRequest = {
            merchantId: this.config.merchantId,
            storeId: this.config.storeId || '',
            amount: amount.toString(),
            orderId: orderId,
            transactionDateTime: transactionDateTime,
            transactionRefNum: `TXN${Date.now()}`,
            bearer: customerName,
            description: description,
            postBackURL: `${window.location.origin}/payment-callback.html`,
            mobileNo: customerMobile,
            emailAddress: customerEmail,
            hash: this.generateHash({
                merchantId: this.config.merchantId,
                storeId: this.config.storeId || '',
                amount: amount,
                orderId: orderId,
                transactionDateTime: transactionDateTime
            })
        };
        
        console.log('Payment request:', paymentRequest);
        
        try {
            // In production, this would be a real API call to EasyPaisa
            // For demo, we simulate the response
            
            const response = await this.simulatePaymentRequest(paymentRequest);
            
            if (response.success) {
                // Save payment session for verification
                this.savePaymentSession({
                    orderId,
                    amount,
                    transactionRefNum: paymentRequest.transactionRefNum,
                    timestamp: Date.now(),
                    status: 'initiated'
                });
                
                return {
                    success: true,
                    paymentUrl: response.paymentUrl,
                    transactionId: paymentRequest.transactionRefNum,
                    orderId: orderId,
                    message: 'Payment initiated successfully'
                };
            } else {
                throw new Error(response.message || 'Payment initiation failed');
            }
        } catch (error) {
            console.error('EasyPaisa payment error:', error);
            throw error;
        }
    }
    
    // Simulate payment request (replace with actual API call)
    simulatePaymentRequest(paymentRequest) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if in sandbox mode
                if (this.config.isSandbox) {
                    // Sandbox response
                    resolve({
                        success: true,
                        paymentUrl: '#', // In production, this would be actual EasyPaisa payment URL
                        message: 'Sandbox payment initiated (DEMO MODE)',
                        demoNote: 'This is a simulation. In production, user would be redirected to EasyPaisa.'
                    });
                } else {
                    // Production - would make actual API call
                    // Example using fetch:
                    /*
                    const endpoint = this.endpoints.production.initiate;
                    
                    fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.config.apiKey}`
                        },
                        body: JSON.stringify(paymentRequest)
                    })
                    .then(response => response.json())
                    .then(data => resolve(data))
                    .catch(error => reject(error));
                    */
                    
                    // For demo, simulate success
                    resolve({
                        success: true,
                        paymentUrl: '#',
                        message: 'Payment initiated successfully'
                    });
                }
            }, 1000);
        });
    }
    
    // Verify payment status
    async verifyPayment(transactionId) {
        const validation = this.validateConfig();
        if (!validation.isValid) {
            throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
        }
        
        try {
            const verifyRequest = {
                merchantId: this.config.merchantId,
                transactionRefNum: transactionId,
                hash: this.generateHash({
                    merchantId: this.config.merchantId,
                    transactionRefNum: transactionId
                })
            };
            
            // In production, verify with EasyPaisa API
            const response = await this.simulateVerification(verifyRequest);
            
            return response;
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }
    
    // Simulate verification (replace with actual API call)
    simulateVerification(verifyRequest) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate different verification responses
                const statuses = ['00', '01', '02'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                resolve({
                    success: randomStatus === '00',
                    transactionId: verifyRequest.transactionRefNum,
                    statusCode: randomStatus,
                    statusMessage: this.statusCodes[randomStatus],
                    amount: '1000.00', // Example amount
                    transactionDate: new Date().toISOString(),
                    customerName: 'Demo Customer',
                    customerMobile: '03001234567'
                });
            }, 800);
        });
    }
    
    // Process refund
    async processRefund(transactionId, amount, reason = 'Customer request') {
        const validation = this.validateConfig();
        if (!validation.isValid) {
            throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
        }
        
        try {
            const refundRequest = {
                merchantId: this.config.merchantId,
                transactionRefNum: transactionId,
                refundAmount: amount.toString(),
                refundReason: reason,
                hash: this.generateHash({
                    merchantId: this.config.merchantId,
                    transactionRefNum: transactionId,
                    refundAmount: amount
                })
            };
            
            // In production, call EasyPaisa refund API
            const response = await this.simulateRefund(refundRequest);
            
            return response;
        } catch (error) {
            console.error('Refund processing error:', error);
            throw error;
        }
    }
    
    // Simulate refund (replace with actual API call)
    simulateRefund(refundRequest) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: refundRequest.transactionRefNum,
                    refundId: 'REF' + Date.now(),
                    refundAmount: refundRequest.refundAmount,
                    status: 'processed',
                    timestamp: new Date().toISOString(),
                    message: 'Refund processed successfully (DEMO)'
                });
            }, 1000);
        });
    }
    
    // Save payment session to localStorage
    savePaymentSession(paymentData) {
        try {
            const sessions = JSON.parse(localStorage.getItem('easypaisa_sessions')) || {};
            sessions[paymentData.orderId] = {
                ...paymentData,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('easypaisa_sessions', JSON.stringify(sessions));
            return true;
        } catch (error) {
            console.error('Error saving payment session:', error);
            return false;
        }
    }
    
    // Get payment session from localStorage
    getPaymentSession(orderId) {
        try {
            const sessions = JSON.parse(localStorage.getItem('easypaisa_sessions')) || {};
            return sessions[orderId] || null;
        } catch (error) {
            console.error('Error getting payment session:', error);
            return null;
        }
    }
    
    // Get all payment sessions
    getAllPaymentSessions() {
        try {
            return JSON.parse(localStorage.getItem('easypaisa_sessions')) || {};
        } catch (error) {
            console.error('Error getting payment sessions:', error);
            return {};
        }
    }
    
    // Clear payment sessions
    clearPaymentSessions() {
        try {
            localStorage.removeItem('easypaisa_sessions');
            return true;
        } catch (error) {
            console.error('Error clearing payment sessions:', error);
            return false;
        }
    }
    
    // Test API connection
    async testConnection() {
        const validation = this.validateConfig();
        if (!validation.isValid) {
            return {
                success: false,
                message: `Configuration incomplete: ${validation.errors.join(', ')}`,
                environment: this.config.isSandbox ? 'Sandbox' : 'Production'
            };
        }
        
        try {
            // Simulate API test
            const testData = {
                merchantId: this.config.merchantId,
                test: true,
                timestamp: Date.now()
            };
            
            const response = await this.simulateTestRequest(testData);
            
            return {
                success: true,
                message: 'EasyPaisa API connection successful',
                environment: this.config.isSandbox ? 'Sandbox (Testing)' : 'Production (Live)',
                merchantId: this.config.merchantId,
                status: 'ACTIVE'
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
                environment: this.config.isSandbox ? 'Sandbox' : 'Production'
            };
        }
    }
    
    // Simulate test request
    simulateTestRequest(testData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.config.merchantId || !this.config.apiKey) {
                    reject(new Error('Missing Merchant ID or API Key'));
                } else {
                    resolve({
                        success: true,
                        merchantId: testData.merchantId,
                        status: 'ACTIVE',
                        timestamp: new Date().toISOString()
                    });
                }
            }, 500);
        });
    }
    
    // Format amount for display
    formatAmount(amount) {
        return `Rs. ${parseFloat(amount).toLocaleString('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    
    // Get payment status description
    getStatusDescription(statusCode) {
        return this.statusCodes[statusCode] || 'Unknown Status';
    }
    
    // Generate payment receipt
    generateReceipt(paymentData) {
        const receipt = {
            receiptId: 'RCPT' + Date.now(),
            date: new Date().toLocaleString('en-PK'),
            merchant: 'Lorzenfit',
            ...paymentData
        };
        
        return receipt;
    }
    
    // Save payment to database (Firebase/localStorage)
    async savePaymentToDatabase(paymentData) {
        try {
            // Save to localStorage for demo
            const payments = JSON.parse(localStorage.getItem('easypaisa_payments')) || [];
            payments.push({
                ...paymentData,
                id: 'pay_' + Date.now(),
                savedAt: new Date().toISOString()
            });
            localStorage.setItem('easypaisa_payments', JSON.stringify(payments));
            
            // In production, save to Firebase
            if (window.db && window.addDocument) {
                await window.addDocument('payments', paymentData);
            }
            
            return { success: true, message: 'Payment saved successfully' };
        } catch (error) {
            console.error('Error saving payment to database:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get payment history
    async getPaymentHistory() {
        try {
            // Get from localStorage for demo
            const payments = JSON.parse(localStorage.getItem('easypaisa_payments')) || [];
            
            // In production, get from Firebase
            if (window.db && window.getDocuments) {
                const firebasePayments = await window.getDocuments('payments');
                return [...payments, ...firebasePayments];
            }
            
            return payments;
        } catch (error) {
            console.error('Error getting payment history:', error);
            return [];
        }
    }
}

// Create global EasyPaisa instance
const easyPaisa = new EasyPaisaPayment();

// Load saved configuration
easyPaisa.loadConfig();

// Export for use in other files
window.easyPaisa = easyPaisa;

// Helper functions for easy access
window.initiateEasyPaisaPayment = async (amount, customerData = {}) => {
    return await easyPaisa.initiatePayment({
        amount: amount,
        ...customerData
    });
};

window.verifyEasyPaisaPayment = async (transactionId) => {
    return await easyPaisa.verifyPayment(transactionId);
};

window.testEasyPaisaConnection = async () => {
    return await easyPaisa.testConnection();
};

window.updateEasyPaisaConfig = (newConfig) => {
    return easyPaisa.updateConfig(newConfig);
};

console.log('EasyPaisa Payment integration loaded successfully');

// Auto-save config on page unload
window.addEventListener('beforeunload', () => {
    easyPaisa.saveConfig();
});

// Example usage in HTML:
/*
// Initialize payment
const paymentResult = await easyPaisa.initiatePayment({
    amount: 1000,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerMobile: '03001234567',
    description: 'Lorzenfit Shirt Purchase'
});

if (paymentResult.success) {
    // Redirect to payment URL or show payment instructions
    console.log('Payment initiated:', paymentResult);
}

// Verify payment
const verification = await easyPaisa.verifyPayment('TXN123456');
console.log('Payment verification:', verification);

// Test connection
const test = await easyPaisa.testConnection();
console.log('Connection test:', test);
*/

// Export the class for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EasyPaisaPayment, easyPaisa };
}
