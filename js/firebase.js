// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACb1l8ivQcbzDmQzP3tPxKOsG_xseGB_g",
  authDomain: "test-app-d46a5.firebaseapp.com",
  projectId: "test-app-d46a5",
  storageBucket: "test-app-d46a5.firebasestorage.app",
  messagingSenderId: "838827515730",
  appId: "1:838827515730:web:0861e323ac982072f9248b",
  measurementId: "G-T6FMCYXK1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the Firebase app instance
export default app;