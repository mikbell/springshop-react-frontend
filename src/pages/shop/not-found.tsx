import { SearchX } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFound() {
    return (
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <SearchX className="h-8 w-8" />
                </div>

                <span className="text-sm font-medium text-primary">Errore 404</span>

                <h1 className="mt-2 text-4xl font-bold tracking-tight">
                    Pagina non trovata
                </h1>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    La pagina che stai cercando non esiste, è stata rimossa oppure il link
                    non è corretto.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild>
                        <Link to="/">Torna al catalogo</Link>
                    </Button>

                    <Button asChild variant="outline">
                        <Link to="/categories">Sfoglia categorie</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}