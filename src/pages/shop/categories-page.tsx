import { useQuery } from "@tanstack/react-query"
import { ChevronRight, Folder, Layers } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { queries } from "@/lib/queries"

export function CategoriesPage() {
    const { data: categories = [], isLoading } = useQuery(queries.categories())

    return (
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:py-8">
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Layers className="h-5 w-5" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Sfoglia le categorie
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Esplora il catalogo prodotti diviso per reparti.
                        </p>
                    </div>
                </div>
            </section>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-center justify-between gap-4 p-5">
                                <div className="w-full space-y-2">
                                    <Skeleton className="h-4 w-2/3 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="flex min-h-62.5 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-8 text-center animate-in fade-in-50">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Folder className="h-6 w-6" />
                    </div>

                    <h2 className="font-semibold text-foreground">
                        Nessuna categoria disponibile
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Le categorie verranno mostrate qui appena saranno disponibili.
                    </p>
                </div>
            ) : (
                <section className="grid gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {categories.length} categorie disponibili
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/?category=${encodeURIComponent(category.slug)}`}
                                className="group block focus-visible:outline-none"
                            >
                                <Card className="h-full rounded-2xl border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                                    <CardContent className="flex h-full items-center justify-between gap-4 p-5">
                                        <div className="min-w-0 space-y-1">
                                            <h2 className="truncate text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
                                                {category.name}
                                            </h2>

                                            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                {category.description || "Scopri i prodotti di questa categoria."}
                                            </p>
                                        </div>

                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}