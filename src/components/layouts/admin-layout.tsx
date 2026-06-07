import * as React from "react"
import {
    Link,
    NavLink,
    Navigate,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
    AlertTriangle,
    ChevronLeft,
    LayoutDashboard,
    Layers,
    LogOut,
    Package,
    ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/state/auth"
import { cn } from "@/lib/utils"

interface SidebarItem {
    title: string
    href: string
    icon: LucideIcon
    match?: (pathname: string) => boolean
}

const sidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        match: (pathname) => pathname === "/admin",
    },
    {
        title: "Prodotti",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Categorie",
        href: "/admin/categories",
        icon: Layers,
    },
    {
        title: "Ordini",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Scorte Critiche",
        href: "/admin/low-stock",
        icon: AlertTriangle,
    },
]

function getPageTitle(pathname: string) {
    if (pathname === "/admin") return "Dashboard"
    if (pathname === "/admin/products/create") return "Nuovo Prodotto"
    if (pathname.includes("/admin/products/") && pathname.endsWith("/edit")) {
        return "Modifica Prodotto"
    }

    const currentItem = sidebarItems.find((item) => {
        if (item.match) return item.match(pathname)
        return pathname === item.href || pathname.startsWith(`${item.href}/`)
    })

    return currentItem?.title ?? "Amministrazione"
}

export function AdminLayout() {
    const { isAdmin, logout } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)

    const currentPageTitle = React.useMemo(() => {
        return getPageTitle(pathname)
    }, [pathname])

    async function handleLogout() {
        try {
            setIsLoggingOut(true)
            await logout()
            navigate("/login", { replace: true })
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (!isAdmin) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <aside
                className={cn(
                    "relative z-20 flex shrink-0 flex-col border-r bg-card transition-[width] duration-300 ease-in-out",
                    isSidebarOpen ? "w-64" : "w-[4.5rem]"
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                    <Link
                        to="/admin"
                        className={cn(
                            "flex min-w-0 items-center gap-2 font-bold tracking-tight text-primary transition-opacity",
                            !isSidebarOpen && "pointer-events-none opacity-0"
                        )}
                        aria-hidden={!isSidebarOpen}
                        tabIndex={isSidebarOpen ? 0 : -1}
                    >
                        <span className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                            CMS
                        </span>
                        <span className="truncate">Backoffice</span>
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen((value) => !value)}
                        className={cn("h-8 w-8 rounded-lg", !isSidebarOpen && "mx-auto")}
                        aria-label={
                            isSidebarOpen
                                ? "Riduci barra laterale"
                                : "Espandi barra laterale"
                        }
                        aria-expanded={isSidebarOpen}
                    >
                        <ChevronLeft
                            className={cn(
                                "h-4 w-4 transition-transform",
                                !isSidebarOpen && "rotate-180"
                            )}
                        />
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 p-3" aria-label="Navigazione admin">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/admin"}
                                title={!isSidebarOpen ? item.title : undefined}
                                className={({ isActive }) =>
                                    cn(
                                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        !isSidebarOpen && "justify-center px-0"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                isActive
                                                    ? "text-current"
                                                    : "text-muted-foreground/70 group-hover:text-foreground"
                                            )}
                                        />

                                        <span
                                            className={cn(
                                                "truncate transition-[opacity,width] duration-200",
                                                !isSidebarOpen && "w-0 overflow-hidden opacity-0"
                                            )}
                                        >
                                            {item.title}
                                        </span>

                                        {!isSidebarOpen && (
                                            <span className="pointer-events-none absolute left-14 z-30 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-normal text-popover-foreground opacity-0 shadow-md transition-opacity delay-150 group-hover:opacity-100">
                                                {item.title}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="border-t bg-muted/30 p-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                        className={cn(
                            "w-full justify-start gap-3 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                        title={!isSidebarOpen ? "Esci" : undefined}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className={cn(!isSidebarOpen && "hidden")}>
                            {isLoggingOut ? "Uscita..." : "Esci"}
                        </span>
                    </Button>
                </div>
            </aside>

            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
                            {currentPageTitle}
                        </h1>
                    </div>

                    <div className="hidden flex-col items-end text-right sm:flex">
                        <span className="text-sm font-medium leading-none">
                            Amministratore
                        </span>
                        <span className="mt-0.5 text-xs text-muted-foreground">
                            Sessione attiva
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in-30 duration-200">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}