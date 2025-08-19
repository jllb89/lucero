"use client";

import { useState, useId } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/app/components/custom-ui/button";
import { Input } from "@/app/components/custom-ui/input";
import { Label } from "@/app/components/custom-ui/label";
import { PixelTrail } from "@/components/login-background/pixel-trail";
import { GooeyFilter } from "@/components/login-background/gooey-filter";
import { useScreenSize } from "@/components/login-background/hooks/use-screen-size";

export default function SetPasswordPage() {
    const id = useId();
    const router = useRouter();
    const searchParams = useSearchParams();
    const screenSize = useScreenSize();

    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Por favor completa ambos campos.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }), // ✅ Use `token`
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al guardar la contraseña.");

            toast.success("¡Contraseña establecida! Redirigiendo...");
            router.push("/login");
        } catch (error: any) {
            console.error("❌ Error:", error);
            toast.error(error.message || "Algo salió mal.");
        } finally {
            setLoading(false);
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
                        <h1 className="text-lg font-medium text-gray-800 text-center">Establece tu contraseña</h1>
                        <p className="text-sm text-gray-500 text-center font-light">
                            Crea una contraseña para acceder a tu cuenta.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Password input */}
                            <div className="space-y-2 relative">
                                <Label htmlFor={`${id}-password`} className="text-black">
                                    Contraseña
                                </Label>
                                <Input
                                    id={`${id}-password`}
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Establece tu contraseña"
                                    className="border-gray-300 placeholder:text-gray-400 text-black font-light pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 inset-y-8 my-auto text-gray-500 hover:text-black"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Confirm password input */}
                            <div className="space-y-2 relative">
                                <Label htmlFor={`${id}-confirm-password`} className="text-black">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id={`${id}-confirm-password`}
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirma tu contraseña"
                                    className="border-gray-300 placeholder:text-gray-400 text-black font-light pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 inset-y-8 my-auto text-gray-500 hover:text-black"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-gray-900"
                            style={{ borderRadius: "6px" }}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Establecer contraseña"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
