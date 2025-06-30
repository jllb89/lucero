// app/book/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';

/* UI components */
import { MessageLoading } from '@/components/ui/message-loading';
import ErrorModal from '@/components/ErrorModal';   // adjust if stored elsewhere
import PdfViewer from '@/components/PdfViewer';     // adjust if stored elsewhere

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { url, error } = useAuthorizedPdf(id);

  /* ─── Error state ─── */
  if (error) return <ErrorModal message={error} />;

  /* ─── Loading state ─── */
  if (!url) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  /* ─── Success state ─── */
  return <PdfViewer src={url} />;
}
