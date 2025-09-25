import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Set your Stripe webhook secret in your .env as STRIPE_WEBHOOK_SECRET
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  // console.log(">>> STRIPE WEBHOOK HANDLER TRIGGERED <<<");

  const sig = req.headers.get("stripe-signature");
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;


  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] Invalid signature or event:", err);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful payment link completion
  if ((event.type as string) === "checkout.session.completed" || (event.type as string) === "payment_link.completed") {
    console.log(`[stripe-webhook] Event received: ${event.type}`);
    const session = event.data.object as any;
    // Log the full session object as JSON for debugging, before extracting fields
    try {
      console.log("--- STRIPE WEBHOOK SESSION OBJECT (JSON) ---");
      console.log(JSON.stringify(session, null, 2));
    } catch (e) {
      console.log("[stripe-webhook] Could not stringify session:", e);
      console.dir(session, { depth: null });
    }
    // Robust address extraction
    const email = session.customer_details?.email || session.customer_email;
    const name = session.customer_details?.name || session.shipping?.name || session.collected_information?.shipping_details?.name || null;
    const phoneNumber = session.customer_details?.phone || session.shipping?.phone || null;
    // Try all possible address locations
    const addressObj = session.customer_details?.address
      || session.shipping?.address
      || session.collected_information?.shipping_details?.address
      || null;
    const shippingAddress = addressObj
      ? `${addressObj.line1 || ''}, ${addressObj.line2 || ''}, ${addressObj.city || ''}, ${addressObj.state || ''}, ${addressObj.postal_code || ''}, ${addressObj.country || ''}`.replace(/, +/g, ', ').replace(/^, |, $/g, '').replace(/,+$/, '')
      : null;
    const total = session.amount_total ? session.amount_total / 100 : 0;
    const isDigitalOnly = false; // You may want to infer this from metadata or line items

    // Find or create user by email
    let userId: string | undefined = undefined;
    if (email) {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Create user with random password and default values
        const randomPass = Math.random().toString(36).slice(-12);
        user = await prisma.user.create({
          data: {
            email,
            password: randomPass,
            role: "USER",
            phoneNumber: "",
          },
        });
      }
      userId = user.id;
    }

    // You may want to extract book IDs from session metadata or line items
    const books = session.metadata?.books ? JSON.parse(session.metadata.books) : [];
    console.log(`[stripe-webhook] Books in order:`, books);

    // Only create order if not already created (idempotency by stripeSessionId)
    const stripeSessionId = session.id;
    const existing = await prisma.order.findUnique({
      where: { stripeSessionId }
    });
    if (existing) {
      console.log(`[stripe-webhook] Order already exists for stripeSessionId: ${stripeSessionId}`);
    }
    if (!existing && userId) {
  const status = "PENDING"; // Set your desired status
      const source = "STRIPE"; // Set your desired source
      const order = await prisma.order.create({
        data: {
          userId,
          email,
          name,
          phoneNumber,
          shippingAddress,
          isDigitalOnly,
          total,
          status,
          source,
          stripeSessionId,
          orderItems: {
            create: books.map((b: { bookId: string, quantity?: number }) => ({
              bookId: b.bookId,
              quantity: b.quantity || 1,
            })),
          },
        } as any, // Cast to any to allow new fields
      });
      console.log(`[stripe-webhook] Created order:`, order);

      // Trigger notification email to admin(s)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
          || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
        const notifyUrl = `${baseUrl}/api/mail/new-order`;
        console.log(`[stripe-webhook] Triggering notification email for orderId: ${order.id} to ${notifyUrl}`);
        const res = await fetch(notifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const notifyResult = await res.json();
        console.log(`[stripe-webhook] Notification email result:`, notifyResult);
        // Trigger customer confirmation email
        const customerUrl = `${baseUrl}/api/mail/customer-confirmation`;
        console.log(`[stripe-webhook] Triggering customer confirmation email for orderId: ${order.id} to ${customerUrl}`);
        const customerRes = await fetch(customerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const customerResult = await customerRes.json();
        console.log(`[stripe-webhook] Customer confirmation email result:`, customerResult);
      } catch (e) {
        console.error(`[stripe-webhook] Failed to trigger notification email:`, e);
      }
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: false });
}

// Disable body parsing for Stripe webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
