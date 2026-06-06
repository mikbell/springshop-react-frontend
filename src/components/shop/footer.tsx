import { Link } from 'react-router-dom'

import { Logo } from './logo'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t bg-background/95 pt-12 pb-8">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">

                    {/* Colonna 1: Brand e Info */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                            <Logo />
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            La tua destinazione preferita per lo shopping online. Scopri le ultime tendenze e prodotti di altissima qualità, direttamente a casa tua.
                        </p>
                    </div>

                    {/* Colonna 2: Navigazione Principale */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                            Esplora
                        </h3>
                        <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <Link to="/" className="w-fit hover:text-primary transition-colors">Catalogo Prodotti</Link>
                            <Link to="/categories" className="w-fit hover:text-primary transition-colors">Tutte le Categorie</Link>
                            <Link to="/about" className="w-fit hover:text-primary transition-colors">Chi Siamo</Link>
                            <Link to="/blog" className="w-fit hover:text-primary transition-colors">Il nostro Blog</Link>
                        </nav>
                    </div>

                    {/* Colonna 3: Supporto Clienti */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                            Supporto
                        </h3>
                        <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <Link to="/contact" className="w-fit hover:text-primary transition-colors">Contattaci</Link>
                            <Link to="/faq" className="w-fit hover:text-primary transition-colors">Domande Frequenti (FAQ)</Link>
                            <Link to="/returns" className="w-fit hover:text-primary transition-colors">Resi e Rimborsi</Link>
                            <Link to="/shipping" className="w-fit hover:text-primary transition-colors">Spedizioni</Link>
                        </nav>
                    </div>

                    {/* Colonna 4: Newsletter e Social */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                            Resta Aggiornato
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Iscriviti alla newsletter per ricevere offerte esclusive e novità in anteprima.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                type="email"
                                placeholder="La tua email..."
                                className="h-9 bg-muted/40 focus-visible:bg-background"
                                required
                            />
                            <Button type="submit" size="sm" className="h-9 px-4">
                                Iscriviti
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer Bottom: Copyright e Legali */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
                    <p>© {currentYear} SpringShop. Tutti i diritti riservati.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Termini di Servizio</Link>
                        <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}