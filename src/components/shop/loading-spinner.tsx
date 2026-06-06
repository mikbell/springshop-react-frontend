import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
    return (
        <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">Caricamento ordini in corso...</p>
        </div>
    )
}
