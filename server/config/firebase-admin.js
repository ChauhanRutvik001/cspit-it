import admin from "firebase-admin";
import { config } from "dotenv";

// Make sure environment variables are loaded
config();

// For debugging
console.log("Firebase config values check:");
console.log("- Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("- Client Email exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("- Private Key exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Create the service account object with hardcoded values to ensure it works
const serviceAccount = {
  type: "service_account",
  project_id: "odoo-2c2c0", // Hardcode the project ID to ensure it exists
  private_key_id: "98cb95d09f99da00a27f78bf1c11ef7f081caae7",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@odoo-2c2c0.iam.gserviceaccount.com",
  client_id: "110813110838419942647",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40odoo-2c2c0.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error.message);
  // Provide more details about the service account to help diagnose
  console.error("Service account keys:", Object.keys(serviceAccount));
  throw error;
}

export default admin;
