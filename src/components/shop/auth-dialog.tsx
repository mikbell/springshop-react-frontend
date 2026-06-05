import * as React from "react"
import { Loader2, LogIn, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/state/auth"

type AuthDialogProps = {
  trigger?: React.ReactNode
}

export function AuthDialog({ trigger }: AuthDialogProps) {
  const { login, register } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState("login")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    try {
      await login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      })
      setOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login non riuscito")
    } finally {
      setLoading(false)
    }
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const data = new FormData(event.currentTarget)
    try {
      await register({
        firstName: String(data.get("firstName")),
        lastName: String(data.get("lastName")),
        email: String(data.get("email")),
        password: String(data.get("password")),
        phoneNumber: String(data.get("phoneNumber") || ""),
        role: "CUSTOMER",
      })
      await login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      })
      setOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registrazione non riuscita")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <LogIn />
            Accedi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account SpringShop</DialogTitle>
          <DialogDescription>
            Accedi per carrello, ordini, wishlist e recensioni.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              <LogIn />
              Login
            </TabsTrigger>
            <TabsTrigger value="register">
              <UserPlus />
              Registrati
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form className="grid gap-4" onSubmit={onLogin}>
              <Field label="Email" name="email" type="email" autoComplete="email" />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button disabled={loading} type="submit">
                {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
                Accedi
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form className="grid gap-4" onSubmit={onRegister}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome" name="firstName" autoComplete="given-name" />
                <Field label="Cognome" name="lastName" autoComplete="family-name" />
              </div>
              <Field label="Email" name="email" type="email" autoComplete="email" />
              <Field label="Telefono" name="phoneNumber" autoComplete="tel" required={false} />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button disabled={loading} type="submit">
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Crea account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  name,
  required = true,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} {...props} />
    </div>
  )
}
