'use client';

import { useParams } from 'next/navigation';
import dynamic       from 'next/dynamic';

import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';
import { useUser } from '@/app/hooks/useUser';
import { MessageLoading }   from '@/components/ui/message-loading';
import ErrorModal           from '@/components/ui/ErrorModal';

/* ── client-only viewer ── */
const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then((m) => m.Component),
  { ssr: false }
);

export default function ReaderPage() {
  const { id }          = useParams<{ id: string }>();
  const { url, error }  = useAuthorizedPdf(id);
  const { user, loading } = useUser();                        // ← useUser hook

  /* ── error states ── */
  if (error)        return <ErrorModal message={error} />;
  if (!url || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  /* ── full-viewport viewer ── */
  return (
    <div className="h-screen w-screen overflow-hidden">
      <PdfViewer
        url={url}
        // ← supply email for watermark
        userEmail={user.email}
      />
    </div>
  );
}
