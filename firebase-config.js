// ============================================
// LORZENFIT WEBSITE - FIREBASE CONFIGURATION
// ============================================

// Your Firebase configuration (from your message)
const firebaseConfig = {
    apiKey: "AIzaSyAsuVFO6rgpe-hOXzeXyZym0Mut0F9dCms",
    authDomain: "tameerkhi-help.firebaseapp.com",
    databaseURL: "https://tameerkhi-help-default-rtdb.firebaseio.com",
    projectId: "tameerkhi-help",
    storageBucket: "tameerkhi-help.firebasestorage.app",
    messagingSenderId: "579938553002",
    appId: "1:579938553002:web:ec7e0626070e95f2d794d3",
    measurementId: "G-EGDH3H49WY"
};

// Firebase App (the core Firebase SDK) is always required
let firebaseApp;
let db; // Firestore
let auth; // Authentication
let storage; // Storage
let analytics;

// Check if Firebase is available
if (typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        
        // Initialize services
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        analytics = firebase.analytics();
        
        console.log('Firebase initialized successfully');
        
        // Enable offline persistence (optional)
        db.enablePersistence()
            .catch((err) => {
                console.log('Firestore persistence error:', err);
            });
            
    } catch (error) {
        console.error('Firebase initialization error:', error);
        setupLocalStorageFallback();
    }
} else {
    console.warn('Firebase SDK not loaded. Using localStorage fallback.');
    setupLocalStorageFallback();
}

// LocalStorage fallback for development/testing
function setupLocalStorageFallback() {
    console.log('Setting up localStorage fallback for Firebase');
    
    // Mock Firebase Firestore
    db = {
        collection: (name) => ({
            add: async (data) => {
                const items = JSON.parse(localStorage.getItem(`firestore_${name}`)) || [];
                const id = Date.now().toString();
                const newItem = { id, ...data };
                items.push(newItem);
                localStorage.setItem(`firestore_${name}`, JSON.stringify(items));
                return { id };
            },
            get: async () => ({
                docs: (JSON.parse(localStorage.getItem(`firestore_${name}`)) || []).map(item => ({
                    id: item.id,
                    data: () => {
                        const { id, ...data } = item;
                        return data;
                    }
                }))
            }),
            doc: (id) => ({
                get: async () => ({
                    exists: true,
                    data: () => {
                        const items = JSON.parse(localStorage.getItem(`firestore_${name}`)) || [];
                        const item = items.find(i => i.id === id);
                        if (item) {
                            const { id, ...data } = item;
                            return data;
                        }
                        return null;
                    }
                }),
                update: async (data) => {
                    const items = JSON.parse(localStorage.getItem(`firestore_${name}`)) || [];
                    const index = items.findIndex(item => item.id === id);
                    if (index !== -1) {
                        items[index] = { ...items[index], ...data };
                        localStorage.setItem(`firestore_${name}`, JSON.stringify(items));
                    }
                },
                delete: async () => {
                    const items = JSON.parse(localStorage.getItem(`firestore_${name}`)) || [];
                    const filtered = items.filter(item => item.id !== id);
                    localStorage.setItem(`firestore_${name}`, JSON.stringify(filtered));
                }
            }),
            where: (field, operator, value) => ({
                get: async () => ({
                    docs: (JSON.parse(localStorage.getItem(`firestore_${name}`)) || [])
                        .filter(item => {
                            switch(operator) {
                                case '==': return item[field] === value;
                                case '>=': return item[field] >= value;
                                case '<=': return item[field] <= value;
                                default: return true;
                            }
                        })
                        .map(item => ({
                            id: item.id,
                            data: () => {
                                const { id, ...data } = item;
                                return data;
                            }
                        }))
                })
            })
        })
    };
    
    // Mock Firebase Auth
    auth = {
        currentUser: null,
        
        signInWithEmailAndPassword: async (email, password) => {
            // For demo, accept any email/password
            const user = {
                uid: 'demo_user_' + Date.now(),
                email: email,
                displayName: 'Demo User'
            };
            
            auth.currentUser = user;
            localStorage.setItem('firebase_auth_user', JSON.stringify(user));
            
            return { user };
        },
        
        createUserWithEmailAndPassword: async (email, password) => {
            const user = {
                uid: 'demo_user_' + Date.now(),
                email: email,
                displayName: 'New User'
            };
            
            auth.currentUser = user;
            localStorage.setItem('firebase_auth_user', JSON.stringify(user));
            
            return { user };
        },
        
        signOut: async () => {
            auth.currentUser = null;
            localStorage.removeItem('firebase_auth_user');
        },
        
        onAuthStateChanged: (callback) => {
            const savedUser = localStorage.getItem('firebase_auth_user');
            if (savedUser) {
                auth.currentUser = JSON.parse(savedUser);
            }
            callback(auth.currentUser);
            
            // Return unsubscribe function
            return () => {};
        }
    };
    
    // Mock Firebase Storage
    storage = {
        ref: (path) => ({
            put: async (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const images = JSON.parse(localStorage.getItem('firebase_storage')) || {};
                        const id = Date.now().toString();
                        images[id] = {
                            name: file.name,
                            type: file.type,
                            data: e.target.result,
                            path: path
                        };
                        localStorage.setItem('firebase_storage', JSON.stringify(images));
                        
                        resolve({
                            ref: {
                                getDownloadURL: async () => {
                                    return `data:${file.type};base64,${e.target.result.split(',')[1]}`;
                                }
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
        })
    };
}

// Firebase Helper Functions
async function addDocument(collectionName, data) {
    try {
        if (db && db.collection) {
            const docRef = await db.collection(collectionName).add(data);
            return { id: docRef.id, success: true };
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem(collectionName)) || [];
            const id = Date.now().toString();
            items.push({ id, ...data });
            localStorage.setItem(collectionName, JSON.stringify(items));
            return { id, success: true };
        }
    } catch (error) {
        console.error('Error adding document:', error);
        return { success: false, error: error.message };
    }
}

async function getDocuments(collectionName) {
    try {
        if (db && db.collection) {
            const snapshot = await db.collection(collectionName).get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem(collectionName)) || [];
        }
    } catch (error) {
        console.error('Error getting documents:', error);
        return [];
    }
}

async function updateDocument(collectionName, docId, data) {
    try {
        if (db && db.collection) {
            await db.collection(collectionName).doc(docId).update(data);
            return { success: true };
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem(collectionName)) || [];
            const index = items.findIndex(item => item.id === docId);
            if (index !== -1) {
                items[index] = { ...items[index], ...data };
                localStorage.setItem(collectionName, JSON.stringify(items));
            }
            return { success: true };
        }
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error.message };
    }
}

