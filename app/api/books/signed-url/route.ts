import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Received request for signed URL");
    const { userId, bookId, deviceId } = await req.json();
    console.log(`🛠 Checking device ID: ${deviceId}`);

    // Get user's registered devices
    const userDevices = await prisma.device.findMany({
      where: { userId },
    });

    console.log(`🔍 Found ${userDevices.length} registered devices for user`);

    // Check if device is registered
    const isDeviceAllowed = userDevices.some(device => device.deviceId === deviceId);
    if (!isDeviceAllowed && userDevices.length >= 3) {
      console.log("❌ Device limit reached. Rejecting request.");
      return NextResponse.json({ error: "Device limit reached." }, { status: 403 });
    }

    // Register new device if needed
    if (!isDeviceAllowed) {
      console.log("✅ New device detected. Registering...");
      await prisma.device.create({ data: { userId, deviceId } });
    }

    // Check if user owns the book
    console.log("📚 Checking if user owns the book...");
    const userOrder = await prisma.order.findFirst({
      where: {
        userId,
        orderItems: { some: { bookId } },
      },
    });

    if (!userOrder) {
      console.log("❌ User does not own this book. Rejecting request.");
      return NextResponse.json({ error: "You don't own this book." }, { status: 403 });
    }

    // Generate Signed URL
    console.log("🔏 Generating signed URL...");
    const filePath = `books/${bookId}.pdf`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    console.log("✅ Signed URL generated successfully");
    return NextResponse.json({ url });

  } catch (error) {
    console.error("❌ Error generating signed URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
