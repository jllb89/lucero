import Stripe from "stripe";

// Ensure STRIPE_SECRET_KEY is set in your environment
const secret = process.env.STRIPE_SECRET_KEY || "";

// Use SDK default API version to avoid type mismatches
export const stripe = new Stripe(secret);
