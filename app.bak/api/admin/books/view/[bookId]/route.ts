/* ------------------------------------------------------------------ */
/*  /api/admin/books/view/[bookId]/route.ts – device-limit safe + log */
/* ------------------------------------------------------------------ */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { verifyToken } from '@/lib/auth';
import { storage } from '@/lib/firebaseAdmin';

const prisma = new PrismaClient();
const MAX_DEVICES = 3;
const TAG = '[API:view-book]';

type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'DEVICE_LIMIT'
  | 'NO_ACCESS'
  | 'NOT_FOUND'
  | 'UNKNOWN';

function jsonError(
  status: number,
  code: ErrorCode,
  message: string,
  extra?: Record<string, unknown>
) {
  const body = { code, message, ...(extra ?? {}) };
  return NextResponse.json(body, { status });
}

/* ---------- GET /api/admin/books/view/[bookId] -------------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookId: string }> }
) {
  const started = Date.now();

  const deviceId = req.headers.get('x-device-id') ?? '';
  let userId: string = '';           // <-- keep as concrete string
  let bookId: string | undefined;

  try {
    const params = await context.params;
    bookId = params?.bookId;
    if (!bookId) {
      console.warn(`${TAG} bad request: missing bookId`, { deviceId });
      return jsonError(400, 'BAD_REQUEST', 'Book ID is required.');
    }

    const token = (await cookies()).get('token')?.value;
    if (!token) {
      console.warn(`${TAG} unauthorized: missing token`, { bookId, deviceId });
      return jsonError(401, 'UNAUTHORIZED', 'Unauthorized.');
    }

    const user = verifyToken(token);
    if (!user || typeof user === 'string') {
      console.warn(`${TAG} invalid token`, { bookId, deviceId });
      return jsonError(403, 'INVALID_TOKEN', 'Invalid user token.');
    }

    userId = user.id;               // <-- now guaranteed string

    if (!deviceId) {
      console.warn(`${TAG} bad request: missing x-device-id`, { userId, bookId });
      return jsonError(400, 'BAD_REQUEST', 'No device ID supplied.');
    }

    console.info(`${TAG} ▶ request`, { userId, role: user.role, deviceId, bookId });

    const existingDevice = await prisma.device.findUnique({ where: { deviceId } });
    console.debug(`${TAG} device lookup`, {
      found: Boolean(existingDevice),
      ownerUserId: existingDevice?.userId,
    });

    if (existingDevice) {
      if (existingDevice.userId !== userId) {
        const durationMs = Date.now() - started;
        console.warn(`${TAG} DEVICE_LIMIT (bound to other user)`, {
          userId,
          ownerUserId: existingDevice.userId,
          bookId,
          deviceId,
          durationMs,
        });
        return jsonError(
          403,
          'DEVICE_LIMIT',
          'Este dispositivo ya está registrado con otra cuenta.'
        );
      }
      // same user → OK
    } else {
      const userDeviceCount = await prisma.device.count({ where: { userId } });
      console.debug(`${TAG} user device count`, { userId, userDeviceCount, MAX_DEVICES });

      if (userDeviceCount >= MAX_DEVICES) {
        // Oldest device for this user
        const oldest = await prisma.device.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          select: { deviceId: true, createdAt: true },
        });

        const confirmEvict = req.headers.get('x-evict-oldest') === '1';
        if (!confirmEvict) {
          const durationMs = Date.now() - started;
          console.warn(`${TAG} DEVICE_LIMIT (confirmation required)`, {
            userId,
            bookId,
            deviceId,
            oldestDeviceId: oldest?.deviceId,
            durationMs,
          });
          return NextResponse.json(
            {
              code: 'DEVICE_LIMIT',
              message:
                'Has alcanzado el límite de dispositivos. Confirma para reemplazar el dispositivo más antiguo.',
              requiresConfirmation: true,
              oldestDeviceId: oldest?.deviceId ?? null,
              maxDevices: MAX_DEVICES,
            },
            { status: 409 }
          );
        }

        if (oldest?.deviceId) {
          // Best effort: evict oldest record
          await prisma.device
            .delete({ where: { deviceId: oldest.deviceId } })
            .then(() =>
              console.info(`${TAG} 🔐 evicted oldest device`, {
                userId,
                evictedDeviceId: oldest.deviceId,
              })
            )
            .catch((err) =>
              console.warn(`${TAG} ⚠️ failed to evict oldest device`, {
                userId,
                evictedDeviceId: oldest.deviceId,
                error: err?.message,
              })
            );
        }

        // Note on sessions: we cannot remotely clear cookies on other devices.
        // Clients should inform the user that the oldest session will be cerrada.
      }

      await prisma.device.create({ data: { userId, deviceId } }); // register current device
      console.info(`${TAG} ✅ device registered`, { userId, deviceId });
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasItem = await prisma.orderItem.findFirst({
        where: { bookId, order: { userId } },
        select: { id: true },
      });

      console.debug(`${TAG} ownership check`, { userId, bookId, hasAccess: Boolean(hasItem) });

      if (!hasItem) {
        const durationMs = Date.now() - started;
        console.warn(`${TAG} NO_ACCESS`, { userId, bookId, durationMs });
        return jsonError(403, 'NO_ACCESS', 'Este libro no está disponible para este usuario.');
      }
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, bookFile: true },
    });

    if (!book?.bookFile) {
      const durationMs = Date.now() - started;
      console.warn(`${TAG} NOT_FOUND (missing file)`, { userId, bookId, durationMs });
      return jsonError(404, 'NOT_FOUND', 'Libro no encontrado o sin archivo.');
    }

    const [signedUrl] = await storage
      .bucket()
      .file(book.bookFile)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 5 * 60_000,
        responseDisposition: 'inline',
      });

    const durationMs = Date.now() - started;
    console.info(`${TAG} ✅ success`, { userId, bookId, deviceId, durationMs });

    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (err: any) {
    const durationMs = Date.now() - started;
    console.error(`${TAG} ❌ unhandled`, {
      userId,
      bookId,
      deviceId,
      durationMs,
      error: { message: err?.message, stack: err?.stack },
    });
    return jsonError(500, 'UNKNOWN', 'Internal Server Error');
  }
}
