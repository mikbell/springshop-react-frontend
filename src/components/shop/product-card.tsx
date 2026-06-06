import { Heart, Package, ShoppingCart, Star } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatMoney, resolveAssetUrl } from "@/lib/format"
import { cn } from "@/lib/utils" // Utility standard di shadcn per unire le classi
import type { Product } from "@/lib/types/api"

type ProductCardProps = {
  product: Product
  onAddToCart: (product: Product) => void
  onWishlist: (product: Product) => void
  disabledActions?: boolean
  isFavorite?: boolean // Nuova prop utile per mostrare lo stato della wishlist
}

export function ProductCard({
  product,
  onAddToCart,
  onWishlist,
  disabledActions,
  isFavorite = false,
}: ProductCardProps) {
  const unavailable =
    product.stockQuantity <= 0 || product.status !== "AVAILABLE"
  const imageUrl = resolveAssetUrl(product.imageUrl)
  const productUrl = `/products/${product.slug || product.id}`

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-muted/60 pt-0 transition-all duration-200 hover:shadow-md">
      {/* Area Immagine con Overlay */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Link
          className="block h-full w-full"
          to={productUrl}
          aria-label={`Visualizza dettagli per ${product.name}`}
        >
          {imageUrl ? (
            <img
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy" // Ottimizzazione performance di caricamento
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
              <Package className="h-12 w-12 stroke-[1.5]" />
            </div>
          )}
        </Link>

        {/* Badge Stato (Disponibilità) */}
        <div className="pointer-events-none absolute top-3 left-3">
          <Badge
            variant={unavailable ? "destructive" : "secondary"}
            className="bg-background/80 shadow-sm backdrop-blur-md"
          >
            {unavailable ? "Non disponibile" : "Disponibile"}
          </Badge>
        </div>

        {/* Pulsante Wishlist in Overlay */}
        <div className="absolute top-3 right-3">
          <Button
            aria-label={
              isFavorite ? "Rimuovi dalla wishlist" : "Aggiungi alla wishlist"
            }
            disabled={disabledActions}
            onClick={(e) => {
              e.preventDefault() // Previene la navigazione del Link sottostante
              onWishlist(product)
            }}
            size="icon"
            type="button"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-background/80 shadow-sm backdrop-blur-md transition-transform hover:bg-background active:scale-95"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Contenuto della Card */}
      <CardHeader className="flex-1 gap-1.5 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
          <span className="truncate">
            {product.category?.name ?? "Senza categoria"}
          </span>
          {product.averageRating != null && product.averageRating > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                {product.averageRating.toFixed(1)}
                <span className="ml-0.5 font-normal text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </span>
            </>
          )}
        </div>

        <CardTitle className="line-clamp-2 text-base leading-snug font-semibold transition-colors group-hover:text-primary">
          <Link to={productUrl}>{product.name}</Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pt-0 pb-3">
        <p className="line-clamp-2 text-xs leading-normal text-muted-foreground">
          {product.description ?? "Nessuna descrizione disponibile."}
        </p>
      </CardContent>

      {/* Footer con Prezzo e Carrello */}
      <CardFooter className="mt-auto items-center justify-between gap-2 p-4 pt-0">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground/70">
            Prezzo
          </span>
          <div className="text-lg font-bold tracking-tight text-foreground">
            {formatMoney(product.price)}
          </div>
        </div>

        <Button
          disabled={disabledActions || unavailable}
          onClick={() => onAddToCart(product)}
          size="sm"
          type="button"
          className="gap-2 shadow-sm transition-all active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Aggiungi</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
