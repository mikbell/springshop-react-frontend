import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save, Trash2, Loader2, FolderPlus, Folder } from "lucide-react"

import { AdminLoading, AdminPageShell } from "../../components/layouts/admin-page-shell"
import { Field } from "../../components/shared/form-field"
import { categoriesApi } from "@/lib/api/handlers"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import { cn } from "@/lib/utils"

export function CategoriesPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery(
    queries.categories(isAdmin)
  )

  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.categories })

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      void refreshCategories()
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      void refreshCategories()
      void queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    if (!data.get("name")?.toString().trim()) return

    await createMutation.mutateAsync({
      name: String(data.get("name")),
      description: String(data.get("description") || ""),
    })
    form.reset()
  }

  return (
    <AdminPageShell isAdmin={isAdmin} title="Categorie">
      {isLoading ? (
        <AdminLoading />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* Colonna Sinistra: Form Creazione */}
          <Card className="h-fit shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                <span>Nuova categoria</span>
              </CardTitle>
              <CardDescription>Aggiungi una nuova categoria per i prodotti.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => void createCategory(event)}
              >
                <div className="space-y-1">
                  <Field label="Nome della categoria" name="name" required placeholder="Es. Abbigliamento" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Descrizione
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Fornisci una breve descrizione..."
                    className="resize-none min-h-25 rounded-lg"
                  />
                </div>
                <Button
                  disabled={createMutation.isPending}
                  type="submit"
                  className="w-full gap-2 rounded-lg shadow-sm"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Salva categoria</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Colonna Destra: Elenco Categorie */}
          {categories.length === 0 ? (
            <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
              <Folder className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">Nessuna categoria creata.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 h-fit">
              {categories.map((category) => {
                const isDeleting = removeMutation.isPending && removeMutation.variables === category.id

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      "shadow-sm transition-all hover:shadow-md flex flex-col justify-between",
                      isDeleting && "opacity-60 pointer-events-none animate-pulse"
                    )}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                      <CardTitle className="text-base font-semibold tracking-tight truncate pr-2" title={category.name}>
                        {category.name}
                      </CardTitle>
                      <Button
                        disabled={removeMutation.isPending}
                        onClick={() => void removeMutation.mutateAsync(category.id)}
                        size="icon"
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        aria-label={`Elimina categoria ${category.name}`}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                      <p className="line-clamp-3 leading-relaxed">
                        {category.description || "Nessuna descrizione fornita."}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

        </div>
      )}
    </AdminPageShell>
  )
}