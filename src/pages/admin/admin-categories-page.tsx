import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save, Loader2, FolderPlus, Folder } from "lucide-react"

import { Field } from "../../components/shop/form-field"
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
import { LoadingSpinner } from "@/components/shop/loading-spinner"
import { AdminCategoryCard } from "@/components/admin/admin-category-card"

export function CategoryManagementPage() {
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

  async function createCategory(event: React.SubmitEvent<HTMLFormElement>) {
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
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
          {categories.map((category) => (
            <AdminCategoryCard key={category.id} category={category} removeMutation={removeMutation} />
          ))}
        </div>
      )}

    </div>
  )
}