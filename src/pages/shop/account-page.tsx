import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"

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
  const { data: wishlist = [] } = useQuery(queries.wishlist(isAuthenticated))
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
      <p className="rounded-lg border p-4 text-sm text-muted-foreground">
        Accedi per gestire profilo, indirizzo e wishlist.
      </p>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Nome</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Ruolo</span>
            <span>{user.role}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Indirizzo spedizione</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => void saveAddress(event)}
          >
            <Field
              defaultValue={user.address?.street ?? ""}
              label="Via"
              name="street"
            />
            <Field
              defaultValue={user.address?.city ?? ""}
              label="Citta"
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
                className="w-full"
                disabled={addressMutation.isPending}
                type="submit"
              >
                <Save />
                Salva indirizzo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-3 lg:col-span-2">
        <h2 className="text-lg font-semibold">Wishlist</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <Card className="rounded-lg" key={item.id} size="sm">
              <CardContent className="grid grid-cols-[72px_1fr] gap-3 py-1">
                <div className="overflow-hidden rounded-md bg-muted">
                  {resolveAssetUrl(item.imageUrl) ? (
                    <img
                      alt={item.productName}
                      className="aspect-square object-cover"
                      src={resolveAssetUrl(item.imageUrl) ?? undefined}
                    />
                  ) : null}
                </div>
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.sku}
                  </div>
                  <div className="mt-2 font-semibold">
                    {formatMoney(item.price)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
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
