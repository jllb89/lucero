"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/app/components/custom-ui/button";
import { Input } from "@/app/components/custom-ui/input";
import { Label } from "@/app/components/custom-ui/label";
import { Checkbox } from "@/app/components/custom-ui/checkbox";

import { PixelTrail } from "@/components/login-background/pixel-trail";
import { GooeyFilter } from "@/components/login-background/gooey-filter";
import { useScreenSize } from "@/components/login-background/hooks/use-screen-size";

export default function AdminLoginPage() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const screenSize = useScreenSize();

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
  
    if (!res.ok || !data.role) {
      toast.error("Access denied.");
      return;
    }
  
    if (data.role === "ADMIN" || data.role === "SUPER_ADMIN") {
      toast.success("Bienvenido admin. Redirigiendo...");
      router.push("/admin");
    } else if (data.role === "USER") {
      toast.success("Bienvenido. Redirigiendo...");
      router.push("/dashboard");
    } else {
      toast.error("Rol desconocido.");
    }
  };  

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left side */}
      <div className="relative w-full md:w-1/2 h-[20vh] md:h-auto bg-black overflow-hidden">
        <img
          src="https://images.aiscribbles.com/34fe5695dbc942628e3cad9744e8ae13.png?v=60d084"
          alt="login background"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />
        <div className="absolute inset-0 z-0" style={{ filter: "url(#gooey-filter-pixel-trail)" }}>
          <PixelTrail
            pixelSize={screenSize.lessThan("md") ? 24 : 32}
            fadeDuration={0}
            delay={500}
            pixelClassName="bg-white"
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h1 className="text-white text-5xl md:text-7xl font-calendas font-bold text-center max-w-[70%] leading-tight">
            Editorial Lucero
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full md:w-1/2 h-[80vh] md:h-auto bg-gray-100 px-4 flex flex-col md:justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6 mt-8 md:mt-0">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gray-300">
              <svg className="stroke-black" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
              </svg>
            </div>
            <h1 className="text-lg font-medium text-gray-800 text-center">Bienvenido</h1>
            <p className="text-sm text-gray-500 text-center font-light">
              Introduce tu correo electrónico y contraseña para acceder.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
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
                  className="border-gray-300 placeholder:text-gray-400 text-black font-light"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor={`${id}-password`} className="text-black">
                  Contraseña
                </Label>
                <Input
                  id={`${id}-password`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Introduce tu contraseña"
                  className="border-gray-300 placeholder:text-gray-400 text-black font-light pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/6 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox id={`${id}-remember`} />
                <Label htmlFor={`${id}-remember`} className="text-gray-500 font-normal">
                  Recuérdame
                </Label>
              </div>
              <a className="text-sm text-gray-500 underline hover:no-underline" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900"
              style={{ borderRadius: "6px" }}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
