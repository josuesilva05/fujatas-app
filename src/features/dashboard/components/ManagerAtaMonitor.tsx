interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

interface ManagerAtaMonitorProps {
	user: UserSession;
}

export default function ManagerAtaMonitor({
	user: _user,
}: ManagerAtaMonitorProps) {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
					MÓDULO ÓRGÃO GERENCIADOR • MONITORAMENTO
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Monitoramento Geral de ATAs
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-blue-950/10 bg-[#F8FAFE] p-8 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Monitoramento Geral
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Painel consolidado para acompanhamento global de todas as Atas
								de Registro de Preços criadas. Exibirá as cotas disponíveis por
								item, percentual de consumo acumulado, e vigência restante dos
								editais.
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-2">
						§ MÁTRICULA GLOBAL (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O monitor consolidará o consumo agregado de órgãos participantes
							(Diretos) e não-participantes (Caronas) para fins de controle e
							conformidade fiscal.
						</p>
						<div className="border border-dashed border-blue-950/10 p-4 bg-[#F4F7FA]/50 text-slate-500 text-center font-bold text-[10px] uppercase tracking-wide font-sans">
							[Indicadores Inativos]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
