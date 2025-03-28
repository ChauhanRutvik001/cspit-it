import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSlGCrDF6Tu4gPQLfgh_MjhTJhUSgYG0w",
  authDomain: "odoo-2c2c0.firebaseapp.com",
  projectId: "odoo-2c2c0",
  storageBucket: "odoo-2c2c0.firebasestorage.app", // Fix incorrect storage domain
  messagingSenderId: "262180936428",
  appId: "1:262180936428:web:5b23e71a23b2d221f4a3c9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });

// Function for Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export { auth, provider, signInWithGoogle };
