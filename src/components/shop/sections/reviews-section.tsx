
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Send, Star, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { reviewsApi } from "@/lib/api/handlers"
import { queries } from "@/lib/queries"

export function ReviewsSection({ isAuthenticated, productId, productSlug }: {
    isAuthenticated: boolean,
    productId: string,
    productSlug: string,
}) {
    const [formRating, setFormRating] = useState<number>(5)

    const { data: reviewPage, isLoading: loadingReviews } = useQuery(
        queries.reviews(productId, { size: 6 })
    )

    const reviews = reviewPage?.content ?? []


    const reviewMutation = useMutation({
        mutationFn: (payload: { rating: number; comment: string }) => {
            if (!productId) {
                throw new Error("Prodotto non caricato.")
            }
            return reviewsApi.create(productId, payload)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.reviews(productId),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.product(productId),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.productBySlug(productSlug),
            })
            void queryClient.invalidateQueries({ queryKey: queryKeys.products })
            setFormRating(5) // Reset del rating locale
        },
    })

    async function submitReview(event: React.SubmitEvent<HTMLFormElement>) {
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
        <section className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Recensioni della community
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Leggi le esperienze degli altri clienti.
                        </p>
                    </div>

                    {loadingReviews && (
                        <Loader2 className="mt-1 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                {loadingReviews ? (
                    <div className="grid gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-32 animate-pulse rounded-xl border bg-muted/30"
                            />
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Star className="h-6 w-6" />
                        </div>

                        <h3 className="font-semibold text-foreground">
                            Nessuna recensione ancora
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            Questo prodotto non ha ancora valutazioni. Condividi la tua esperienza
                            e aiuta gli altri utenti a scegliere meglio.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {reviews.map((review) => (
                            <Card
                                key={review.id}
                                className="rounded-2xl border bg-card/80 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <CardContent className="space-y-3 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {review.authorName}
                                            </p>

                                            <div className="mt-1 flex gap-0.5 text-amber-500">
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        aria-hidden="true"
                                                        className={cn(
                                                            "h-4 w-4",
                                                            index < Math.floor(review.rating)
                                                                ? "fill-current"
                                                                : "text-muted"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {review.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Card className="sticky top-6 rounded-2xl border bg-card/95 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Lascia una recensione</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Racconta cosa ti è piaciuto e cosa miglioreresti.
                    </p>
                </CardHeader>

                <CardContent>
                    {isAuthenticated ? (
                        <form className="grid gap-5" onSubmit={(e) => void submitReview(e)}>
                            <div className="space-y-2">
                                <Label>Valutazione</Label>

                                <div className="flex items-center gap-2">
                                    <RatingStars value={formRating} onChange={setFormRating} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">La tua esperienza</Label>

                                <Textarea
                                    id="comment"
                                    name="comment"
                                    placeholder="Com'è stato usare questo prodotto?"
                                    rows={5}
                                    className="resize-none rounded-xl"
                                    required
                                />
                            </div>

                            <Button
                                disabled={!productId || reviewMutation.isPending}
                                type="submit"
                                className="w-full gap-2"
                            >
                                {reviewMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Invio in corso...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Invia recensione
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="rounded-xl bg-muted/30 p-5 text-center">
                            <p className="text-sm text-muted-foreground">
                                Accedi per condividere la tua opinione su questo prodotto.
                            </p>

                            <Button variant="default" size="sm" asChild className="mt-4 w-full">
                                <Link to="/login">Accedi ora</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}

type RatingStarsProps = {
    value: number
    onChange: (value: number) => void
    max?: number
}

function RatingStars({ value, onChange, max = 5 }: RatingStarsProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null)

    const activeRating = hoverRating ?? value

    return (
        <div
            role="radiogroup"
            aria-label="Valutazione"
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(null)}
        >
            {Array.from({ length: max }, (_, index) => {
                const starValue = index + 1
                const isActive = starValue <= activeRating

                return (
                    <button
                        key={starValue}
                        type="button"
                        role="radio"
                        aria-checked={value === starValue}
                        aria-label={`${starValue} ${starValue === 1 ? "stella" : "stelle"}`}
                        className="rounded-md text-amber-500 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onChange(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                    >
                        <Star
                            aria-hidden="true"
                            className={cn(
                                "h-7 w-7 transition-colors",
                                isActive ? "fill-current" : "text-muted-foreground"
                            )}
                        />
                    </button>
                )
            })}

            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {activeRating}/5
            </span>
        </div>
    )
}