import admin from "firebase-admin";
import { config } from "dotenv";

// Make sure environment variables are loaded
config();

// For debugging
console.log("Firebase config values check:");
console.log("- Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("- Client Email exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("- Private Key exists:", !!process.env.FIREBASE_PRIVATE_KEY);

// Create the service account object with proper handling of the private key
const serviceAccount = {
  type: "service_account",
  project_id: "odoo-2c2c0", // Hardcode the project ID to ensure it exists
  private_key_id: "98cb95d09f99da00a27f78bf1c11ef7f081caae7",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? 
    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
    '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDExERs97+mvdVE\nrhvPclDrm8T+BZSQ9i2yWTKEZNgzXLI7pTpW9JdnlRWkG1aws58BIXQSCx5WAMvQ\nBIGHaCeATLVHyqsOuM+2bhYIPcLwR1oxwfx6/HQZoaErMz9KLNu2n4EiHPXTRpsr\noJsvsk1eHkM4Fsw/KJ0fmc9oVTKmhR7vLgnvyea3FPnrCjOKwdP3gXmGlIE+Du+q\nlpAi7Aq65WJQACzgQh/E7bDLplm0WYhIkTj1c5vRYVsJo7BVwPUPjv32gM9uAdMO\nT+/zB1yazJ4u373aF9jDCSxDEfGH1S7s6bI7DTTEz8Dt11E4uwvKyqaG/UTK9Pag\n8XFpp0NfAgMBAAECggEAA26MRZbOLzetH6s+lMo6KQiSknPRVEYzTUAa8bJAHQ+M\n3NnE2/0nqGlQlO2xMBgDZZOCwq661OWoXz+Bt5DXXYN5Jj9iZp29yer664M93pNV\nBJp1GEpRm7A+Cpac2JXVaXaI95R8dMuaklVT2flHf6+dPFc0kY6zNEk3MVt+txLI\nSyF4fKjyTVUpaL1JP4UDVytfyKuZNUNNZ/j+gFdD9USJ02B1ug6lFAxOvscoMltX\nE81svC6HrV8ZHAYh4L+ggpKPWiycUVSmYpB5ShPAcTDs7w+RLtHDklYHmLlFaEs6\nsy5XZ3KsKrcQ3TqxJVEyvRMyku0i9ADhMtR9k5fcAQKBgQDly+IYIXDM3klbkJZh\n02XBZWkZDjXcJWiIh3M257zQK3cHVPHLTR2SClO3/wUTBGgbL50Ic8lU1bDYI4GJ\nzX6Jh5AqUD14DMDLMCraofaRBl56ZNJ26drWMZ5/uZ5LJBrTePPf8tQBLSlxB81S\n2zvPD9aLqZ6r9EVSoInBZiIs4QKBgQDboMPWtLoXcc185IosjcqFmMj1VX1FSedX\noAUe9G0U7AJ5X2ty0tPkoO1XkR+SDQMDn36bWZOKgFpm6/l4k2VsC5JrlmFvtESs\niUUDqEnukmV0H9NxOW+TDYR5ZCzA1Fvl6SAVocIHAgPbf9eZ4eaWlPq9ioBZEQY9\nXq7KXFLrvwKBgQDgCJOotNo7rfTWKLWUDX2I7qvufkzZz5eq4Vp65c63T+pRrNWK\n/vWxnjGnJ6kElnlNzAQHw3r8NJVYOR2yvZtra2J5yJ23pe2tAuASACduPiPYfgDV\nQ9YnlXOMwvD5SRJGPH2IYqw9NTeVtgiFl8mqZE/Qc3mKYFeP5aO1BStswQKBgQCj\n4EXLokPbUOP/jXsTxK+5vz5vatuPE+CvWmAcKLXKCJJ4T9av/MSwrIzhV0qEp29K\nVHQBKbzL0qoMTorvuN4SosMVJcl9bUm5tdM/kmBf19pgVdgGqhksBYr4hLP83XDj\nwp96vj6jR/kEVPYT4/wNCdhia7Ka+pYRL0UDnFg1dwKBgQC7ZrG+AXqJCzEC9FDs\nGLKywbS+sUFAM0//PfLBfWyGs9da0Qj1MEQdhA/aetCiQAXsXULFdGjPxyi1YsJZ\ndJAeUCMawdnfjPcH+hfTeKVV9y05N1njGbsOKP3J5/zdfKTOmYHq0j3LssYbSKZI\ngtWQAOtC8UdVSOXLmRr7CXrPbw==\n-----END PRIVATE KEY-----\n',
  client_email: "firebase-adminsdk-fbsvc@odoo-2c2c0.iam.gserviceaccount.com",
  client_id: "110813110838419942647",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40odoo-2c2c0.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin with better error handling
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
  console.error("Private key first 20 chars:", serviceAccount.private_key.substring(0, 20));
  throw error;
}

export default admin;
