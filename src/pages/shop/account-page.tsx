import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Heart, Loader2, Save, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import { userApi } from "@/lib/api/handlers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMoney, resolveAssetUrl } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"

export function AccountPage() {
  const { user, isAuthenticated, reloadUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: wishlist = [], isLoading: loadingWishlist } = useQuery(
    queries.wishlist(isAuthenticated)
  )

  const addressMutation = useMutation({
    mutationFn: (payload: Parameters<typeof userApi.upsertAddress>[0]) =>
      userApi.upsertAddress(payload),
    onSuccess: async () => {
      await reloadUser()
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist })
    },
  })

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    await addressMutation.mutateAsync({
      street: String(data.get("street")),
      city: String(data.get("city")),
      state: String(data.get("state") || ""),
      country: String(data.get("country")),
      zipcode: String(data.get("zipcode")),
    })
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto grid min-h-100 max-w-md place-items-center px-4">
        <Card className="w-full rounded-2xl text-center shadow-sm">
          <CardContent className="grid gap-4 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">Accesso richiesto</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Accedi per gestire profilo, indirizzo di spedizione e wishlist.
              </p>
            </div>

            <Button asChild className="mt-2">
              <Link to="/login">Accedi ora</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Il mio account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestisci i tuoi dati personali, l’indirizzo di spedizione e i prodotti salvati.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Profilo</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 text-sm">
            <ProfileRow
              label="Nome"
              value={`${user.firstName} ${user.lastName}`}
            />
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Ruolo" value={user.role} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Indirizzo spedizione</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(event) => void saveAddress(event)}
            >
              <Field
                defaultValue={user.address?.street ?? ""}
                label="Via"
                name="street"
              />
              <Field
                defaultValue={user.address?.city ?? ""}
                label="Città"
                name="city"
              />
              <Field
                defaultValue={user.address?.state ?? ""}
                label="Provincia/Stato"
                name="state"
                required={false}
              />
              <Field
                defaultValue={user.address?.country ?? ""}
                label="Paese"
                name="country"
              />
              <Field
                defaultValue={user.address?.zipcode ?? ""}
                label="CAP"
                name="zipcode"
              />

              <div className="flex items-end">
                <Button
                  className="h-10 w-full gap-2"
                  disabled={addressMutation.isPending}
                  type="submit"
                >
                  {addressMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {addressMutation.isPending ? "Salvataggio..." : "Salva indirizzo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Wishlist</h2>
            <p className="text-sm text-muted-foreground">
              Prodotti che hai salvato per dopo.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {wishlist.length} articoli
          </span>
        </div>

        {loadingWishlist ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border bg-muted/30"
              />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <Card className="rounded-2xl border-dashed bg-muted/20">
            <CardContent className="grid place-items-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Heart className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-semibold">Wishlist vuota</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Salva i prodotti che ti interessano per ritrovarli rapidamente.
                </p>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link to="/">Sfoglia il catalogo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => {
              const imageUrl = resolveAssetUrl(item.imageUrl)

              return (
                <Card
                  className="overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
                  key={item.id}
                >
                  <CardContent className="grid grid-cols-[88px_1fr] gap-4 p-3">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      {imageUrl ? (
                        <img
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          src={imageUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Heart className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 py-1">
                      <div className="truncate font-medium">
                        {item.productName}
                      </div>

                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.sku}
                      </div>

                      <div className="mt-3 font-semibold">
                        {formatMoney(item.price)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value}</span>
    </div>
  )
}

function Field({
  label,
  name,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required {...props} />
    </div>
  )
}