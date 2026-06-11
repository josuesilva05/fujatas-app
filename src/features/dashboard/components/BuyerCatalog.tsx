import { Search } from "lucide-react";

interface BuyerCatalogProps {
	onAddToCart?: (item: any, qty: number, type: "direta" | "carona") => void;
}

export default function BuyerCatalog({ onAddToCart }: BuyerCatalogProps) {
	if (onAddToCart) {
		// Dummy check to satisfy tscompiler
	}
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO ÓRGÃO COMPRADOR • VITRINE DE ITENS
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Vitrine de Itens (Catálogo)
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="space-y-6">
				{/* Mock Filter Bar */}
				<div className="bg-[#FAF9F5] border border-slate-955/10 p-5 relative">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 absolute top-2 right-4">
						§ FILTRO DE PESQUISA (MOCKUP)
					</span>
					<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
						<div className="md:col-span-8 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="text"
								disabled
								placeholder="Buscar por objeto, palavra-chave ou licitante..."
								className="w-full bg-[#F7F6F2]/50 border border-slate-955/10 pl-9 pr-4 py-2 text-xs font-sans text-slate-450 cursor-not-allowed"
							/>
						</div>
						<div className="md:col-span-4">
							<input
								type="text"
								disabled
								placeholder="Filtrar por ATA"
								className="w-full bg-[#F7F6F2]/50 border border-slate-955/10 px-3 py-2 text-xs font-sans text-slate-450 cursor-not-allowed"
							/>
						</div>
					</div>
				</div>

				{/* Decorative Dotted Placeholder Area */}
				<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center space-y-4">
					<div className="max-w-md mx-auto space-y-2">
						<span className="text-xs font-sans font-bold text-slate-950 bg-slate-950/5 px-3 py-1 border border-slate-955/10 inline-block">
							Componente: Vitrine de Itens
						</span>
						<p className="text-xs text-slate-500 font-light leading-relaxed">
							Este espaço conterá a listagem de todos os itens ativos de ATAs de
							Registro de Preços sob o papel do Órgão Comprador. Contará com
							listagem paginada, filtros avançados de busca, controle de cotas e
							barra de progresso do saldo físico de cada produto.
						</p>
					</div>

					{/* Mock blueprint of item card */}
					<div className="max-w-2xl mx-auto border border-dashed border-slate-950/10 p-5 bg-[#F7F6F2]/30 text-left space-y-3 opacity-60">
						<div className="flex justify-between items-center text-[10px] font-sans text-slate-400">
							<span>ATA nº XX/2026</span>
							<span>Vigência: DD Mmm YYYY</span>
						</div>
						<div className="h-4 bg-slate-950/5 w-2/3" />
						<div className="h-3 bg-slate-950/5 w-1/3" />
						<div className="space-y-1">
							<div className="h-2 bg-slate-950/10 w-full" />
							<div className="flex justify-between text-[10px] font-sans text-slate-400">
								<span>Saldo Consumido: -- / -- un</span>
								<span>Disponível: --%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
