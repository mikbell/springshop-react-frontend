import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/shop/form-field"
import { useAuth } from "@/lib/state/auth"
import { AuthShell } from "@/components/auth/auth-shell"
import { getRedirectTo } from "@/lib/auth-utils"

export function LoginPage() {
    const { isAuthenticated, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const redirectTo = getRedirectTo(location.state)

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, navigate, redirectTo])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const data = new FormData(event.currentTarget)

        try {
            await login({
                email: String(data.get("email")),
                password: String(data.get("password")),
            })

            navigate(redirectTo, { replace: true })
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Login non riuscito. Riprova."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Accedi a SpringShop"
            description="Accedi per gestire il tuo carrello, monitorare gli ordini e salvare i tuoi preferiti."
            footer={
                <>
                    Non hai un account?{" "}
                    <Link
                        className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
                        to="/register"
                        state={location.state}
                    >
                        Registrati ora
                    </Link>
                </>
            }
        >
            <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <Field
                    label="Indirizzo Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nome@esempio.com"
                />

                <Field
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                />

                <Button
                    className="h-10 w-full gap-2 rounded-lg font-medium shadow-sm"
                    disabled={loading}
                    type="submit"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogIn className="h-4 w-4" />
                    )}
                    {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
            </form>
        </AuthShell>
    )
}