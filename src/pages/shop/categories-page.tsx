import { useQuery } from "@tanstack/react-query"
import { Folder, ChevronRight, Layers } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { queries } from "@/lib/queries"

export function CategoriesPage() {
    // Rimuoviamo la dipendenza `isAdmin` assumendo che questa sia la vista pubblica delle categorie
    const { data: categories = [], isLoading } = useQuery(queries.categories())

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">

            {/* Intestazione Sezione */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>Sfoglia le Categorie</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                    Esplora il nostro catalogo prodotti diviso per reparti.
                </p>
            </div>

            {/* Stato di Caricamento (Skeleton Loader) */}
            {isLoading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} className="shadow-sm">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-4 w-2/3 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                /* Stato Vuoto */
                <div className="flex min-h-62.5 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
                    <Folder className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium">Nessuna categoria disponibile al momento.</p>
                </div>
            ) : (
                /* Lista Categorie in Griglia Moderna */
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/?category=${encodeURIComponent(category.slug)}`}
                            className="group block"
                        >
                            <Card className="shadow-sm border transition-all duration-200 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-0.5 bg-card text-card-foreground">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <h2 className="font-semibold tracking-tight text-sm truncate group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h2>
                                        {category.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
