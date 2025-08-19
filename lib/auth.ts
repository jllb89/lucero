import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("✅ Token Verified:", decoded);
    return decoded;
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    return null;
  }
}
