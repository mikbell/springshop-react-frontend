import { NavLink } from "react-router-dom"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { ShieldAlert, Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const adminNavItems = [
  { label: "Dashboard", to: "/admin" },
  { label: "Prodotti", to: "/admin/products" },
  { label: "Categorie", to: "/admin/categories" },
  { label: "Ordini", to: "/admin/orders" },
  { label: "Scorte basse", to: "/admin/low-stock" },
]

export function AdminPageShell({
  children,
  isAdmin,
  title,
}: {
  children: React.ReactNode
  isAdmin: boolean
  title: string
}) {
  // Schermata di accesso negato modernizzata
  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">Accesso Negato</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">
          Questa sezione è riservata esclusivamente agli amministratori del sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 py-6">
      {/* Header dello Shell */}
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>

        {/* Navigazione Tabs Moderna */}
        <nav className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted p-1 sm:self-start">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-8 px-3 text-xs font-medium rounded-md transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Contenuto della pagina */}
      <main className="animate-in fade-in duration-200">
        {children}
      </main>
    </div>
  )
}

export function AdminLoading() {
  return (
    <div className="grid min-h-100 place-items-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs font-medium">Caricamento pannello...</p>
      </div>
    </div>
  )
}