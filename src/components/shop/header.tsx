import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogIn, LogOut, Menu, Moon, Package, Search, ShieldAlert, ShoppingBag, ShoppingCart, Sun, UserRound } from 'lucide-react'

import { Logo } from './logo'
import { useTheme } from '../theme-provider'
import { useAuth } from '@/lib/state/auth'
import CustomNavLink from './custom-nav-link'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { queries } from '@/lib/queries'

export default function Header() {
    const { theme, setTheme } = useTheme()
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data: cart = null } = useQuery(queries.cart(isAuthenticated))

    const searchTerm = searchParams.get("q") ?? ""
    const [searchInput, setSearchInput] = useState(searchTerm)
    const debouncedSearchTerm = useDebouncedValue(searchInput, 400)

    const updateCatalogFilters = useCallback(
        (updates: { q?: string; category?: string }) => {
            if (location.pathname === "/") {
                // Se siamo già nella home, usiamo setSearchParams in modo funzionale
                // per non dipendere dall'oggetto searchParams nel useCallback
                setSearchParams((prevParams) => {
                    const params = new URLSearchParams(prevParams)

                    if (updates.q !== undefined) {
                        if (updates.q.trim()) params.set("q", updates.q.trim())
                        else params.delete("q")
                    }

                    if (updates.category !== undefined) {
                        if (updates.category && updates.category !== "all") params.set("category", updates.category)
                        else params.delete("category")
                    }

                    params.delete("page")
                    return params
                })
            } else {
                // Se siamo in un'altra pagina (es. /cart), navighiamo verso la home con i parametri
                const params = new URLSearchParams()
                if (updates.q?.trim()) params.set("q", updates.q.trim())
                if (updates.category && updates.category !== "all") params.set("category", updates.category)

                const queryString = params.toString()
                navigate({
                    pathname: "/",
                    search: queryString ? `?${queryString}` : "",
                })
            }
        },
        [location.pathname, navigate, setSearchParams]
    )

    // Sincronizza l'input se l'URL cambia esternamente (es. tasto indietro del browser)
    useEffect(() => {
        setSearchInput(searchTerm)
    }, [searchTerm])

    // Effetto per la ricerca debounced
    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) {
            updateCatalogFilters({ q: debouncedSearchTerm })
        }
    }, [debouncedSearchTerm, searchTerm, updateCatalogFilters])

    // Gestione submit del form per forzare la ricerca immediata saltando il debounce
    const handleSearchSubmit = (e: React.SubmitEvent) => {
        e.preventDefault()
        updateCatalogFilters({ q: searchInput })
    }

    const cartCount = useMemo(() =>
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
        [cart?.items]
    )

    const navItems = [
        { label: "Catalogo", to: "/" },
        { label: "Categorie", to: "/categories" },
    ]

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 gap-4">

                {/* Sezione Sinistra: Logo, Nav Desktop e Barra di Ricerca */}
                <div className="flex items-center gap-6 flex-1 max-w-2xl">
                    <Link className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90" to="/">
                        <Logo className="h-6 w-auto" />
                    </Link>

                    <nav className="hidden items-center gap-5 md:flex shrink-0">
                        {navItems.map((item) => (
                            <CustomNavLink key={item.to} to={item.to}>
                                {item.label}
                            </CustomNavLink>
                        ))}
                    </nav>

                    {/* Input di Ricerca Desktop */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs lg:max-w-sm hidden sm:block">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                        <Input
                            className="h-9 bg-muted/40 pl-9 focus-visible:bg-background transition-colors"
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Cerca prodotti..."
                            value={searchInput}
                        />
                    </form>
                </div>

                {/* Sezione Destra: Pulsanti d'Azione e Profilo */}
                <div className="flex items-center gap-2">

                    {/* Input di Ricerca Mobile (Sotto i 640px) */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:hidden max-w-35">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
                        <Input
                            className="h-8 bg-muted/50 pl-7 text-xs"
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Cerca..."
                            value={searchInput}
                        />
                    </form>

                    {/* Tema Switcher */}
                    <Button
                        aria-label="Cambia tema"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>

                    {/* Pulsante Carrello */}
                    <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full relative"
                        aria-label="Apri carrello"
                    >
                        <Link to="/cart">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full p-0 px-1 text-[10px] font-bold">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>
                    </Button>

                    {/* Dropdown Profilo / Pulsante di Login */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 select-none">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border hover:bg-muted/80 transition-colors">
                                        <UserRound className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl" sideOffset={5}>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/account" className="flex items-center gap-2 w-full cursor-pointer">
                                        <UserRound className="h-4 w-4 text-muted-foreground" /> Gestisci Profilo
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/orders" className="flex items-center gap-2 w-full cursor-pointer">
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" /> I miei ordini
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="text-amber-600 dark:text-amber-400 focus:bg-amber-500/10">
                                            <Link to="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                                                <ShieldAlert className="h-4 w-4" /> Pannello Admin
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        logout();
                                    }}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" /> Disconnetti
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild className="h-9 gap-1.5 px-3 rounded-lg text-sm font-medium">
                            <Link to="/login" state={{ from: `${location.pathname}${location.search}` }}>
                                <LogIn className="h-4 w-4" />
                                <span>Accedi</span>
                            </Link>
                        </Button>
                    )}

                    {/* Menu Trigger Mobile (Disattivato sopra i 768px) */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full md:hidden" aria-label="Apri menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72">
                            <SheetHeader className="text-left pb-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" /> SpringShop
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 pt-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted active:bg-muted/80"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

function useDebouncedValue<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timeout)
        }
    }, [delay, value])

    return debouncedValue
}
