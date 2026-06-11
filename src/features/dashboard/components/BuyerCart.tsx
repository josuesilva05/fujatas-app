interface CartItem {
	id: string;
	ataNumero: string;
	objeto: string;
	fornecedor: string;
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
	onCheckout: (justification: string) => void;
}

export default function BuyerCart({
	cart,
	onUpdateQty,
	onRemove,
	onCheckout,
}: BuyerCartProps) {
	const _dummy = [cart, onUpdateQty, onRemove, onCheckout];
	if (_dummy) {
		// satisfy compiler
	}
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO ÓRGÃO COMPRADOR • CONCORRÊNCIA E ADESÃO
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Carrinho e Checkout
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Carrinho de Compras
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Aqui serão exibidos todos os itens selecionados para a compra,
								agrupados por ATA. Permitirá a configuração das quantidades
								desejadas e a escolha da modalidade de adesão (Órgão Direto vs.
								Órgão Carona).
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ ÁREA DE CHECKOUT (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O checkout validará os limites de compra e exigirá uma
							justificativa formal do órgão comprador conforme Decreto Federal.
						</p>
						<div className="border-t border-b border-dashed border-slate-950/10 py-3 space-y-2 text-xs">
							<div className="flex justify-between">
								<span>Subtotal estimado:</span>
								<span className="font-bold text-slate-955">R$ --,--</span>
							</div>
							<div className="flex justify-between">
								<span>Modalidade selecionada:</span>
								<span className="font-bold text-slate-955">--</span>
							</div>
						</div>
						<div className="h-9 bg-slate-950/5 w-full flex items-center justify-center font-bold text-[10px] uppercase tracking-wider text-slate-400 border border-slate-950/10 border-dashed font-sans">
							[Checkout Desabilitado]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
