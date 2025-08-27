// hooks/useAuthorizedPdf.ts
'use client';

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '@/utils/getDeviceId';

type State = { url: string | null; error: string | null; loading: boolean };

export function useAuthorizedPdf(bookId?: string, userId?: string) {
  const [state, setState] = useState<State>({ url: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function go() {
      if (!bookId || !userId) return; // wait until both exist
      setState(s => ({ ...s, loading: true, error: null }));

      try {
        const deviceId = getOrCreateDeviceId(userId);
        let res = await fetch(`/api/admin/books/view/${bookId}`, {
          headers: { 'x-device-id': deviceId },
          credentials: 'include',
        });

        if (!res.ok) {
          // Try auto-evict flow when device limit reached and confirmation required
          if (res.status === 409) {
            const body = await res.json().catch(() => ({} as any));
            if (body?.code === 'DEVICE_LIMIT' && body?.requiresConfirmation) {
              // re-request with confirmation header to evict oldest device
              res = await fetch(`/api/admin/books/view/${bookId}`, {
                headers: { 'x-device-id': deviceId, 'x-evict-oldest': '1' },
                credentials: 'include',
              });
            }
          }
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({} as any));
          const errMsg = body?.message || body?.error || 'UNKNOWN';
          if (!cancelled) setState({ url: null, error: errMsg, loading: false });
          return;
        }

        const { url } = await res.json();
        if (!cancelled) setState({ url, error: null, loading: false });
      } catch (e: any) {
        if (!cancelled) setState({ url: null, error: e.message ?? 'Network error', loading: false });
      }
    }

    go();
    return () => { cancelled = true; };
  }, [bookId, userId]);

  return state;
}
