import { Building, HelpCircle, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginForm } from "@/features/auth";

// Official Brazilian Federal statistics
const STATS = [
	{
		value: "R$ 14.8B",
		label: "Volume Licitado",
		description: "Total transacionado PNCP.",
		icon: <TrendingUp className="w-4 h-4 text-current" />,
	},
	{
		value: "4.2k+",
		label: "Órgãos Públicos",
		description: "Entidades federais ativas.",
		icon: <Building className="w-4 h-4 text-current" />,
	},
	{
		value: "21.4%",
		label: "Economia Média",
		description: "Desconto em licitações.",
		icon: <Shield className="w-4 h-4 text-current" />,
	},
];

// Simulated real-time public procurement docket feed
const BOLETIM = [
	{
		data: "10 Jun 2026 - 15:42",
		titulo: "Dispensa Eletrônica nº 45/2026",
		orgao: "Ministério da Educação (MEC)",
		valor: "R$ 184.200,00",
		status: "Homologado",
		statusColor: "text-blue-800 bg-blue-50/50 border-blue-900/10",
	},
	{
		data: "10 Jun 2026 - 14:15",
		titulo: "Pregão Eletrônico nº 12/2026",
		orgao: "Superintendência da Polícia Federal",
		valor: "R$ 1.420.900,00",
		status: "Em Lances",
		statusColor: "text-emerald-800 bg-emerald-50/50 border-emerald-900/10",
	},
	{
		data: "09 Jun 2026 - 17:00",
		titulo: "Concorrência Pública nº 02/2026",
		orgao: "Tribunal Regional Eleitoral (TRE-SP)",
		valor: "R$ 4.890.000,00",
		status: "Fase Externa",
		statusColor: "text-slate-800 bg-slate-50/50 border-slate-900/10",
	},
];

// Stylized ink stamp / official seal (used in Editorial)
function OfficialSeal() {
	return (
		<div className="relative w-40 h-40 select-none pointer-events-auto group cursor-pointer transition-all duration-700 hover:rotate-6 hover:scale-105 active:scale-95">
			<svg
				className="w-full h-full text-blue-900/40 transition-colors duration-300 group-hover:text-blue-900/60"
				viewBox="0 0 200 200"
			>
				<defs>
					<path
						id="stamp-text-path"
						d="M 100, 100 m -64, 0 a 64,64 0 1,1 128,0 a 64,64 0 1,1 -128,0"
						fill="none"
					/>
				</defs>
				<circle
					cx="100"
					cy="100"
					r="76"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeDasharray="5 3"
				/>
				<circle
					cx="100"
					cy="100"
					r="68"
					fill="none"
					stroke="currentColor"
					strokeWidth="0.75"
				/>
				<text className="fill-current font-mono text-[8px] uppercase tracking-[0.18em] font-extrabold">
					<textPath href="#stamp-text-path" startOffset="0%">
						★ PLATAFORMA HOMOLOGADA ★ REG. B2G BRASIL ★ PNCP ★
					</textPath>
				</text>
				<circle
					cx="100"
					cy="100"
					r="46"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeDasharray="4 2"
				/>
				<path
					d="M100 78 L104 89 L116 89 L106 96 L110 108 L100 100 L90 108 L94 96 L84 89 L96 89 Z"
					fill="currentColor"
				/>
				<text
					x="100"
					y="122"
					textAnchor="middle"
					className="fill-current font-sans text-[7px] font-black tracking-widest uppercase"
				>
					AUDITADO
				</text>
			</svg>
			<div className="absolute inset-0 bg-radial-bleed mix-blend-color-burn pointer-events-none opacity-40" />
		</div>
	);
}

interface LoginPageProps {
	onLoginSuccess: (user: {
		access_token: string;
		id: string;
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	}) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
	const [currentTime, setCurrentTime] = useState("");

