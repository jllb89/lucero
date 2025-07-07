// app/book/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';

import { MessageLoading } from '@/components/ui/message-loading';
import ErrorModal from '@/components/ui/ErrorModal';

/* ── Lazy-load the named export “Component” and disable SSR ── */
const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then((m) => m.Component),
  { ssr: false }
);

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { url, error } = useAuthorizedPdf(id);

  if (error) return <ErrorModal message={error} />;

  if (!url) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  return <PdfViewer url={url} />;
}
