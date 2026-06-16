import { Package, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  searchItems,
  getAta,
  type ItemSearchResponse,
  type ItemAtaResponse,
  type AtaDetailResponse,
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

/* ─── Types ─── */

export interface AddToCartPayload {
  item: ItemSearchResponse;
  qty: number;
  type: "direta" | "carona";
}

interface BuyerCatalogProps {
  onAddToCart?: (payload: AddToCartPayload) => void;
  orgaoCompradorId?: string;
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
}: {
  item: ItemSearchResponse;
  isAdding: boolean;
  onStartAdd: () => void;
  onConfirmAdd: () => void;
  onCancelAdd: () => void;
  qty: number;
  onQtyChange: (v: number) => void;
  tipoAdesao: "direta" | "carona";
}) {
  const saldo = Number.parseFloat(item.quantidade_saldo_disponivel);
  const totalOfertado = Number.parseFloat(item.quantidade_total_ofertada);
  const consumidoPct =
    totalOfertado > 0
      ? Math.round(((totalOfertado - saldo) / totalOfertado) * 100)
      : 0;

  return (
    <div className="border border-slate-955/10 bg-white p-4 hover:bg-slate-50/30 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          {/* Item ID + Brand */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.numero_item && (
              <span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-wider">
                Item {item.numero_item}
              </span>
            )}
            {item.marca_modelo && (
              <span className="text-[10px] text-slate-450 font-sans">
                {item.marca_modelo}
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold font-sans uppercase tracking-wider border ${
                tipoAdesao === "direta"
                  ? "text-blue-800 bg-blue-50/50 border-blue-900/10"
                  : "text-amber-800 bg-amber-50/50 border-amber-900/10"
              }`}
            >
              {tipoAdesao === "direta" ? "PARTICIPANTE" : "CARONA"}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm font-sans text-slate-900 leading-snug">
            {item.descricao_especificacao}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans flex-wrap">
            {item.unidade_medida && <span>Unid.: {item.unidade_medida}</span>}
            <span>
              Valor unit.:{" "}
              <strong className="text-slate-900">
                {formatCurrency(item.valor_unitario)}
              </strong>
            </span>
            {item.fornecedor && (
              <span>
                Fornec.:{" "}
                <strong className="text-slate-900">
                  {item.fornecedor.razao_social}
                </strong>
              </span>
            )}
            {item.ata && <span>ATA {item.ata.numero_ata}</span>}
          </div>

          {/* Balance bar */}
          {totalOfertado > 0 && (
            <div className="mt-2 max-w-xs">
              <div className="flex justify-between text-[9px] font-sans text-slate-500 mb-0.5">
                <span>
                  Saldo:{" "}
                  <strong className="text-slate-900">
                    {formatNumber(saldo)}/{formatNumber(totalOfertado)}
                  </strong>{" "}
                  un
                </span>
                <span>{consumidoPct}% consumido</span>
              </div>
              <div className="w-full h-1.5 bg-slate-955/8 rounded-none overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${consumidoPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add to cart button */}
        {!isAdding && (
          <button
            type="button"
            onClick={onStartAdd}
            disabled={saldo <= 0}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold font-sans uppercase tracking-wider border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        )}
      </div>

      {/* Add form inline */}
      {isAdding && (
        <div className="mt-3 pt-3 border-t border-slate-955/8 bg-[#F8FAFE] p-3 flex flex-wrap items-end gap-3">
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
              className="w-20 border border-slate-955/10 px-2 py-1.5 text-xs font-sans text-slate-900 bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onConfirmAdd}
              className="px-3 py-1.5 text-[10px] font-bold font-sans uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer border border-blue-600"
            >
              Adicionar ({tipoAdesao === "direta" ? "DIRETA" : "CARONA"})
            </button>
            <button
              type="button"
              onClick={onCancelAdd}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[10px] text-slate-500 font-sans ml-auto">
            Subtotal:{" "}
            <strong className="text-slate-900">
              {formatCurrency(Number.parseFloat(item.valor_unitario) * qty)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function BuyerCatalog({
  onAddToCart,
  orgaoCompradorId,
}: BuyerCatalogProps) {
  const [items, setItems] = useState<ItemSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search/filter state
  const [searchQ, setSearchQ] = useState("");
  const [filterAtaNumero, setFilterAtaNumero] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Type determination cache: ATA ID → participants orgao_ids
  const [participantsCache, setParticipantsCache] = useState<
    Record<string, string[]>
  >({});

  // Add-to-cart state
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [addQty, setAddQty] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, any> = { sort: sortBy };
      if (searchQ.trim()) params.q = searchQ.trim();
      if (filterAtaNumero.trim()) params.numero_ata = filterAtaNumero.trim();

      const data = await searchItems(params);
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar o catálogo. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [searchQ, filterAtaNumero, sortBy]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // fetchItems will be called by the effect
    }, 300);
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editorial Section Title */}
      <div className="border-b border-slate-955/10 pb-4">
        <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
          MÓDULO ÓRGÃO COMPRADOR • VITRINE DE ITENS
        </span>
        <h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
          Vitrine de Itens (Catálogo)
        </h2>
      </div>

      {/* Search / Filter Bar */}
      <div className="bg-[#F8FAFE] border border-slate-955/10 p-5 relative">
        <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 absolute top-2 right-4">
          § BUSCA AVANÇADA
        </span>

        {/* Search field */}
        <div className="mt-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por palavra-chave (objeto, descrição, marca)..."
              className="w-full bg-white border border-slate-955/10 pl-9 pr-4 py-2 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
              Filtrar por ATA
            </label>
            <input
              type="text"
              value={filterAtaNumero}
              onChange={(e) => setFilterAtaNumero(e.target.value)}
              placeholder="Nº da ATA..."
              className="w-full bg-white border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-955/10 px-3 py-1.5 text-xs font-sans text-slate-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
            >
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
          <div className="sm:col-span-4 flex items-end">
            {(searchQ || filterAtaNumero) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQ("");
                  setFilterAtaNumero("");
                }}
                className="w-full px-3 py-1.5 text-[10px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="border border-slate-955/10 bg-white p-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-sans">
            <svg
              className="animate-spin h-4 w-4 text-biap-blue"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Carregando catálogo...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-sans">
            Nenhum item encontrado no catálogo para os filtros aplicados.
          </p>
        </div>
      )}

      {/* Item List */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-450 font-sans font-medium">
            {items.length} item{items.length !== 1 ? "ns" : ""} encontrado
            {items.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-2">
            {items.map((item) => {
              // For initial render, use cached type or assume carona
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
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
