// Firebase Configuration - Solo Were Website
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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Export for use in other files
window.db = db;
window.auth = auth;
window.storage = storage;

console.log("Firebase initialized successfully!");
