import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Package,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  searchItems,
  getAta,
  listSuppliers,
  type ItemSearchResponse,
  type FornecedorResponse,
} from "@/services/atas";

/* ─── Helpers ─── */

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return num.toLocaleString("pt-BR");
}

/**
 * Generates a compact page-number array with ellipsis.
 * Example: [1, "ellipsis", 4, 5, 6, "ellipsis", 20]
 */
function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
}

/* ─── Types ─── */

export interface AddToCartPayload {
  item: ItemSearchResponse;
  qty: number;
  type: "direta" | "carona";
}

interface BuyerCatalogProps {
  onAddToCart?: (payload: AddToCartPayload) => void;
  orgaoCompradorId?: string;
  cartItemIds?: Set<string>;
}

/* ─── Skeleton Card ─── */

function SkeletonCard() {
  return (
    <div className="border border-slate-955/10 bg-white flex flex-col animate-pulse">
      <div className="bg-slate-100 h-44" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-100 w-1/3" />
        <div className="h-4 bg-slate-100 w-full" />
        <div className="h-4 bg-slate-100 w-2/3" />
        <div className="h-6 bg-slate-100 w-1/4" />
        <div className="space-y-1">
          <div className="h-2 bg-slate-100 w-full" />
          <div className="h-2 bg-slate-100 w-3/4" />
        </div>
        <div className="h-8 bg-slate-100 w-full mt-2" />
      </div>
    </div>
  );
}

/* ─── Skeleton Table Row ─── */

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-3/4" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-1/4" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-1/6" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-1/6" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-1/4" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 bg-slate-100 w-1/6" />
      </td>
    </tr>
  );
}

/* ─── Item Card ─── */

