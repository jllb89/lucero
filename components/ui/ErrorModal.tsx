"use client";

export default function ErrorModal({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 shadow-xl max-w-sm text-center">
        <h2 className="text-lg font-semibold mb-4">Oops!</h2>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-sm text-sm"
        >
          Reload
        </button>
      </div>
    </div>
  );
}