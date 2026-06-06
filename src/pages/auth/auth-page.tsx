import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Loader2, LogIn, UserPlus, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/state/auth"
import { Field } from "@/components/shop/form-field"

type LocationState = {
  from?: string
}

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
      setError(caught instanceof Error ? caught.message : "Login non riuscito. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      description="Accedi per gestire il tuo carrello, monitorare gli ordini e salvare i tuoi preferiti."
      footer={
        <>
          Non hai un account?{" "}
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline transition-colors"
            to="/register"
            state={location.state}
          >
            Registrati ora
          </Link>
        </>
      }
      title="Accedi a SpringShop"
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

        <Button className="w-full gap-2 rounded-lg shadow-sm h-10 font-medium" disabled={loading} type="submit">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          <span>{loading ? "Accesso in corso..." : "Accedi"}</span>
        </Button>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = getRedirectTo(location.state)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Teniamo traccia degli errori sui singoli campi, inclusa la conferma password
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

    // --- VALIDAZIONE LOCALE DELLA CONFERMA PASSWORD ---
    const localErrors: Record<string, string> = {}

    if (password.length < 8) {
      localErrors.password = "La password deve contenere almeno 8 caratteri."
    }

    if (password !== confirmPassword) {
      localErrors.confirmPassword = "Le password inserite non coincidono."
    }

    // Se ci sono errori di validazione locali, blocchiamo l'invio
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors)
      setLoading(false)
      return
    }
    // --------------------------------------------------

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
      setError(caught instanceof Error ? caught.message : "Registrazione non riuscita. Verifica i dati.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      description="Crea un account cliente per salvare i tuoi indirizzi di spedizione e velocizzare i pagamenti."
      footer={
        <>
          Hai già un account?{" "}
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline transition-colors"
            to="/login"
            state={location.state}
          >
            Accedi
          </Link>
        </>
      }
      title="Crea account SpringShop"
    >
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Campi Nome e Cognome affiancati */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" name="firstName" autoComplete="given-name" placeholder="Mario" />
          <Field label="Cognome" name="lastName" autoComplete="family-name" placeholder="Rossi" />
        </div>

        <Field label="Indirizzo Email" name="email" type="email" autoComplete="email" placeholder="nome@esempio.com" />

        {/* Campo Nuova Password */}
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimo 8 caratteri"
          error={fieldErrors.password}
        />

        {/* Campo Conferma Password */}
        <Field
          label="Conferma Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Ripeti la password scelta"
          error={fieldErrors.confirmPassword}
        />

        <Button className="w-full gap-2 rounded-lg shadow-sm h-10 font-medium" disabled={loading} type="submit">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          <span>{loading ? "Creazione account..." : "Crea account"}</span>
        </Button>
      </form>
    </AuthShell>
  )
}

function AuthShell({
  children,
  description,
  footer,
  title,
}: {
  children: React.ReactNode
  description: string
  footer: React.ReactNode
  title: string
}) {
  return (
    <div className="grid min-h-[calc(100svh-7rem)] place-items-center py-6 px-4">
      <Card className="w-full max-w-md shadow-md border rounded-xl animate-in fade-in-50 duration-200">
        <CardHeader className="space-y-1.5 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-2">
            {footer}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRedirectTo(state: unknown) {
  const from = (state as LocationState | null)?.from

  if (!from || from === "/login" || from === "/register") {
    return "/"
  }

  return from.startsWith("/") ? from : "/"
}