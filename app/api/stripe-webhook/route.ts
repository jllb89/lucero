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
    // You may need to adjust these fields based on your Payment Link/Checkout Session setup
    const email = session.customer_details?.email || session.customer_email;
    const name = session.customer_details?.name || session.shipping?.name || null;
    const phoneNumber = session.customer_details?.phone || session.shipping?.phone || null;
    const shippingAddress = session.shipping?.address ?
      `${session.shipping.address.line1 || ''}, ${session.shipping.address.city || ''}, ${session.shipping.address.state || ''}, ${session.shipping.address.postal_code || ''}, ${session.shipping.address.country || ''}` : null;
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

    // Only create order if not already created (idempotency)
    const existing = await prisma.order.findFirst({
      where: {
        email,
        total,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 5) }
      }
    });
    if (existing) {
      console.log(`[stripe-webhook] Order already exists for email: ${email}, total: ${total}`);
    }
    if (!existing && userId) {
      const status = "PAID"; // Set your desired status
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
          orderItems: {
            create: books.map((b: { bookId: string }) => ({ bookId: b.bookId })),
          },
        } as any, // Cast to any to allow new fields
      });
      console.log(`[stripe-webhook] Created order:`, order);
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
