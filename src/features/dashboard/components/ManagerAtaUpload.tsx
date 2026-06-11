import { UploadCloud } from "lucide-react";

export default function ManagerAtaUpload() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO ÓRGÃO GERENCIADOR • AUTUAÇÃO PÚBLICA
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Cadastro e Upload de ATAs
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center space-y-4">
						<div className="max-w-md mx-auto space-y-2">
							<span className="text-xs font-sans font-bold text-slate-955 bg-slate-955/5 px-3 py-1 border border-slate-955/10 inline-block">
								Componente: Cadastro de ATAs
							</span>
							<p className="text-xs text-slate-500 font-light leading-relaxed">
								Este formulário permitirá o cadastramento completo de novas Atas
								de Registro de Preços, contendo o número do edital,
								identificação do órgão gerenciador, fornecedores habilitados e
								regras de compartilhamento (Caronas).
							</p>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 space-y-6">
					{/* PDF Import Box Placeholder */}
					<div className="bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-4">
						<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
							IMPORTAÇÃO (MOCKUP)
						</span>
						<p className="text-[11px] text-slate-500 font-light leading-relaxed">
							Para maior agilidade, o gestor poderá fazer upload de arquivos
							PDF/XML extraídos do PNCP para preenchimento automatizado da ata.
						</p>

						<div className="border border-dashed border-slate-950/20 bg-[#F7F6F2] p-8 text-center cursor-not-allowed relative">
							<UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
							<span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
								[Importação desabilitada]
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
