import admin from "firebase-admin";

let initialized = false;

function initFirebaseAdmin() {
  if (admin.apps.length) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    // Do not initialize during build if env is missing; throw only when actually used
    throw new Error(
      "Firebase Admin not configured: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY"
    );
  }

  console.log("🔥 Initializing Firebase Admin SDK...");
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
  initialized = true;
  console.log("✅ Firebase Admin SDK Initialized Successfully");
}

export function getStorage() {
  if (!initialized) {
    initFirebaseAdmin();
  }
  return admin.storage();
}
