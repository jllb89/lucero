'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';

import { MessageLoading } from '@/components/ui/message-loading';
import ErrorModal        from '@/components/ui/ErrorModal';

/* ── Lazy-load viewer on the client ── */
const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then(m => m.Component),
  { ssr: false }
);

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { url, error } = useAuthorizedPdf(id);

  if (error) return <ErrorModal message={error} />;

  if (!url) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  /*  Full-viewport flex box ensures the viewer gets 100 % height & width  */
  return (
    <div>
      <PdfViewer url={url} />
    </div>
  );
}
