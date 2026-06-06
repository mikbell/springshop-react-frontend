import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save, Loader2, PackagePlus, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Field } from "../../components/shop/form-field"
import { ApiClientError } from "@/lib/api/client"
import { productsApi } from "@/lib/api/handlers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import type { ProductRequest } from "@/lib/types/api"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shop/loading-spinner"

const allowedProductImageExtensions = ["jpg", "jpeg", "png", "webp", "gif"]
const maxProductImageSize = 5 * 1024 * 1024
type ProductFormField = keyof ProductRequest | "form"
type ProductFormErrors = Partial<Record<ProductFormField, string>>

const productFormFields: Record<keyof ProductRequest, true> = {
  name: true,
  description: true,
  price: true,
  stockQuantity: true,
  sku: true,
  imageUrl: true,
  categoryId: true,
}

export function CreateProductPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = React.useState<ProductFormErrors>({})

  // Gestiamo lo stato del Select in modo controllato per integrarlo con FormData
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")

  const { data: categories = [], isLoading: loadingCategories } = useQuery(
    queries.categories(isAdmin)
  )

  const createMutation = useMutation({
    mutationFn: ({
      payload,
      image,
    }: {
      payload: ProductRequest
      image?: File
    }) => productsApi.create(payload, image),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminDashboardSummary,
      })
      navigate("/admin/products")
    },
  })

  function validateProduct(payload: ProductRequest) {
    const nextErrors: ProductFormErrors = {}

    if (!payload.name.trim()) {
      nextErrors.name = "Inserisci il nome del prodotto."
    }

    if (!payload.sku.trim()) {
      nextErrors.sku = "Inserisci lo SKU."
    }

    if (!nextErrors.sku && payload.sku.trim().length < 3) {
      nextErrors.sku = "Lo SKU deve contenere almeno 3 caratteri."
    }

    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      nextErrors.price = "Inserisci un prezzo maggiore di 0."
    }

    if (!Number.isInteger(payload.stockQuantity) || payload.stockQuantity < 0) {
      nextErrors.stockQuantity = "Lo stock deve essere maggiore o uguale a 0."
    }

    return nextErrors
  }

  function getProductImage(fileEntry: FormDataEntryValue | null) {
    if (!(fileEntry instanceof File) || !fileEntry.name) {
      return undefined
    }

    if (!fileEntry.type.startsWith("image/")) {
      throw new Error("Seleziona un file immagine valido.")
    }

    if (fileEntry.size > maxProductImageSize) {
      throw new Error("Seleziona un'immagine fino a 5 MB.")
    }

    const extension = fileEntry.name.split(".").pop()?.toLowerCase()
    if (!extension || !allowedProductImageExtensions.includes(extension)) {
      throw new Error("Formato immagine non supportato (usa jpg, png, webp o gif).")
    }

    return fileEntry
  }

  function getApiErrors(error: unknown): ProductFormErrors {
    if (!(error instanceof ApiClientError)) {
      return {
        form: error instanceof Error ? error.message : "Creazione prodotto non riuscita.",
      }
    }

    const fieldErrors = error.details?.fields ?? error.details?.errors
    if (!fieldErrors) {
      return { form: error.message }
    }

    return Object.entries(fieldErrors).reduce<ProductFormErrors>(
      (nextErrors, [field, message]) => {
        if (field in productFormFields) {
          nextErrors[field as keyof ProductRequest] = message
        } else {
          nextErrors.form = message
        }
        return nextErrors
      },
      {}
    )
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    let image: File | undefined

    try {
      image = getProductImage(data.get("imageFile"))
    } catch (error) {
      setErrors({
        imageUrl: error instanceof Error ? error.message : "Immagine non valida.",
      })
      return
    }

    const payload = {
      name: String(data.get("name") || "").trim(),
      description: String(data.get("description") || "").trim(),
      price: Number(data.get("price")),
      stockQuantity: Number(data.get("stockQuantity")),
      sku: String(data.get("sku") || "").trim(),
      imageUrl: undefined,
      categoryId: (selectedCategory && selectedCategory !== "none_value") ? selectedCategory : undefined,
    }

    const validationErrors = validateProduct(payload)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      await createMutation.mutateAsync({ payload, image })
    } catch (error) {
      setErrors(getApiErrors(error))
    }
  }

  if (loadingCategories) {
    return <LoadingSpinner />
  }

  return (
    <Card className="max-w-xl shadow-sm border animate-in fade-in-50 duration-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
          <PackagePlus className="h-5 w-5 text-primary" />
          <span>Dettagli prodotto</span>
        </CardTitle>
        <CardDescription>Inserisci le informazioni necessarie per pubblicare il prodotto nel catalogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => void createProduct(event)}
        >
          {/* Alert Errore Globale API */}
          {errors.form && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive animate-in shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errors.form}</p>
            </div>
          )}

          {/* Nome & SKU */}
          <Field error={errors.name} label="Nome prodotto" name="name" placeholder="Es. Scarpe da ginnastica" />
          <Field error={errors.sku} label="Codice SKU" name="sku" placeholder="Es. SCRP-GNN-01" />

          {/* Prezzo & Stock affiancati */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              error={errors.price}
              label="Prezzo (€)"
              min="0.01"
              name="price"
              step="0.01"
              type="number"
              placeholder="0.00"
            />
            <Field
              error={errors.stockQuantity}
              label="Unità in Stock"
              min="0"
              name="stockQuantity"
              type="number"
              placeholder="0"
            />
          </div>

          {/* File Immagine */}
          <Field
            accept="image/*"
            error={errors.imageUrl}
            label="Immagine del prodotto"
            name="imageFile"
            required={false}
            type="file"
          />

          {/* Componente Categoria (Shadcn UI Style) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Categoria
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={cn("w-full h-9 rounded-lg shadow-sm", errors.categoryId && "border-destructive")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una categoria (Opzionale)" />
                </SelectTrigger>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none_value" className="text-muted-foreground italic">Senza categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs font-medium text-destructive">{errors.categoryId}</p>
            )}
          </div>

          {/* Descrizione Prodotto */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium leading-none">
              Descrizione breve
            </label>
            <Textarea
              id="description"
              aria-invalid={Boolean(errors.description)}
              className={cn(
                "resize-none min-h-25 rounded-lg shadow-sm",
                errors.description && "border-destructive focus-visible:ring-destructive"
              )}
              name="description"
              placeholder="Inserisci le caratteristiche del prodotto..."
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Bottone di Invio */}
          <Button
            disabled={createMutation.isPending}
            type="submit"
            className="w-full gap-2 rounded-lg shadow-sm font-medium mt-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{createMutation.isPending ? "Salvataggio in corso..." : "Crea prodotto"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}