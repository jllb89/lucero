"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/app/components/custom-ui/button";
import { Input } from "@/app/components/custom-ui/input";
import { Label } from "@/app/components/custom-ui/label";
import { Checkbox } from "@/app/components/custom-ui/checkbox";

export default function AdminLoginPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || (data.role !== "ADMIN" && data.role !== "SUPER_ADMIN")) {
      toast.error("Access denied: Only admins can log in.");
      return;
    }

    toast.success("Success! Redirecting to admin panel...");
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gray-300"
            aria-hidden="true"
          >
            <svg
              className="stroke-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
            >
              <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-black text-center">Bienvenido a Lucero LAN.</h1>
          <p className="text-sm text-gray-500 text-center font-light">
            Introduce tu correo electrónico y contraseña para acceder.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`} className="text-black">
                Correo electrónico
              </Label>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@correo.com"
                className="border-gray-300 placeholder:text-gray-400 font-light text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`} className="text-black">
                Contraseña
              </Label>
              <Input
                id={`${id}-password`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Introduce tu contraseña"
                className="border-gray-300 placeholder:text-gray-400 font-light text-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id={`${id}-remember`}  className="border-gray-300"/>
              <Label htmlFor={`${id}-remember`} className="text-gray-500 font-light font-normal">
                Recuérdame
              </Label>
            </div>
            <a className="text-sm text-gray-500 underline font-light hover:no-underline" href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-black/90"
            style={{ borderRadius: "6px" }}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}
