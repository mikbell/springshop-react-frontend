import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Package, Send, ShoppingCart, Star } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"

import { cartApi, reviewsApi } from "@/api/handlers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/state/auth"
import { cn } from "@/lib/utils"

export function ProductPage() {
    const { slug } = useParams()
    const { isAuthenticated } = useAuth()
    const queryClient = useQueryClient()
    const productSlug = slug ?? ""

    // Stato locale per gestire il selettore di rating interattivo nella form
    const [formRating, setFormRating] = React.useState<number>(5)

    const { data: product, error, isLoading } = useQuery(queries.productBySlug(productSlug))
    const productId = product?.id ?? ""
    const { data: reviewPage, isLoading: loadingReviews } = useQuery(queries.reviews(productId, { size: 6 }))

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

    const reviewMutation = useMutation({
        mutationFn: (payload: { rating: number; comment: string }) => {
            if (!productId) {
                throw new Error("Prodotto non caricato.")
            }
            return reviewsApi.create(productId, payload)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productId) })
            void queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) })
            void queryClient.invalidateQueries({ queryKey: queryKeys.productBySlug(productSlug) })
            void queryClient.invalidateQueries({ queryKey: queryKeys.products })
            setFormRating(5) // Reset del rating locale
        },
    })

    if (!slug) {
        return <Navigate replace to="/" />
    }

    if (isLoading) {
        return (
            <div className="flex min-h-100 flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Caricamento prodotto...</p>
            </div>
        )
    }

    if (error instanceof Error || !product) {
        return (
            <div className="mx-auto max-w-md grid gap-4 rounded-xl border border-destructive/30 p-6 bg-destructive/5 text-center my-12">
                <p className="font-semibold text-destructive">
                    {error instanceof Error ? error.message : "Prodotto non trovato o non disponibile."}
                </p>
                <Button asChild className="mx-auto w-fit" variant="outline">
                    <Link to="/" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Torna al Catalogo
                    </Link>
                </Button>
            </div>
        )
    }

    const unavailable = product.stockQuantity <= 0 || product.status !== "ACTIVE"
    const reviews = reviewPage?.content ?? []

    async function submitReview(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)

        await reviewMutation.mutateAsync({
            rating: formRating,
            comment: String(data.get("comment") || ""),
        })
        form.reset()
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 py-6 grid gap-8">
            {/* Back Button */}
            <Button asChild className="w-fit -ml-2 text-muted-foreground hover:text-foreground" variant="ghost">
                <Link to="/" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Torna al catalogo</span>
                </Link>
            </Button>

            {/* Main Product Section */}
            <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_460px]">
                {/* Product Image Wrapper */}
                <div className="overflow-hidden rounded-xl border bg-muted shadow-sm aspect-4/3 md:aspect-square lg:aspect-16/10 flex items-center justify-center">
                    {product.imageUrl ? (
                        <img
                            alt={product.name}
                            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-102"
                            src={product.imageUrl}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                            <Package className="h-16 w-16 stroke-[1.2]" />
                            <span className="text-xs">Immagine non disponibile</span>
                        </div>
                    )}
                </div>

                {/* Product Meta */}
                <div className="flex flex-col justify-start gap-5">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="px-2.5 py-0.5">{product.category?.name ?? "Senza categoria"}</Badge>
                        <Badge variant="outline" className="font-mono text-muted-foreground px-2.5 py-0.5">SKU: {product.sku}</Badge>
                        <Badge
                            variant={unavailable ? "destructive" : "secondary"}
                            className={cn("px-2.5 py-0.5", !unavailable && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10")}
                        >
                            {unavailable ? "Non disponibile" : "Disponibile"}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="ml-1 text-sm font-semibold">{product.averageRating?.toFixed(1) ?? "-"}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{product.reviewCount} recensioni utenti</span>
                        </div>
                    </div>

                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                        {product.description ?? "Nessuna descrizione disponibile per questo articolo."}
                    </p>

                    <div className="pt-4 border-t mt-auto space-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Prezzo al pubblico</span>
                            <div className="text-3xl font-extrabold tracking-tight">{formatMoney(product.price)}</div>
                        </div>

                        <Button
                            className="w-full h-11 text-base gap-2 shadow-sm transition-transform active:scale-[0.99]"
                            disabled={!isAuthenticated || unavailable || !productId || addToCartMutation.isPending}
                            onClick={() => void addToCartMutation.mutateAsync()}
                            type="button"
                        >
                            {addToCartMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ShoppingCart className="h-5 w-5" />
                            )}
                            {unavailable ? "Prodotto esaurito" : !isAuthenticated ? "Accedi per acquistare" : "Aggiungi al carrello"}
                        </Button>
                    </div>
                </div>
            </section>

            <hr className="my-4 border-muted" />

            {/* Reviews Section */}
            <section className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
                {/* Left Side: Reviews List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tight">Recensioni della Community</h2>
                        {loadingReviews && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>

                    {!loadingReviews && reviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                            <p className="text-sm">Ancora nessuna valutazione per questo prodotto.</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Sii il primo a condividere la tua opinione!</p>
                        </div>
                    ) : null}

                    <div className="grid gap-3">
                        {reviews.map((review) => (
                            <Card className="rounded-xl shadow-sm" key={review.id}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-semibold text-sm">{review.authorName}</span>
                                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                    {/* Stelle della recensione sicure */}
                                    <div className="flex gap-0.5 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                className={cn("h-3.5 w-3.5", index < Math.floor(review.rating) ? "fill-current" : "text-muted/60")}
                                                key={index}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-normal">{review.comment}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form Create Review */}
                <Card className="rounded-xl shadow-sm sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Esprimi la tua opinione</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isAuthenticated ? (
                            <form className="grid gap-4" onSubmit={(e) => void submitReview(e)}>
                                <div className="space-y-2">
                                    <Label>La tua valutazione</Label>
                                    {/* Selettore a Stelle UX-friendly */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {Array.from({ length: 5 }).map((_, index) => {
                                            const starValue = index + 1
                                            return (
                                                <button
                                                    type="button"
                                                    key={index}
                                                    className="text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                                                    onClick={() => setFormRating(starValue)}
                                                >
                                                    <Star className={cn("h-6 w-6", starValue <= formRating ? "fill-current" : "text-muted")} />
                                                </button>
                                            )
                                        })}
                                        <span className="text-xs font-bold text-muted-foreground ml-2">({formRating}/5)</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comment">Raccontaci la tua esperienza</Label>
                                    <Textarea
                                        id="comment"
                                        name="comment"
                                        placeholder="Cosa ne pensi di questo articolo? Quali sono i pro e i contro?"
                                        rows={4}
                                        className="resize-none"
                                        required
                                    />
                                </div>

                                <Button
                                    disabled={!productId || reviewMutation.isPending}
                                    type="submit"
                                    className="w-full gap-2 mt-1"
                                >
                                    {reviewMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    <span>Invia Recensione</span>
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-4 space-y-3">
                                <p className="text-xs text-muted-foreground">Devi effettuare l'accesso per poter lasciare una recensione su questo prodotto.</p>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link to="/login">Accedi ora</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