	// Live official system clock
	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			setCurrentTime(
				now.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" }),
			);
		};
		updateTime();
		const timer = setInterval(updateTime, 60000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="min-h-screen relative overflow-hidden">
			<div className="min-h-screen bg-[#F7F6F2] text-slate-955 flex flex-col md:flex-row relative font-sans overflow-hidden select-none">
				{/* COLUMN 1: STARK INDEX MARGIN */}
				<div className="w-16 lg:w-20 border-r border-slate-955/10 flex flex-col items-center justify-between py-12 shrink-0 hidden md:flex">
					<div className="flex items-center justify-center w-8 h-8 bg-slate-955 text-white font-mono text-xs font-bold">
						DF
					</div>
					<div className="vertical-text text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 font-mono select-none">
						SISTEMA INTEGRADO DE AQUISIÇÕES FEDERAIS
					</div>
					<div className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
						V1.04
					</div>
				</div>

				{/* COLUMN 2: THE OFFICIAL LEDGER & LAW ABSTRACT */}
				<div className="flex-1 min-w-0 flex flex-col justify-between p-8 md:p-12 lg:p-14 relative">
					{/* Top Header */}
					<div className="border-b border-slate-900/10 pb-6">
						<div className="flex items-center gap-2 mb-3">
							<span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 font-mono">
								DIÁRIO DE COMPRAS PÚBLICAS
							</span>
						</div>
						<h1 className="text-3xl lg:text-4xl font-extralight tracking-[0.14em] text-slate-955 uppercase font-display leading-none">
							BIAP
						</h1>
						<span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-2 font-mono">
							E-commerce Público B2G
						</span>
					</div>

					{/* Center: Legal Abstract Section & Bulletin Feed */}
					<div className="my-6 space-y-6">
						<div>
							<span className="text-[10px] font-mono font-bold tracking-[0.15em] text-slate-400 block mb-2">
								§ 37 DA CONSTITUIÇÃO FEDERAL • LEI 14.133/21
							</span>
							<div className="border-y border-slate-950/10 py-5 pr-4 relative">
								<p className="text-sm lg:text-[15px] text-slate-700 leading-relaxed font-light font-sans text-justify italic">
									"A publicidade, a moralidade, a impessoalidade e a eficiência
									norteiam as aquisições públicas. A plataforma BIAP constitui
									via eletrônica homologada de concorrência transparente para a
									venda e intermediação de fornecimento de bens à Administração
									Pública."
								</p>
							</div>
						</div>

						{/* Boletim de atos públicos recentes */}
						<div className="border-b border-slate-955/10 pb-6 relative">
							<span className="text-[10px] font-mono font-bold tracking-[0.15em] text-slate-400 block mb-3.5">
								ATOS E DIÁRIOS PUBLICADOS RECENTEMENTE
							</span>
							<div className="space-y-3 max-w-[580px]">
								{BOLETIM.map((ato) => (
									<div
										key={ato.titulo}
										className="flex justify-between items-start gap-4 border-b border-dashed border-slate-955/10 pb-2.5"
									>
										<div className="space-y-0.5">
											<span className="text-[9px] font-mono text-slate-400 font-bold block">
												{ato.data}
											</span>
											<h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
												{ato.titulo}
											</h4>
											<p className="text-[11px] text-slate-550 font-light">
												{ato.orgao}
											</p>
										</div>
										<div className="text-right shrink-0">
											<span
												className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-none ${ato.statusColor}`}
											>
												{ato.status}
											</span>
											<span className="text-[11px] font-mono font-bold text-slate-900 block mt-1">
												{ato.valor}
											</span>
										</div>
									</div>
								))}
							</div>

							{/* Official stamp overlapping the column boundary */}
							<div className="absolute -bottom-12 -right-8 lg:-right-10 rotate-[-10deg] z-20 hidden md:block">
								<OfficialSeal />
							</div>
						</div>
					</div>

					{/* Bottom: Statistics grid */}
					<div className="border-t border-slate-900/10 pt-6">
						<div className="grid grid-cols-3 gap-6">
							{STATS.map((stat) => (
								<div key={stat.label} className="space-y-1.5 text-slate-800">
									<div className="flex items-center gap-1.5 text-slate-450">
										{stat.icon}
										<span className="text-[10px] uppercase tracking-widest font-bold font-mono">
											{stat.label}
										</span>
									</div>
									<h4 className="text-2xl lg:text-3xl font-extralight font-display text-slate-955 tracking-tight leading-none">
										{stat.value}
									</h4>
									<p className="text-[10px] text-slate-400 leading-snug font-light font-sans">
										{stat.description}
									</p>
								</div>
							))}
						</div>

						{/* System feed info */}
						<div className="mt-6 pt-4 border-t border-slate-900/10 flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
							<span>Sessão Oficial Ativa</span>
							<span>{currentTime}</span>
						</div>
					</div>
				</div>

				{/* COLUMN 3: STARK LOGIN PANEL */}
				<div className="w-full md:w-[35%] lg:w-[30%] shrink-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 relative bg-[#FAF9F5] z-10 border-l border-slate-955/10">
					{/* Top right buttons */}
					<div className="flex justify-end items-center gap-3 mb-10 md:mb-0">
						<a
							href="https://www.gov.br/transparencia/pt-br"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-900 transition font-bold uppercase tracking-widest font-mono border border-slate-950/10 px-3 py-1.5 hover:bg-white bg-transparent"
						>
							<span>Transparência</span>
						</a>
						<button
							type="button"
							className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-900 transition font-bold uppercase tracking-widest font-mono border border-slate-955/10 px-3 py-1.5 bg-transparent hover:bg-white"
						>
							<HelpCircle className="w-3.5 h-3.5" />
							<span>Suporte</span>
						</button>
					</div>

					{/* Middle Center Form Container */}
					<div className="flex-grow flex items-center justify-center py-6 md:py-12 w-full max-w-[300px] mx-auto">
						<div className="w-full animate-fade-in">
							<LoginForm onLoginSuccess={onLoginSuccess} variant="editorial" />
						</div>
					</div>

					{/* Footer info */}
					<div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono gap-3 border-t border-slate-955/10 pt-5 mt-8">
						<span>© {new Date().getFullYear()} BIAP.</span>
						<div className="flex gap-3">
							<a href="#privacy" className="hover:text-slate-955 transition">
								Privacidade
							</a>
							<a href="#terms" className="hover:text-slate-955 transition">
								Termos
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* CSS ANIMATIONS AND UTILITIES */}
			<style>{`
				@keyframes fadeIn {
					0% {
						opacity: 0;
						transform: translateY(8px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
				.bg-radial-bleed {
					background: radial-gradient(circle, transparent 40%, rgba(247, 246, 242, 0.98) 78%);
				}
				.vertical-text {
					writing-mode: vertical-rl;
					text-orientation: mixed;
					transform: rotate(180deg);
				}
			`}</style>
		</div>
	);
}
