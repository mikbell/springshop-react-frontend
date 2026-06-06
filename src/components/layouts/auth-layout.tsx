import * as React from "react"
import { Outlet, useNavigate, Link } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { Logo } from "@/components/shop/logo"
import bg from "@/assets/auth-background.jpg"

import { useAuth } from "@/lib/state/auth"

export function AuthLayout() {
    const { isAuthenticated, isAdmin } = useAuth()
    const navigate = useNavigate()

    React.useEffect(() => {
        if (isAuthenticated) {
            if (isAdmin) {
                navigate("/admin", { replace: true })
            } else {
                navigate("/", { replace: true })
            }
        }
    }, [isAuthenticated, isAdmin, navigate])

    if (isAuthenticated) return null

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-2 bg-background">

            {/* Pannello Decorativo Sinistro (Visibile solo da LG in su) */}
            <div className="relative hidden flex-col justify-between bg-muted p-10 text-white lg:flex overflow-hidden">

                {/* Immagine di sfondo con overlay ad alto contrasto */}
                <img
                    src={bg}
                    alt="Sfondo decorativo"
                    className="absolute inset-0 h-full w-full object-cover object-center select-none animate-in fade-in duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-b from-zinc-950/60 via-zinc-900/50 to-zinc-950/80 z-10" />

                {/* Header superiore: Logo */}
                <div className="relative z-20 flex items-center gap-2">
                    <Link
                        to="/"
                        className="transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                    >
                        <Logo className="h-7 w-auto brightness-0 invert" />
                    </Link>
                </div>

                {/* Footer inferiore: Citazione e Sicurezza */}
                <div className="relative z-20 mt-auto backdrop-blur-md bg-zinc-950/30 p-6 rounded-xl border border-white/10 shadow-2xl">
                    <blockquote className="space-y-3">
                        <p className="text-lg font-normal leading-relaxed text-zinc-100 tracking-tight">
                            &ldquo;Fai fiorire il tuo business. Accedi per gestire i tuoi ordini o per amministrare il catalogo e le scorte in tempo reale.&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-zinc-300 flex items-center gap-2 pt-2 border-t border-white/10">
                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="tracking-wide uppercase text-[11px] font-semibold text-zinc-300">
                                Accesso Unificato e Protetto
                            </span>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Pannello Contenuto Destro (Form di Login / Register) */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-10 md:p-16 relative">
                <div className="w-full max-w-md mx-auto space-y-6">
                    {/* Logo visibile solo su Mobile/Tablet per non perdere il brand */}
                    <div className="flex justify-center lg:hidden mb-2">
                        <Link to="/">
                            <Logo className="h-8 w-auto" />
                        </Link>
                    </div>
                    <Outlet />
                </div>
            </div>

        </div>
    )
}