async function deleteDocument(collectionName, docId) {
    try {
        if (db && db.collection) {
            await db.collection(collectionName).doc(docId).delete();
            return { success: true };
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem(collectionName)) || [];
            const filtered = items.filter(item => item.id !== docId);
            localStorage.setItem(collectionName, JSON.stringify(filtered));
            return { success: true };
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
    }
}

async function uploadImage(file, path) {
    try {
        if (storage && storage.ref) {
            const storageRef = storage.ref(path);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } else {
            // Fallback to localStorage
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const images = JSON.parse(localStorage.getItem('uploaded_images')) || {};
                    const id = Date.now().toString();
                    images[id] = {
                        name: file.name,
                        type: file.type,
                        data: e.target.result,
                        path: path
                    };
                    localStorage.setItem('uploaded_images', JSON.stringify(images));
                    resolve({ success: true, url: e.target.result });
                };
                reader.readAsDataURL(file);
            });
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
}

// Authentication Helper Functions
async function loginUser(email, password) {
    try {
        if (auth && auth.signInWithEmailAndPassword) {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } else {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('current_user', JSON.stringify(user));
                return { success: true, user };
            } else {
                return { success: false, error: 'Invalid credentials' };
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function registerUser(email, password, userData = {}) {
    try {
        if (auth && auth.createUserWithEmailAndPassword) {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile if provided
            if (userData.displayName) {
                await userCredential.user.updateProfile({
                    displayName: userData.displayName
                });
            }
            
            // Save additional user data to Firestore
            if (db && db.collection) {
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    ...userData,
                    createdAt: new Date().toISOString()
                });
            }
            
            return { success: true, user: userCredential.user };
        } else {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                return { success: false, error: 'User already exists' };
            }
            
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // In real app, never store passwords in localStorage
                ...userData,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('current_user', JSON.stringify(newUser));
            
            return { success: true, user: newUser };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function logoutUser() {
    try {
        if (auth && auth.signOut) {
            await auth.signOut();
        } else {
            // Fallback to localStorage
            localStorage.removeItem('current_user');
        }
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

function getCurrentUser() {
    if (auth && auth.currentUser) {
        return auth.currentUser;
    } else {
        // Fallback to localStorage
        const user = localStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    }
}

// Firestore Collections Configuration
const COLLECTIONS = {
    PRODUCTS: 'products',
    ORDERS: 'orders',
    USERS: 'users',
    CATEGORIES: 'categories',
    REVIEWS: 'reviews',
    CONTACT_MESSAGES: 'contact_messages',
    NEWSLETTER: 'newsletter'
};

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.firebaseApp = firebaseApp;
window.db = db;
window.auth = auth;
window.storage = storage;

// Export helper functions
window.addDocument = addDocument;
window.getDocuments = getDocuments;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.uploadImage = uploadImage;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.COLLECTIONS = COLLECTIONS;

console.log('Firebase configuration loaded successfully');
