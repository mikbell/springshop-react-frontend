import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/shop/form-field"
import { useAuth } from "@/lib/state/auth"
import { AuthShell } from "@/components/auth/auth-shell"
import { getRedirectTo } from "@/lib/auth-utils"

export function RegisterPage() {
    const { isAuthenticated, login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const redirectTo = getRedirectTo(location.state)

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true })
        }
    }, [isAuthenticated, navigate, redirectTo])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setFieldErrors({})

        const data = new FormData(event.currentTarget)
        const password = String(data.get("password"))
        const confirmPassword = String(data.get("confirmPassword"))
        const email = String(data.get("email"))

        const localErrors: Record<string, string> = {}

        if (password.length < 8) {
            localErrors.password = "La password deve contenere almeno 8 caratteri."
        }

        if (password !== confirmPassword) {
            localErrors.confirmPassword = "Le password inserite non coincidono."
        }

        if (Object.keys(localErrors).length > 0) {
            setFieldErrors(localErrors)
            setLoading(false)
            return
        }

        try {
            await register({
                firstName: String(data.get("firstName")),
                lastName: String(data.get("lastName")),
                email,
                password,
                phoneNumber: String(data.get("phoneNumber") || ""),
                role: "CUSTOMER",
            })

            await login({ email, password })
            navigate(redirectTo, { replace: true })
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Registrazione non riuscita. Verifica i dati."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Crea account SpringShop"
            description="Crea un account cliente per salvare i tuoi indirizzi di spedizione e velocizzare i pagamenti."
            footer={
                <>
                    Hai già un account?{" "}
                    <Link
                        className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
                        to="/login"
                        state={location.state}
                    >
                        Accedi
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

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome" name="firstName" autoComplete="given-name" />
                    <Field label="Cognome" name="lastName" autoComplete="family-name" />
                </div>

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
                    autoComplete="new-password"
                    placeholder="Minimo 8 caratteri"
                    error={fieldErrors.password}
                />

                <Field
                    label="Conferma Password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Ripeti la password scelta"
                    error={fieldErrors.confirmPassword}
                />

                <Button
                    className="h-10 w-full gap-2 rounded-lg font-medium shadow-sm"
                    disabled={loading}
                    type="submit"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    {loading ? "Creazione account..." : "Crea account"}
                </Button>
            </form>
        </AuthShell>
    )
}