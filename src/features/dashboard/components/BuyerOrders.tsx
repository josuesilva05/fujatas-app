export default function BuyerOrders() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
					MÓDULO ÓRGÃO COMPRADOR • DOCKET DE PEDIDOS
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Meus Pedidos
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-blue-950/10 bg-[#F8FAFE] p-8 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Meus Pedidos
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Aqui será exibido o histórico completo de solicitações de
								adesões efetuadas por este órgão público comprador. Apresentará
								informações como a data do pedido, ATA correspondente, valor
								total, status do trâmite (Rascunho, Pendente, Aprovado,
								Rejeitado) e justificativas anexadas.
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-2">
						§ STATUS DO TRÂMITE (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							As solicitações serão analisadas pelo Órgão Gerenciador da ATA
							antes de serem homologadas.
						</p>
						<div className="border-t border-b border-dashed border-slate-950/10 py-3 space-y-3 text-xs">
							<div className="flex justify-between items-center">
								<span>Pendente de Análise:</span>
								<span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border text-amber-800 bg-amber-50/50 border-amber-900/10">
									Aguardando
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span>Homologado / Autorizado:</span>
								<span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border text-emerald-800 bg-emerald-50/50 border-emerald-900/10">
									Aprovado
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span>Rejeitado (Com Justificativa):</span>
								<span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border text-red-800 bg-red-50/50 border-red-900/10">
									Recusado
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
