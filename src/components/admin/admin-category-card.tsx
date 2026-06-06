import type { Category } from '@/lib/types/api'
import type { UseMutationResult } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminCategoryCard({
    category,
    removeMutation
}: {
    category: Category,
    removeMutation: UseMutationResult<void, unknown, string, unknown>
}) {
    const isDeleting = removeMutation.isPending && removeMutation.variables === category.id

    const handleDelete = () => {
        // Previene eliminazioni accidentali
        if (window.confirm(`Sei sicuro di voler eliminare la categoria "${category.name}"? L'azione è irreversibile.`)) {
            removeMutation.mutate(category.id)
        }
    }

    return (
        <Card
            className={cn(
                "shadow-sm transition-all hover:shadow-md flex flex-col justify-between overflow-hidden",
                isDeleting && "opacity-60 pointer-events-none animate-pulse"
            )}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-base font-semibold tracking-tight truncate pr-2" title={category.name}>
                    {category.name}
                </CardTitle>
                <Button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    size="icon"
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 -mt-1 -mr-1"
                    aria-label={`Elimina categoria ${category.name}`}
                    title="Elimina categoria"
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                <p
                    className="line-clamp-3 leading-relaxed"
                    title={category.description || ""}
                >
                    {category.description || "Nessuna descrizione fornita."}
                </p>
            </CardContent>
        </Card>
    )
}