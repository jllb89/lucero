'use client';

import { useEffect, useState } from 'react';
import { getDeviceId } from '@/utils/getDeviceId';

interface State {
  url?: string;
  error?: string;
}

/** React hook that returns a signed-URL (or an error) for the given book */
export function useAuthorizedPdf(bookId: string | undefined): State {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    if (!bookId) return;

    (async () => {
      try {
        const deviceId = await getDeviceId();
        const res = await fetch(`/api/admin/books/view/${bookId}`, {
          headers: { 'x-device-id': deviceId },
        });

        if (!res.ok) throw (await res.json()).error as string;
        const { url } = (await res.json()) as { url: string };
        setState({ url });
      } catch (err) {
        setState({ error: typeof err === 'string' ? err : 'Unknown error' });
      }
    })();
  }, [bookId]);

  return state;
}
