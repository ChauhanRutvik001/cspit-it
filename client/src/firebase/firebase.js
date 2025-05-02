import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSlGCrDF6Tu4gPQLfgh_MjhTJhUSgYG0w",
  authDomain: "odoo-2c2c0.firebaseapp.com",
  projectId: "odoo-2c2c0",
  storageBucket: "odoo-2c2c0.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "262180936428",
  appId: "1:262180936428:web:5b23e71a23b2d221f4a3c9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure Google provider
provider.setCustomParameters({
  prompt: "select_account",
  // Add login_hint to avoid popup blockers
  login_hint: "user@example.com"
});

// Function for Google Sign-In with better error handling
const signInWithGoogle = async () => {
  try {
    // Using browserPopupRedirectResolver to help with COOP issues
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    return result;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    
    // Better error handling
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in was cancelled. Please try again.");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Pop-up was blocked by the browser. Please enable pop-ups for this site.");
    }
    
    throw error;
  }
};

export { auth, provider, signInWithGoogle };
