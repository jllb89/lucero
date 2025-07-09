'use client';

import { useParams } from 'next/navigation';
import dynamic       from 'next/dynamic';
import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';
import { MessageLoading }   from '@/components/ui/message-loading';
import ErrorModal           from '@/components/ui/ErrorModal';

// client-only viewer
const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then(m => m.Component),
  { ssr: false }
);

export default function ReaderPage() {
  const { id }      = useParams<{ id: string }>();
  const { url, error } = useAuthorizedPdf(id);

  if (error) return <ErrorModal message={error} />;

  if (!url) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  /* full-viewport, *no* body scrolling allowed */
  return (
    <div className="h-screen w-screen overflow-hidden">
      <PdfViewer url={url} />
    </div>
  );
}
