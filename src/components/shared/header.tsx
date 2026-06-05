import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogIn, LogOut, Menu, Moon, Package, ShieldAlert, ShoppingBag, ShoppingCart, Sun, UserRound } from 'lucide-react'

import { Logo } from './logo'
import { useTheme } from '../theme-provider'
import { useAuth } from '@/lib/state/auth'
import CustomNavLink from './custom-nav-link'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { queries } from '@/lib/queries'

export default function Header() {
    const { theme, setTheme } = useTheme()
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const { data: cart = null } = useQuery(queries.cart(isAuthenticated))

    // Calcolo reattivo del totale elementi nel carrello
    const cartCount = React.useMemo(() =>
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
        [cart?.items]
    )

    // Navigazione principale snella (Desktop & Mobile)
    const navItems = [
        { label: "Catalogo", to: "/" },
    ]

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4">

                {/* Left Section: Logo & Main Nav */}
                <div className="flex items-center gap-8">
                    <Link className="flex items-center gap-2 transition-opacity hover:opacity-90" to="/">
                        <Logo className="h-6 w-auto" />
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) => (
                            <CustomNavLink key={item.to} to={item.to}>
                                {item.label}
                            </CustomNavLink>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Actions & Auth */}
                <div className="flex items-center gap-1.5">

                    {/* Theme Toggle */}
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

                    {/* Unified Cart Button (Desktop & Mobile) */}
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
                                <Badge className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 px-1 text-[10px] font-bold">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>
                    </Button>

                    {/* User Auth Block */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border">
                                        <UserRound className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl" sideOffset={5}>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
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
                                    onClick={() => void logout()}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" /> Disconnetti
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild>
                            <Link to="/login" state={{ from: `${location.pathname}${location.search}` }}>
                                <LogIn />
                                Accedi
                            </Link>
                        </Button>
                    )}

                    {/* Mobile Menu Trigger */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full md:hidden" aria-label="Apri menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-70">
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
