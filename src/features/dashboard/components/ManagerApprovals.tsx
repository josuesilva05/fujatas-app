interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

interface ManagerApprovalsProps {
	user: UserSession;
}

export default function ManagerApprovals({
	user: _user,
}: ManagerApprovalsProps) {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
					MÓDULO ÓRGÃO GERENCIADOR • AUTORIZAÇÕES
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Dashboard de Autorizações
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-blue-950/10 bg-[#F8FAFE] p-8 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Dashboard de Autorizações
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Fila de solicitações de adesões enviadas pelos Órgãos
								Compradores. O Órgão Gerenciador revisará a conformidade legal
								do pedido, autorizando ou rejeitando a adesão.
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-2">
						§ INTERATIVIDADE (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							Cada análise de adesão permitirá ao gestor homologar diretamente a
							compra ou indeferi-la, exigindo o preenchimento de justificativa.
						</p>
						<div className="border border-dashed border-blue-950/10 p-4 bg-[#F4F7FA]/50 text-slate-500 text-center font-bold text-[10px] uppercase tracking-wide font-sans">
							[Análise de Pedidos Indisponível]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
