import admin from "firebase-admin";

if (!admin.apps.length) {
  console.log("🔥 Initializing Firebase Admin SDK...");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // 🔥 Fix escaped newline issues
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ✅ Make sure this is set
  });

  console.log("✅ Firebase Admin SDK Initialized Successfully");
}

export const storage = admin.storage();
