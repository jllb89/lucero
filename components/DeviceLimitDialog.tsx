// components/DeviceLimitDialog.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DeviceLimitDialogProps {
  onRetry?: () => void;
  supportHref?: string; // e.g. "/soporte" or "mailto:soporte@tuapp.com"
  loginHref?: string;   // e.g. "/login"
  homeHref?: string;    // e.g. "/"
}

export default function DeviceLimitDialog({
  onRetry,
  supportHref = "/soporte",
  loginHref = "/login",
  homeHref = "/",
}: DeviceLimitDialogProps) {
  const router = useRouter();

  // prevent background scroll while dialog is open
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-limit-title"
        className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-lg">!</span>
          </div>
          <div>
            <h2 id="device-limit-title" className="text-xl font-semibold">
              Dispositivo ya vinculado con otra cuenta
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Este dispositivo está registrado con una cuenta distinta. Por
              seguridad, un mismo dispositivo no puede utilizarse en varias
              cuentas simultáneamente.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-medium">Opciones para continuar</p>
          <ul className="list-disc pl-5">
            <li>
              Inicia sesión con la <strong>cuenta original</strong> usada en este dispositivo.
            </li>
            <li>
              O usa <strong>otro navegador</strong> o <strong>perfil</strong> (p. ej., una ventana de invitado).
            </li>
            <li>
              Si crees que es un error, contáctanos.
            </li>
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(homeHref)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Volver al inicio
          </button>

          <button
            onClick={onRetry}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Reintentar
          </button>

          <a
            href={loginHref}
            className="col-span-2 rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-medium hover:bg-gray-50"
          >
            Cambiar de cuenta
          </a>

          <a
            href={supportHref}
            className="col-span-2 rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}
