import * as React from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
    LayoutDashboard,
    Layers,
    Package,
    AlertTriangle,
    LogOut,
    ChevronLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/state/auth"
import { cn } from "@/lib/utils"

interface SidebarItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const sidebarItems: SidebarItem[] = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Prodotti", href: "/admin/products", icon: Package },
    { title: "Categorie", href: "/admin/categories", icon: Layers },
    { title: "Scorte Critiche", href: "/admin/low-stock", icon: AlertTriangle },
]

export function AdminLayout() {
    const { isAdmin, logout } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

    // Protezione centralizzata (Miglior peer-security)
    React.useEffect(() => {
        if (!isAdmin) {
            navigate("/login", { replace: true })
        }
    }, [isAdmin, navigate])

    // Genera il titolo della pagina in base alla rotta attuale
    const currentPageTitle = React.useMemo(() => {
        if (pathname === "/admin") return "Dashboard"
        if (pathname.includes("/products/create")) return "Nuovo Prodotto"
        const match = sidebarItems.find(item => item.href === pathname)
        return match ? match.title : "Amministrazione"
    }, [pathname])

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    if (!isAdmin) return null

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">

            {/* 1. SIDEBAR (Navigazione Principale) */}
            <aside
                className={cn(
                    "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out z-20",
                    isSidebarOpen ? "w-64" : "w-17.5"
                )}
            >
                {/* Header Sidebar */}
                <div className="flex h-16 items-center justify-between px-4 border-b">
                    <Link
                        to="/admin"
                        className={cn(
                            "flex items-center gap-2 font-bold tracking-tight text-primary transition-opacity",
                            !isSidebarOpen && "opacity-0 pointer-events-none"
                        )}
                    >
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">CMS</span>
                        <span>Backoffice</span>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn("h-8 w-8 rounded-lg", !isSidebarOpen && "mx-auto")}
                        aria-label={isSidebarOpen ? "Riduci barra laterale" : "Espandi barra laterale"}
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
                    </Button>
                </div>

                {/* Links di Navigazione */}
                <nav className="flex-1 space-y-1 p-3">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-current" : "text-muted-foreground/70 group-hover:text-foreground")} />
                                <span className={cn("transition-opacity duration-200", !isSidebarOpen && "opacity-0 w-0 overflow-hidden")}>
                                    {item.title}
                                </span>

                                {/* Tooltip quando la sidebar è contratta */}
                                {!isSidebarOpen && (
                                    <div className="absolute left-16 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-popover text-popover-foreground text-xs font-normal px-2.5 py-1.5 rounded-md shadow-md border delay-150 transition-all z-30 whitespace-nowrap">
                                        {item.title}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Sidebar (Logout) */}
                <div className="p-3 border-t bg-muted/30">
                    <Button
                        variant="ghost"
                        onClick={() => void handleLogout()}
                        className={cn(
                            "w-full justify-start gap-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className={cn(!isSidebarOpen && "hidden")}>Esci</span>
                    </Button>
                </div>
            </aside>

            {/* 2. AREA CONTENUTO (TopBar + Router Outlet) */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">

                {/* Barra Superiore (TopBar) */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {currentPageTitle}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Indicatore Ruolo Critico */}
                        <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-sm font-medium leading-none">Amministratore</span>
                            <span className="text-xs text-muted-foreground mt-0.5">Sessione attiva</span>
                        </div>
                    </div>
                </header>

                {/* Contenuto della Sotto-Pagina */}
                <main className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in-30 duration-200">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    )
}