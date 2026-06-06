import type { Product } from '@/lib/types/api'
import type { UseMutationResult } from '@tanstack/react-query'
import { Card, CardContent } from '../ui/card'
import { ImageIcon, Layers, Loader2, Trash2 } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export default function AdminProductCard({
    product,
    removeMutation
}: {
    product: Product,
    removeMutation: UseMutationResult<void, unknown, string, unknown>
}) {
    const isDeleting = removeMutation.isPending && removeMutation.variables === product.id
    const isLowStock = product.stockQuantity <= 5

    const handleDelete = () => {
        // Previene eliminazioni accidentali
        if (window.confirm(`Sei sicuro di voler eliminare "${product.name}"? L'azione è irreversibile.`)) {
            // Usiamo mutate invece di mutateAsync se non dobbiamo attendere Promise locali
            removeMutation.mutate(product.id)
        }
    }

    return (
        <Card
            className={cn(
                "flex flex-row items-stretch overflow-hidden shadow-sm transition-all hover:shadow-md py-0 h-32",
                isDeleting && "opacity-60 pointer-events-none animate-pulse"
            )}
        >
            {/* Contenitore Immagine con Fallback e Proporzioni Fisse */}
            <div className="relative w-32 shrink-0 bg-muted/30 flex items-center justify-center border-r">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={`Immagine di ${product.name}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
            </div>

            <CardContent className="flex flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between min-w-0">

                {/* Informazioni Prodotto */}
                <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold tracking-tight text-base truncate" title={product.name}>
                        {product.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px] border">
                            {product.sku}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1 truncate">
                            <Layers className="h-3 w-3 shrink-0" />
                            <span className="truncate">{product.category?.name ?? "Senza categoria"}</span>
                        </span>
                    </div>
                </div>

                {/* Badge di Stato e Azioni */}
                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        {/* Prezzo */}
                        <span className="text-sm font-bold tracking-tight text-foreground">
                            {formatMoney(product.price)}
                        </span>

                        {/* Inventario */}
                        <Badge
                            variant={isLowStock ? "destructive" : "outline"}
                            className={cn(
                                "text-[10px] font-medium px-2 py-0 uppercase tabular-nums",
                                isLowStock && "bg-destructive/10 text-destructive hover:bg-destructive/10 border-transparent"
                            )}
                        >
                            {product.stockQuantity} pz
                        </Badge>

                        {/* Stato Visibilità */}
                        <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0 uppercase tracking-wider">
                            {product.status}
                        </Badge>
                    </div>

                    {/* Bottone Elimina */}
                    <Button
                        disabled={isDeleting}
                        onClick={handleDelete}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors shrink-0"
                        type="button"
                        aria-label={`Elimina ${product.name}`}
                        title="Elimina prodotto"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}