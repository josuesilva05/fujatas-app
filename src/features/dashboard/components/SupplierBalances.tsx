export default function SupplierBalances() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • CONTABILIDADE PÚBLICA
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Saldos do Licitante
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Central de Saldos
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Área destinada ao licitante vencedor da concorrência para
								acompanhar as cotas dos itens vencidos em licitação, divididas
								entre saldo disponível, consumido por órgãos diretos e consumido
								por caronas.
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ REGISTRO DE ADJUDICAÇÃO (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite adjudicado exige a associação da ata correspondente e a
							reserva de cotas físicas para atendimento aos órgãos públicos
							demandantes.
						</p>
						<div className="border border-dashed border-slate-950/20 p-4 bg-[#F7F6F2]/50 text-slate-400 text-center font-bold text-[10px] uppercase tracking-wide font-sans">
							[Livro de Saldos Inativo]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
