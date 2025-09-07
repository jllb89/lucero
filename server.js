// (Stray phone number check removed; logic is correctly inside the webhook handler)
// server.js
// Custom Express server for handling Stripe webhooks in Next.js App Router

const express = require('express');
const next = require('next');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // IMPORTANT: Do not use any body parser before this route!
  // Stripe webhook endpoint (must use raw body, must be first)
  server.post('/api/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  // Only log the session object after event is constructed (for debugging customer info)
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[stripe-webhook] Invalid signature or event:', err);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // ...existing webhook logic...
    if (event.type === 'checkout.session.completed' || event.type === 'payment_link.completed') {
  const session = event.data.object;
      // Log the full session object for debugging customer info
      try {
        console.log('[stripe-webhook] SESSION:', JSON.stringify(session, null, 2));
      } catch (e) {
        console.log('[stripe-webhook] Could not stringify session:', e);
      }
      // 1. Require email
      const email = session.customer_details?.email || session.customer_email || '';
      if (!email) {
        console.warn('[stripe-webhook] No email found in session. Order will not be created.');
        return res.status(400).json({ error: 'Email is required for order creation.' });
      }
      // 2. Require shipping address (support both Payment Links and Checkout Sessions)
      const shippingAddressObj =
        session.shipping?.address || // Checkout Sessions
        session.shipping_details?.address; // Payment Links

      const shippingAddress = shippingAddressObj
        ? [
            shippingAddressObj.line1,
            shippingAddressObj.line2,
            shippingAddressObj.city,
            shippingAddressObj.state,
            shippingAddressObj.postal_code,
            shippingAddressObj.country,
          ].filter(Boolean).join(', ')
        : '';
      if (!shippingAddress) {
        console.warn('[stripe-webhook] No shipping address found in session. Order will not be created.');
        return res.status(400).json({ error: 'Shipping address is required for order creation.' });
      }

  // Extract name and phone from customer_details (Stripe recommended)
  const name = session.customer_details?.name || null;
  const phoneNumber = session.customer_details?.phone || null;
      // 7. Warn if total is 0
      const total = session.amount_total ? session.amount_total / 100 : 0;
      if (!total) {
        console.warn('[stripe-webhook] No total found in session or total is 0.');
      }
      // 5. Hardcode isDigitalOnly as true
      const isDigitalOnly = true;
      let userId;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const randomPass = Math.random().toString(36).slice(-12);
        user = await prisma.user.create({
          data: {
            email,
            password: randomPass,
            role: 'USER',
            phoneNumber: '',
          },
        });
  // Optionally log user creation
      } else {
  // Optionally log found user
      }
      userId = user.id;
      // 4. Default status to 'PAID' (Stripe = paid)
  const status = 'PENDING';
      const source = 'stripe';
      const books = session.metadata?.books ? JSON.parse(session.metadata.books) : [];
      const stripeSessionId = session.id;
      // Idempotency: only create order if not already created for this session
      const existing = await prisma.order.findUnique({ where: { stripeSessionId } });
      if (existing) {
        console.log(`[stripe-webhook] Order already exists for stripeSessionId: ${stripeSessionId}`);
      }
      if (!existing && userId) {
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
              create: books.map((b) => ({ bookId: b.bookId })),
            },
          },
          include: {
            orderItems: { include: { book: true } },
          },
        });
        // Log created order with customer info
        console.log('[stripe-webhook] Created order:', JSON.stringify(order, null, 2));

        // --- Notification Email Logic (API call) ---
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL
              ? process.env.NEXT_PUBLIC_BASE_URL
              : process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000";
          const adminNotifyUrl = `${baseUrl}/api/mail/new-order`;
          const customerNotifyUrl = `${baseUrl}/api/mail/customer-confirmation`;
          // Admin notification
          const adminRes = await fetch(adminNotifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id }),
          });
          const adminResult = await adminRes.json();
          console.log(`[stripe-webhook] Admin notification email result:`, adminResult);
          // Customer confirmation
          if (order.email) {
            const custRes = await fetch(customerNotifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: order.id }),
            });
            const custResult = await custRes.json();
            console.log(`[stripe-webhook] Customer confirmation email result:`, custResult);
          }
        } catch (err) {
          console.error(`[stripe-webhook] Failed to trigger email notifications:`, err);
        }
        // --- End Notification Email Logic ---
      }
    }
    res.json({ received: true });
  });

  // (Optional) Add other body parsers for other routes here, AFTER the webhook route
  // server.use(express.json());
  // server.use(express.urlencoded({ extended: true }));

  // All other requests handled by Next.js
  server.use((req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
