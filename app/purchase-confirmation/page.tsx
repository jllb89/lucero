"use client";

import { Inter } from "next/font/google";
import { CartProvider, useCart } from "../../hooks/useCart";

const inter = Inter({ subsets: ["latin"] });

function ConfirmationContent() {
  const { clear } = useCart();
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left side: same as login */}
      <div className="relative w-full md:w-1/2 h-[20vh] md:h-auto bg-black overflow-hidden">
        <img
          src="https://images.aiscribbles.com/34fe5695dbc942628e3cad9744e8ae13.png?v=60d084"
          alt="login background"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h1 className={["text-white text-5xl md:text-7xl font-calendas font-bold text-center max-w-[70%] leading-tight", inter.className].join(" ")}>
            Editorial Lucero
          </h1>
        </div>
      </div>
      {/* Right side: generic confirmation */}
      <div className="w-full md:w-1/2 h-[80vh] md:h-auto bg-gray-100 px-4 flex flex-col md:justify-center items-center">
        <div className={["max-w-xl w-full rounded-2xl  p-10 flex flex-col gap-6", inter.className].join(" ")}>
          <h1 className="text-4xl md:text-5xl font-medium ls--3 text-black mb-2">¡Gracias por tu compra!</h1>
          <div className="text-gray-600 text-md md:text-md font-light ">
            Tu compra fue exitosa. Recibirás un correo electrónico con los detalles de tu pedido.
          </div>
          <div className="text-black font-medium mt-2">
            Si tienes dudas, contáctanos en el siguiente correo: lcastr60@gmail.com
          </div>
          <button
            className="mt-8 bg-black hover:bg-lucero-dark text-white font-semibold py-3 px-8 rounded-xl transition-colors text-lg"
            onClick={() => {
              // Remove cart cookie
              document.cookie = 'cart=; Max-Age=0; path=/';
              // Remove cart from localStorage/sessionStorage if used
              localStorage.removeItem('cart');
              sessionStorage.removeItem('cart');
              // Clear React cart context
              clear();
              // Redirect to home
              window.location.href = '/';
            }}
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseConfirmationPage() {
  return (
    <CartProvider>
      <ConfirmationContent />
    </CartProvider>
  );
}