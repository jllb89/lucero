// app/book/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useAuthorizedPdf } from '@/hooks/useAuthorizedPdf';
import { useUser } from '@/app/hooks/useUser';
import { MessageLoading } from '@/components/ui/message-loading';
import ErrorModal from '@/components/ui/ErrorModal';

const PdfViewer = dynamic(
  () => import('@/components/ui/pdf-viewer').then(m => m.Component),
  { ssr: false }
);

const TAG = '[ReaderPage]';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: userLoading } = useUser();
  const { url, error, loading /*, retry*/ } = useAuthorizedPdf(id, user?.id);

  // Error path (supports both new structured error and old string)
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : undefined;
    const message =
      typeof error === 'object' && error && 'message' in error
        ? (error as any).message
        : (error as any as string);

    const friendly =
      code === 'DEVICE_LIMIT'
        ? 'Este dispositivo ya está registrado con otra cuenta. Inicia sesión con la cuenta original, usa otro perfil/navegador o contáctanos.'
        : message || 'No se pudo abrir el libro.';

    console[code === 'DEVICE_LIMIT' ? 'warn' : 'error'](`${TAG} error`, {
      code,
      userId: user?.id,
      bookId: id,
    });

    return <ErrorModal message={friendly} />;
  }

  // Loading path
  if (userLoading || loading || !url || !user) {
    console.debug(`${TAG} loading`, {
      userLoading,
      loading,
      hasUrl: Boolean(url),
      hasUser: Boolean(user),
    });
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <MessageLoading />
      </div>
    );
  }

  // Ready
  console.debug(`${TAG} rendering PDF`, { bookId: id, userEmail: user.email });
  return (
    <div className="h-screen w-screen overflow-hidden">
      <PdfViewer url={url} userEmail={user.email} />
    </div>
  );
}