function ItemCard({
  item,
  isAdding,
  onStartAdd,
  onConfirmAdd,
  onCancelAdd,
  qty,
  onQtyChange,
  tipoAdesao,
  isInCart,
}: {
  item: ItemSearchResponse;
  isAdding: boolean;
  onStartAdd: () => void;
  onConfirmAdd: () => void;
  onCancelAdd: () => void;
  qty: number;
  onQtyChange: (v: number) => void;
  tipoAdesao: "direta" | "carona";
  isInCart: boolean;
}) {
  const saldo = Number.parseFloat(item.quantidade_saldo_disponivel);
  const totalOfertado = Number.parseFloat(item.quantidade_total_ofertada);
  const consumidoPct =
    totalOfertado > 0
      ? Math.round(((totalOfertado - saldo) / totalOfertado) * 100)
      : 0;
  const isSoldOut = saldo <= 0;

  return (
    <div
      className={`group relative bg-white border flex flex-col ${
        isInCart ? "border-blue-400" : "border-slate-955/10"
      }`}
    >
      {/* ── Image Area ── */}
      <div className="relative bg-slate-50 h-44 overflow-hidden">
        {item.url_imagem ? (
          <img
            src={item.url_imagem}
            alt={item.descricao_especificacao}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Tipo badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2 py-0.5 text-[9px] font-bold font-sans uppercase tracking-wider border ${
              tipoAdesao === "direta"
                ? "bg-biap-blue text-white border-biap-blue"
                : "bg-biap-warning text-white border-biap-warning"
            }`}
          >
            {tipoAdesao === "direta" ? "PARTICIPANTE" : "CARONA"}
          </span>
        </div>

        {/* Item number */}
        {item.numero_item && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-1.5 py-0.5 text-[9px] font-bold font-sans bg-white/90 text-slate-700 border border-slate-955/10">
              Item {item.numero_item}
            </span>
          </div>
        )}

        {/* In Cart badge */}
        {isInCart && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold font-sans bg-blue-600 text-white border border-blue-600">
              <ShoppingCart className="w-2.5 h-2.5" />
              No carrinho
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 space-y-2">
        {/* Marca/Modelo */}
        {item.marca_modelo && (
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {item.marca_modelo}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-800 leading-snug line-clamp-2 font-sans">
          {item.descricao_especificacao}
        </p>

        {/* Price */}
        <div className="mt-auto pt-1">
          <p className="text-xl font-bold text-slate-955 font-display tracking-tight">
            {formatCurrency(item.valor_unitario)}
          </p>
          {item.unidade_medida && (
            <p className="text-[10px] text-slate-400 font-sans">
              por {item.unidade_medida.toLowerCase()}
            </p>
          )}
        </div>

        {/* Balance bar */}
        {totalOfertado > 0 && (
          <div>
            <div className="flex justify-between text-[9px] text-slate-400 font-sans mb-0.5">
              <span>
                Saldo: {formatNumber(saldo)}/{formatNumber(totalOfertado)}
              </span>
              <span
                className={`font-medium ${
                  consumidoPct >= 90
                    ? "text-red-500"
                    : consumidoPct >= 70
                      ? "text-amber-500"
                      : "text-slate-400"
                }`}
              >
                {consumidoPct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  consumidoPct >= 90
                    ? "bg-red-500"
                    : consumidoPct >= 70
                      ? "bg-amber-500"
                      : "bg-biap-blue"
                }`}
                style={{ width: `${consumidoPct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        {!isAdding ? (
          <button
            onClick={onStartAdd}
            disabled={isSoldOut}
            className={`w-full mt-1 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isSoldOut
                ? "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-955 text-white border-slate-955 hover:bg-slate-900"
            }`}
          >
            <Plus className="w-3 h-3 shrink-0" />
            {isSoldOut ? "Esgotado" : isInCart ? "Adicionar mais" : "Adicionar"}
          </button>
        ) : (
          /* ── Inline Add Form ── */
          <div className="mt-1 pt-3 border-t border-slate-955/10 space-y-2.5 animate-fade-in">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min={1}
                max={Math.max(1, saldo)}
                value={qty}
                onChange={(e) =>
                  onQtyChange(
                    Math.max(
                      1,
                      Math.min(saldo, Number.parseInt(e.target.value) || 1),
                    ),
                  )
                }
                className="w-full border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onConfirmAdd}
                className="flex-1 py-2 text-[9px] font-bold font-sans uppercase tracking-wider bg-slate-955 text-white hover:bg-slate-900 transition cursor-pointer border border-slate-955"
              >
                Adicionar ({tipoAdesao === "direta" ? "DIRETA" : "CARONA"})
              </button>
              <button
                type="button"
                onClick={onCancelAdd}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                aria-label="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans text-right">
              Subtotal:{" "}
              <strong className="text-slate-900">
                {formatCurrency(Number.parseFloat(item.valor_unitario) * qty)}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Item Table Row (list view) ─── */

function ItemTableRow({
  item,
  isAdding,
  onStartAdd,
  onConfirmAdd,
  onCancelAdd,
  qty,
  onQtyChange,
  isInCart,
}: {
  item: ItemSearchResponse;
  isAdding: boolean;
  onStartAdd: () => void;
  onConfirmAdd: () => void;
  onCancelAdd: () => void;
  qty: number;
  onQtyChange: (v: number) => void;
  isInCart: boolean;
}) {
  const saldo = Number.parseFloat(item.quantidade_saldo_disponivel);
  const totalOfertado = Number.parseFloat(item.quantidade_total_ofertada);
  const isSoldOut = saldo <= 0;

  return (
    <tr
      className={`border-b border-slate-955/8 hover:bg-[#F8FAFE] transition ${
        isInCart ? "bg-blue-50/30" : ""
      }`}
    >
      <td className="px-3 py-3 text-xs font-sans text-slate-900 max-w-[200px] truncate">
        {item.descricao_especificacao}
      </td>
      <td className="px-3 py-3 text-xs font-sans text-slate-500">
        {item.marca_modelo || "—"}
      </td>
      <td className="px-3 py-3 text-xs font-sans text-slate-500">
        {item.ata.numero_ata || "—"}
      </td>
      <td className="px-3 py-3 text-xs font-sans text-slate-500">
        {item.fornecedor?.razao_social?.slice(0, 30) || "—"}
      </td>
      <td className="px-3 py-3 text-xs font-bold text-slate-900 font-sans whitespace-nowrap">
        {formatCurrency(item.valor_unitario)}
      </td>
      <td className="px-3 py-3 text-xs font-sans text-slate-600 whitespace-nowrap">
        {formatNumber(saldo)}/{formatNumber(totalOfertado)}
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap">
        {isAdding ? (
          <div className="flex items-center gap-1 justify-end">
            <input
              type="number"
              min={1}
              max={Math.max(1, saldo)}
              value={qty}
              onChange={(e) =>
                onQtyChange(
                  Math.max(
                    1,
                    Math.min(saldo, Number.parseInt(e.target.value) || 1),
                  ),
                )
              }
              className="w-14 border border-slate-955/10 px-2 py-1 text-[10px] font-sans text-slate-900 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
            />
            <button
              onClick={onConfirmAdd}
              disabled={isSoldOut}
              className="px-2 py-1 text-[9px] font-bold font-sans uppercase tracking-wider bg-slate-955 text-white hover:bg-slate-900 transition cursor-pointer border border-slate-955 disabled:opacity-40"
            >
              OK
            </button>
            <button
              type="button"
              onClick={onCancelAdd}
              className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onStartAdd}
            disabled={isSoldOut}
            className={`px-2 py-1 text-[9px] font-bold font-sans uppercase tracking-wider border transition cursor-pointer ${
              isSoldOut
                ? "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-955 text-white border-slate-955 hover:bg-slate-900"
            }`}
          >
            {isSoldOut ? "Esgotado" : "Add"}
          </button>
        )}
      </td>
    </tr>
  );
}

/* ─── Main Component ─── */

export default function BuyerCatalog({
  onAddToCart,
  orgaoCompradorId,
  cartItemIds,
}: BuyerCatalogProps) {
  const [items, setItems] = useState<ItemSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search/filter state
  const [searchQ, setSearchQ] = useState("");
  const [filterAtaNumero, setFilterAtaNumero] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [filterFornecedorId, setFilterFornecedorId] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [suppliers, setSuppliers] = useState<FornecedorResponse[]>([]);
  const [sortBy, setSortBy] = useState("price_asc");

  // Advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Type determination cache: ATA ID → participants orgao_ids
  const [participantsCache, setParticipantsCache] = useState<
    Record<string, string[]>
  >({});

  // Add-to-cart state
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [addQty, setAddQty] = useState(1);

  // Pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Debounce effect for search/filter/page changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, any> = {
          sort: sortBy,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        };
        if (searchQ.trim()) params.q = searchQ.trim();
        if (filterAtaNumero.trim()) params.numero_ata = filterAtaNumero.trim();
        if (filterMarca.trim()) params.marca = filterMarca.trim();
        if (filterFornecedorId) params.fornecedor_id = filterFornecedorId;
        if (filterMinPrice) params.min_price = Number(filterMinPrice);
        if (filterMaxPrice) params.max_price = Number(filterMaxPrice);

        const data = await searchItems(params);
        setItems(data.content);
        setTotalItems(data.totalElements);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar o catálogo. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchQ,
    filterAtaNumero,
    filterMarca,
    filterFornecedorId,
    filterMinPrice,
    filterMaxPrice,
    sortBy,
    page,
    pageSize,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchQ(value);
    setPage(1);
  };

  const handleFilterAtaChange = (value: string) => {
    setFilterAtaNumero(value);
    setPage(1);
  };

  const handleFilterMarcaChange = (value: string) => {
    setFilterMarca(value);
    setPage(1);
  };

  const handleFilterFornecedorChange = (value: string) => {
    setFilterFornecedorId(value);
    setPage(1);
  };

  const handleFilterMinPriceChange = (value: string) => {
    setFilterMinPrice(value);
    setPage(1);
  };

  const handleFilterMaxPriceChange = (value: string) => {
    setFilterMaxPrice(value);
    setPage(1);
  };

  // Load suppliers list for the filter dropdown
  useEffect(() => {
    listSuppliers().then(setSuppliers).catch(console.error);
  }, []);

  /**
   * Determines the adhesion type by checking if the buyer's organ
   * is listed as a participant of the item's ATA.
   * Falls back to fetching ATA detail if not cached.
   */
  const getTipoAdesao = async (
    item: ItemSearchResponse,
  ): Promise<"direta" | "carona"> => {
    if (!orgaoCompradorId) return "carona";

    // Check cache
    const cached = participantsCache[item.ata.id];
    if (cached) {
      return cached.includes(orgaoCompradorId) ? "direta" : "carona";
    }

    // Fetch ATA detail to get participants
    try {
      const ataDetail = await getAta(item.ata.id);
      const orgaos: string[] = [];
      for (const ataItem of ataDetail.items) {
        if (ataItem.participantes) {
          for (const p of ataItem.participantes) {
            if (!orgaos.includes(p.orgao_id)) {
              orgaos.push(p.orgao_id);
            }
          }
        }
      }
      setParticipantsCache((prev) => ({
        ...prev,
        [item.ata.id]: orgaos,
      }));
      return orgaos.includes(orgaoCompradorId) ? "direta" : "carona";
    } catch {
      return "carona";
    }
  };

  const handleStartAdd = async (item: ItemSearchResponse) => {
    setAddingItemId(item.id);
    setAddQty(1);
  };

  const handleConfirmAdd = async (item: ItemSearchResponse) => {
    if (addQty < 1) return;
    const tipo = await getTipoAdesao(item);
    onAddToCart?.({ item, qty: addQty, type: tipo });
    setAddingItemId(null);
    setAddQty(1);
  };

  const hasActiveFilters =
    searchQ ||
    filterAtaNumero ||
    filterMarca ||
    filterFornecedorId ||
    filterMinPrice ||
    filterMaxPrice;

  return (
    <div className="animate-fade-in">
      <div className="p-6 md:p-8 space-y-6">
        {/* ── Editorial Header ── */}
        <div className="border-b border-slate-955/10 pb-4">
          <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
            MÓDULO ÓRGÃO COMPRADOR • VITRINE DE ITENS
          </span>
          <h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
            Catálogo de Itens
          </h2>
        </div>

        {/* ── Search & Filter Area ── */}
        <div className="border border-slate-955/10 bg-[#F8FAFE] p-5 relative">
          <div className="space-y-4">
            {/* Search row with view toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar por palavra-chave, descrição ou marca..."
                  className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-10 pr-4 py-2 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center border border-slate-955/10 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-slate-955 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Visualização em grade"
                  title="Grade"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition cursor-pointer ${
                    viewMode === "list"
                      ? "bg-slate-955 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Visualização em lista"
                  title="Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Advanced filters toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-[10px] font-semibold font-sans text-slate-500 hover:text-slate-700 transition cursor-pointer px-2 py-1 border border-transparent hover:border-slate-955/10"
              >
                {showAdvancedFilters
                  ? "− Ocultar Filtros Avançados"
                  : "+ Filtros Avançados"}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQ("");
                    setFilterAtaNumero("");
                    setFilterMarca("");
                    setFilterFornecedorId("");
                    setFilterMinPrice("");
                    setFilterMaxPrice("");
                    setSortBy("price_asc");
                    setPage(1);
                  }}
                  className="text-[10px] font-semibold font-sans text-red-500 hover:text-red-700 transition cursor-pointer px-2 py-1"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Advanced filters (collapsible) */}
            {showAdvancedFilters && (
              <div className="flex flex-wrap items-end gap-3 animate-fade-in pt-2 border-t border-slate-955/10">
                {/* Marca */}
                <div className="w-full sm:w-auto sm:min-w-40">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={filterMarca}
                    onChange={(e) => handleFilterMarcaChange(e.target.value)}
                    placeholder="Filtrar marca..."
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  />
                </div>

                {/* Preço mín */}
                <div className="w-full sm:w-[120px]">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Preço mín
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={filterMinPrice}
                    onChange={(e) => handleFilterMinPriceChange(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  />
                </div>

                {/* Preço máx */}
                <div className="w-full sm:w-[120px]">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Preço máx
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={filterMaxPrice}
                    onChange={(e) => handleFilterMaxPriceChange(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  />
                </div>

                {/* ATA */}
                <div className="w-full sm:w-[140px]">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    ATA
                  </label>
                  <input
                    type="text"
                    value={filterAtaNumero}
                    onChange={(e) => handleFilterAtaChange(e.target.value)}
                    placeholder="Nº ATA..."
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  />
                </div>

                {/* Fornecedor */}
                <div className="w-full sm:min-w-[180px] sm:flex-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Fornecedor
                  </label>
                  <select
                    value={filterFornecedorId}
                    onChange={(e) =>
                      handleFilterFornecedorChange(e.target.value)
                    }
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  >
                    <option value="">Todos os fornecedores</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.razao_social}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="w-full sm:w-[150px]">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
                    Ordenar
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                  >
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Loading State (Skeleton) ── */}
        {loading &&
          (viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* eslint-disable-next-line react/no-array-index-key */}
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`sk-grid-${i}`} />
              ))}
            </div>
          ) : (
            <div className="border border-slate-955/10 overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-[#F4F7FA] border-b border-slate-955/10">
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Descrição
                    </th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Marca
                    </th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      ATA
                    </th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Fornecedor
                    </th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Valor
                    </th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Saldo
                    </th>
                    <th className="text-right px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-955/8">
                  {/* eslint-disable-next-line react/no-array-index-key */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={`sk-row-${i}`} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="border border-red-200 bg-red-50/50 px-4 py-3 text-xs text-red-700 font-sans">
            {error}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-955/10 bg-[#F8FAFE]">
            <div className="w-14 h-14 bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 font-sans">
              Nenhum item encontrado
            </p>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* Result count + view toggle */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-sans">
                <strong className="text-slate-700">{totalItems}</strong> item
                {totalItems !== 1 ? "ns" : ""} encontrado
                {totalItems !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => {
                  const cachedOrgaos = participantsCache[item.ata.id];
                  const tipo =
                    cachedOrgaos && orgaoCompradorId
                      ? cachedOrgaos.includes(orgaoCompradorId)
                        ? "direta"
                        : "carona"
                      : null;
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isAdding={addingItemId === item.id}
                      onStartAdd={() => handleStartAdd(item)}
                      onConfirmAdd={() => handleConfirmAdd(item)}
                      onCancelAdd={() => {
                        setAddingItemId(null);
                        setAddQty(1);
                      }}
                      qty={addQty}
                      onQtyChange={setAddQty}
                      tipoAdesao={tipo || "carona"}
                      isInCart={cartItemIds?.has(item.id) ?? false}
                    />
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="border border-slate-955/10 overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="bg-[#F4F7FA] border-b border-slate-955/10">
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Descrição
                      </th>
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Marca
                      </th>
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        ATA
                      </th>
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Fornecedor
                      </th>
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Valor Unit.
                      </th>
                      <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Saldo
                      </th>
                      <th className="text-right px-3 py-2 font-bold text-slate-600 uppercase tracking-wider text-[9px]">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-955/8">
                    {items.map((item) => (
                      <ItemTableRow
                        key={item.id}
                        item={item}
                        isAdding={addingItemId === item.id}
                        onStartAdd={() => handleStartAdd(item)}
                        onConfirmAdd={() => handleConfirmAdd(item)}
                        onCancelAdd={() => {
                          setAddingItemId(null);
                          setAddQty(1);
                        }}
                        qty={addQty}
                        onQtyChange={setAddQty}
                        isInCart={cartItemIds?.has(item.id) ?? false}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination ── */}
            {totalItems > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-955/10">
                <span className="text-xs text-slate-500 font-sans order-2 sm:order-1">
                  {totalItems} item
                  {totalItems !== 1 ? "ns" : ""} encontrado
                  {totalItems !== 1 ? "s" : ""}
                </span>

                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Anterior</span>
                  </button>

                  {(() => {
                    const pages = getPageNumbers(page, totalPages);
                    let ellipsisCount = 0;
                    return pages.map((p) => {
                      if (p === "ellipsis") {
                        ellipsisCount++;
                        return (
                          <span
                            key={`ellipsis-${ellipsisCount}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={`page-${p}`}
                          onClick={() => setPage(p)}
                          className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${
                            p === page
                              ? "bg-slate-955 text-white border-slate-955"
                              : "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    });
                  })()}

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
