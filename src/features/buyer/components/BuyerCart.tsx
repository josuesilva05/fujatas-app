import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import {
  FileText,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { createOrder } from "@/services/orders";

/* ─── Helpers ─── */

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* ─── Types ─── */

export interface CartItem {
  id: string; // item_ata_id
  ataNumero: string;
  ataId: string;
  objeto: string;
  fornecedor: string;
  fornecedorId: string;
  valorUnitario: number;
  saldoTotal: number;
  saldoConsumido: number;
  qty: number;
  type: "direta" | "carona";
}

interface BuyerCartProps {
  cart: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  orgaoCompradorId?: string;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateCatalog?: () => void;
}

/* ─── Cart Item Row ─── */

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = item.valorUnitario * item.qty;

  return (
    <div className="border border-slate-955/10 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-wider">
              {item.type === "direta" ? "Adesão Direta" : "Carona"}
            </span>
            <span
              className="px-1.5 py-0.5 text-[9px] font-bold font-sans uppercase tracking-wider border"
              style={{
                borderColor:
                  item.type === "direta"
                    ? "rgba(37,99,235,0.2)"
                    : "rgba(245,158,11,0.2)",
                color: item.type === "direta" ? "#1e40af" : "#92400e",
                backgroundColor:
                  item.type === "direta"
                    ? "rgba(37,99,235,0.05)"
                    : "rgba(245,158,11,0.05)",
              }}
            >
              {item.type === "direta" ? "DIRETA" : "CARONA"}
            </span>
          </div>
          <p className="text-sm font-sans text-slate-900 leading-snug">
            {item.objeto}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans">
            <span>
              ATA <strong>{item.ataNumero}</strong>
            </span>
            {item.fornecedor && <span>Fornec.: {item.fornecedor}</span>}
            <span>
              Valor unit.:{" "}
              <strong className="text-slate-900">
                {formatCurrency(item.valorUnitario)}
              </strong>
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4">
          {/* Quantity controls */}
          <div className="flex items-center border border-slate-955/10">
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
              disabled={item.qty <= 1}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 py-1 text-xs font-bold font-sans text-slate-900 min-w-[2rem] text-center border-x border-slate-955/10">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.id, item.qty + 1)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="block text-xs font-bold text-slate-900 font-sans">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
            aria-label="Remover item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function BuyerCart({
  cart,
  onUpdateQty,
  onRemove,
  onCheckout,
  orgaoCompradorId,
  showToast,
  onNavigateCatalog,
}: BuyerCartProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.valorUnitario * item.qty,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!orgaoCompradorId) {
      setCheckoutError(
        "Órgão comprador não identificado. Faça login novamente.",
      );
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    // Group items by ata_id for single-ATA order creation
    const groupedByAta = cart.reduce<
      Record<string, { ataId: string; items: CartItem[] }>
    >((acc, item) => {
      if (!acc[item.ataId]) {
        acc[item.ataId] = { ataId: item.ataId, items: [] };
      }
      acc[item.ataId].items.push(item);
      return acc;
    }, {});

    try {
      // Create one order per ATA
      for (const group of Object.values(groupedByAta)) {
        await createOrder({
          orgao_comprador_id: orgaoCompradorId,
          ata_id: group.ataId,
          itens: group.items.map((item) => ({
            item_ata_id: item.id,
            quantidade_solicitada: item.qty,
            preco_unitario_no_pedido: item.valorUnitario,
          })),
        });
      }
      setCheckoutSuccess(true);
      showToast?.(
        "Pedido(s) cadastrado(s) com sucesso! Redirecionando...",
        "success",
      );
      setTimeout(() => {
        onCheckout();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Erro ao efetuar checkout. Verifique os dados e tente novamente.";
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="p-6 md:p-8 space-y-6">
        {/* Editorial Section Title */}
        <div className="border-b border-slate-955/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
                Carrinho e Checkout
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-2">
                Revise os itens adicionados ao carrinho antes de finalizar o
                pedido de adesão.
              </p>
              <Breadcrumb className="mt-4">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
                    >
                      <button type="button" onClick={onNavigateCatalog}>
                        Vitrine
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
                      Carrinho
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {onNavigateCatalog && (
              <button
                type="button"
                onClick={onNavigateCatalog}
                className="border border-slate-950/8 px-3 py-1.5 text-xs font-sans font-medium text-slate-600 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer flex items-center gap-1.5 rounded-none shrink-0"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Catálogo</span>
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 && !checkoutSuccess && (
          <div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
            <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-sans">
              O carrinho está vazio. Navegue pelo catálogo e adicione itens para
              realizar uma solicitação de adesão.
            </p>
          </div>
        )}

        {/* Checkout Success */}
        {checkoutSuccess && (
          <div className="border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mb-3">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-emerald-800 font-sans">
              Pedido(s) cadastrado(s) com sucesso!
            </p>
            <p className="text-xs text-emerald-600 font-sans mt-1">
              Redirecionando para o histórico de pedidos...
            </p>
          </div>
        )}

        {/* Cart Items */}
        {cart.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-3">
              {cart.map((item) => (
                <CartItemRow
                  key={`${item.id}-${item.type}`}
                  item={item}
                  onUpdateQty={onUpdateQty}
                  onRemove={onRemove}
                />
              ))}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-5 sticky top-4">
              <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-2">
                § ÁREA DE CHECKOUT
              </span>

              <div className="space-y-4 font-sans text-xs">
                {/* Cart items summary */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex justify-between text-[10px] text-slate-600"
                    >
                      <span className="truncate max-w-[140px]">
                        {item.qty}x {item.objeto.slice(0, 40)}
                        {item.objeto.length > 40 ? "..." : ""}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0 ml-2">
                        {formatCurrency(item.valorUnitario * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-b border-dashed border-slate-950/10 py-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total de itens:</span>
                    <span className="font-bold text-slate-900">
                      {cart.reduce((acc, i) => acc + i.qty, 0)} un
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 font-semibold">
                      Valor total estimado:
                    </span>
                    <span className="font-bold text-slate-955">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="border border-red-200 bg-red-50 p-3 text-[10px] text-red-700 font-sans">
                    {checkoutError}
                  </div>
                )}

                {checkoutSuccess && (
                  <p className="text-[9px] text-emerald-600 font-sans text-center">
                    Redirecionando para o histórico de pedidos...
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-2.5 text-[10px] font-bold font-sans uppercase tracking-wider bg-slate-955 text-white hover:bg-slate-900 transition cursor-pointer border border-slate-955 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5"
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
                      Processando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Efetuar Pedido de Adesão
                    </>
                  )}
                </button>

                <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                  O checkout validará os limites de compra e exigirá
                  justificativa formal. Pedidos seguem para autorização do Órgão
                  Gerenciador.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
