// utils/getDeviceId.ts
'use client';

import FingerprintJS from '@fingerprintjs/fingerprintjs';

/** Legacy: raw fingerprint (not per-account) */
export async function getDeviceId(): Promise<string> {
  const fp = await FingerprintJS.load();
  const { visitorId } = await fp.get();
  return visitorId;
}

/** Preferred: per-account ID so one device can be used by multiple accounts */
export function getOrCreateDeviceId(userId: string): string {
  if (!userId) throw new Error('getOrCreateDeviceId: userId is required');

  const key = `deviceId-${userId}`;
  let id = localStorage.getItem(key);

  if (!id) {
    // stable + simple
    id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(key, id);
  }

  return id;
}
