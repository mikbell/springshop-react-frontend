import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, ReceiptText, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { queryKeys } from "@/lib/query-keys"

export function OrderSuccessPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
  }, [queryClient])

  return (
    <div className="container mx-auto grid min-h-[calc(100svh-10rem)] max-w-2xl place-items-center px-4 py-8">
      <Card className="w-full overflow-hidden rounded-2xl border-primary/20 bg-card shadow-sm">
        <CardContent className="grid gap-7 p-6 text-center sm:p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-medium text-primary">
              Pagamento confermato
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ordine completato
            </h1>

            <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Abbiamo registrato correttamente il pagamento. Il riepilogo
              dell’ordine è disponibile nella sezione ordini.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>
              Riceverai gli aggiornamenti sull’ordine appena disponibili.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-11 gap-2">
              <Link to="/orders">
                <ReceiptText className="h-4 w-4" />
                Vedi ordini
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-11 gap-2">
              <Link to="/">
                <ShoppingBag className="h-4 w-4" />
                Continua gli acquisti
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
