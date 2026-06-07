// components/routing/route-fallback.tsx
import { Loader2 } from "lucide-react"

export function RouteFallback() {
    return (
        <div className="flex min-h-75 items-center justify-center px-4">
            <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Caricamento pagina...
            </div>
        </div>
    )
}