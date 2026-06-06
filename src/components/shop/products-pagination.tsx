import { useSearchParams, Link } from "react-router-dom";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export const title = "End Ellipsis";

export function ProductsPagination({ products }: { products: { totalPages: number } }) {
    const [searchParams] = useSearchParams();

    // Recupera la pagina corrente dall'URL (default a 1)
    const currentPage = Number(searchParams.get("page")) || 1;
    const totalPages = products.totalPages;

    // Funzione helper per generare l'URL corretto mantenendo eventuali altri filtri
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                {/* Pulsante Precedente */}
                <PaginationItem>
                    <PaginationPrevious

                    >
                        <Link
                            to={createPageUrl(currentPage - 1)}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationPrevious>
                </PaginationItem>

                {/* Prima Pagina */}
                <PaginationItem>
                    <PaginationLink isActive={currentPage === 1}>
                        <Link to={createPageUrl(1)}>1</Link>
                    </PaginationLink>
                </PaginationItem>

                {/* Logica dei puntini di sospensione (Ellipsis) e pagine intermedie */}
                {currentPage > 3 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {/* Pagina precedente a quella corrente (se applicabile) */}
                {currentPage > 2 && (
                    <PaginationItem>
                        <PaginationLink >
                            <Link to={createPageUrl(currentPage - 1)}>{currentPage - 1}</Link>
                        </PaginationLink>
                    </PaginationItem>
                )}

                {/* Pagina Corrente (se non è la prima o l'ultima) */}
                {currentPage !== 1 && currentPage !== totalPages && (
                    <PaginationItem>
                        <PaginationLink isActive>
                            <Link to={createPageUrl(currentPage)}>{currentPage}</Link>
                        </PaginationLink>
                    </PaginationItem>
                )}

                {/* Pagina successiva a quella corrente (se applicabile) */}
                {currentPage < totalPages - 1 && (
                    <PaginationItem>
                        <PaginationLink >
                            <Link to={createPageUrl(currentPage + 1)}>{currentPage + 1}</Link>
                        </PaginationLink>
                    </PaginationItem>
                )}

                {/* Logica dei puntini di sospensione finali */}
                {currentPage < totalPages - 2 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {/* Ultima Pagina */}
                {totalPages > 1 && (
                    <PaginationItem>
                        <PaginationLink isActive={currentPage === totalPages}>
                            <Link to={createPageUrl(totalPages)}>{totalPages}</Link>
                        </PaginationLink>
                    </PaginationItem>
                )}

                {/* Pulsante Successivo */}
                <PaginationItem>
                    <PaginationNext
                    >
                        <Link
                            to={createPageUrl(currentPage + 1)}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}