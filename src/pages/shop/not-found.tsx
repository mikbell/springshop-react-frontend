import { Link } from "react-router-dom"

export function NotFound() {
    return (
        <div className="flex flex-col h-screen items-center justify-center font-medium">
            <h1 className="font-bold text-4xl mb-6">Pagina non trovata (404)</h1>
            <Link to="/" className="text-primary font-semibold underline-offset-4 hover:underline transition-colors">
                Torna alla Home
            </Link>
        </div>
    )
}

