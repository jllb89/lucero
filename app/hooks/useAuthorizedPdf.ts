// hooks/useAuthorizedPdf.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrCreateDeviceId } from '@/utils/getDeviceId';

export type AuthorizedPdfErrorCode =
  | 'DEVICE_LIMIT'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export interface AuthorizedPdfError {
  status: number;
  code: AuthorizedPdfErrorCode;
  message: string;
  raw?: unknown;
}

type State = {
  url: string | null;
  error: AuthorizedPdfError | null;
  loading: boolean;
};

export const __USING_NEW_AUTH_PDF_HOOK__ = true as const; // <-- sanity flag

const TAG = '[useAuthorizedPdf]';

function parseError(status: number, raw: any): AuthorizedPdfError {
  const code = (raw?.code as AuthorizedPdfErrorCode) ?? (status === 403 ? 'DEVICE_LIMIT' : 'UNKNOWN');
  const message =
    raw?.message ??
    (status === 403
      ? 'Este dispositivo ya está registrado con otra cuenta.'
      : 'No se pudo cargar el documento.');
  return { status, code, message, raw };
}

export function useAuthorizedPdf(bookId?: string, userId?: string) {
  const [state, setState] = useState<State>({
    url: null,
    error: null,
    loading: true,
  });

  const abortRef = useRef<AbortController | null>(null);
  const tick = useRef(0);

  const canFetch = useMemo(() => Boolean(bookId && userId), [bookId, userId]);

  const fetchPdf = useCallback(async () => {
    if (!bookId || !userId) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const n = ++tick.current;

    setState(s => ({ ...s, loading: true, error: null, url: null }));

    try {
      const deviceId = getOrCreateDeviceId(userId);
      console.debug(`${TAG} start`, { bookId, userId, deviceId, n });

      const res = await fetch(`/api/admin/books/view/${bookId}`, {
        method: 'GET',
        headers: { 'x-device-id': deviceId },
        credentials: 'include',
        signal: abortRef.current.signal,
      });

      const ctype = res.headers.get('content-type') || '';

      if (!res.ok) {
        let payload: any = null;
        if (ctype.includes('application/json')) {
          try { payload = await res.json(); } catch {}
        } else {
          try { payload = { text: await res.text() }; } catch {}
        }

        const parsed = parseError(res.status, payload);
        console.warn(`${TAG} non-ok`, { status: res.status, parsed, raw: payload, n });
        setState({ url: null, error: parsed, loading: false });
        return;
      }

      if (ctype.includes('application/json')) {
        const data = await res.json();
        console.debug(`${TAG} ok-json`, { data, n });
        setState({ url: data?.url ?? null, error: null, loading: false });
      } else {
        const text = await res.text();
        console.debug(`${TAG} ok-text`, { text, n });
        setState({ url: text || null, error: null, loading: false });
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        console.debug(`${TAG} aborted`, { n });
        return;
      }
      console.error(`${TAG} network`, { e, n });
      setState({
        url: null,
        error: { status: 0, code: 'UNKNOWN', message: e?.message ?? 'Error de red', raw: e },
        loading: false,
      });
    }
  }, [bookId, userId]);

  useEffect(() => {
    if (!canFetch) {
      console.debug(`${TAG} waiting`, { bookId, userId });
      setState(s => ({ ...s, loading: true }));
      return;
    }
    fetchPdf();
    return () => abortRef.current?.abort();
  }, [canFetch, bookId, userId, fetchPdf]);

  const retry = useCallback(() => {
    console.debug(`${TAG} retry`);
    fetchPdf();
  }, [fetchPdf]);

  return { ...state, retry } as const;
}
