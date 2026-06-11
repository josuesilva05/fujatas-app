export default function SupplierSales() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • FLUXO DE VENDAS
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Notificações de Vendas
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Notificações de Vendas
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Centralizador de Ordens de Fornecimento enviadas pelos órgãos
								públicos compradores. Permitirá o registro de Notas Fiscais
								Eletrônicas (NF-e) emitidas para os pedidos e o controle da
								logística de despacho/entrega.
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ FATURAMENTO E LOGÍSTICA (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite logístico exige a associação da chave de acesso ou
							número da NF-e para liberação do pagamento financeiro pela
							administração pública.
						</p>
						<div className="border border-dashed border-slate-950/20 p-4 bg-[#F7F6F2]/50 text-slate-400 text-center font-bold text-[10px] uppercase tracking-wide font-sans">
							[Registro de Faturamento Inativo]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
