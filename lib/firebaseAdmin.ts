import admin from "firebase-admin";

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  try {
    console.log("🔥 Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log("✅ Firebase Admin SDK Initialized Successfully");
  } catch (error) {
    console.error("❌ Firebase Admin SDK Initialization Failed:", error);
  }
}

export const storage = admin.storage();
export default admin;
