import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Loader2,
    Package,
    ShoppingCart,
    Star,
} from "lucide-react"
import { Link } from "react-router-dom"

import { cartApi } from "@/lib/api/handlers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { formatMoney, resolveAssetUrl } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types/api"

export default function ProductDetailSection({ product, isAuthenticated }: { product: Product, isAuthenticated: boolean }) {

    const unavailable =
        product.stockQuantity <= 0 || product.status !== "AVAILABLE"
    const imageUrl = resolveAssetUrl(product.imageUrl)
    const productId = product?.id ?? ""
    const queryClient = useQueryClient()

    const addToCartMutation = useMutation({
        mutationFn: () => {
            if (!productId) {
                throw new Error("Prodotto non caricato.")
            }
            return cartApi.add(productId, 1)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
        },
    })


    return (
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
            <div className="overflow-hidden rounded-2xl border bg-muted shadow-sm">
                <div className="flex aspect-4/3 items-center justify-center md:aspect-square lg:aspect-16/10">
                    {imageUrl ? (
                        <img
                            alt={product.name}
                            className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                            src={imageUrl}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground/60">
                            <div className="rounded-full bg-background/80 p-4 shadow-sm">
                                <Package className="h-12 w-12 stroke-[1.2]" />
                            </div>
                            <span className="text-sm">Immagine non disponibile</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border bg-card p-5 shadow-sm lg:p-6">
                <div className="flex flex-wrap gap-2">
                    <Badge asChild variant="secondary" className="px-2.5 py-1">
                        <Link
                            to={product.category ? `/?category=${product.category.slug}` : "/categories"}
                            className="hover:underline"
                        >
                            {product.category?.name ?? "Senza categoria"}
                        </Link>
                    </Badge>

                    <Badge variant="outline" className="px-2.5 py-1 font-mono text-muted-foreground">
                        SKU: {product.sku}
                    </Badge>

                    <Badge
                        variant={unavailable ? "destructive" : "secondary"}
                        className={cn(
                            "px-2.5 py-1",
                            !unavailable &&
                            "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                        )}
                    >
                        {unavailable ? "Non disponibile" : "Disponibile"}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                        {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <div className="flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-amber-600 dark:text-amber-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 font-semibold">
                                {product.averageRating?.toFixed(1) ?? "N/D"}
                            </span>
                        </div>

                        <span className="text-muted-foreground">
                            {product.reviewCount} recensioni utenti
                        </span>
                    </div>
                </div>

                <p className="text-base leading-7 whitespace-pre-line text-muted-foreground">
                    {product.description ?? "Nessuna descrizione disponibile per questo articolo."}
                </p>

                <div className="mt-auto rounded-2xl border bg-muted/20 p-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Prezzo al pubblico
                    </span>

                    <div className="mt-1 text-4xl font-extrabold tracking-tight">
                        {formatMoney(product.price)}
                    </div>

                    <Button
                        className="mt-5 h-12 w-full gap-2 text-base shadow-sm transition active:scale-[0.99]"
                        disabled={
                            !isAuthenticated ||
                            unavailable ||
                            !productId ||
                            addToCartMutation.isPending
                        }
                        onClick={() => void addToCartMutation.mutateAsync()}
                        type="button"
                    >
                        {addToCartMutation.isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Aggiunta in corso...
                            </>
                        ) : unavailable ? (
                            "Prodotto esaurito"
                        ) : !isAuthenticated ? (
                            "Accedi per acquistare"
                        ) : (
                            <>
                                <ShoppingCart className="h-5 w-5" />
                                Aggiungi al carrello
                            </>
                        )}
                    </Button>

                    {!isAuthenticated && (
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Effettua l’accesso per aggiungere questo prodotto al carrello.
                        </p>
                    )}

                    {unavailable && (
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Il prodotto non è disponibile al momento.
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}
