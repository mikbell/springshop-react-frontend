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
    <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-2xl place-items-center">
      <Card className="w-full rounded-lg border-primary/20 bg-card shadow-sm">
        <CardContent className="grid gap-6 p-6 text-center sm:p-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              Ordine completato
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Pagamento registrato correttamente. Puoi consultare il riepilogo nella
              sezione ordini.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link to="/orders">
                <ReceiptText />
                Vedi ordini
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <ShoppingBag />
                Continua gli acquisti
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
