import Button from "@/components/ui/Button";

interface DashboardPageProps {
	user: {
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	};
	onLogout: () => void;
}

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
	const getRoleLabel = (papel: string) => {
		switch (papel) {
			case "ADMIN_GERENCIADOR":
				return "Administrador Gestor";
			case "COMPRADOR":
				return "Órgão Comprador";
			case "FORNECEDOR":
				return "Fornecedor Licitante";
			default:
				return papel;
		}
	};

	const getRoleColor = (papel: string) => {
		switch (papel) {
			case "ADMIN_GERENCIADOR":
				return "bg-blue-50 text-blue-700 border-blue-200";
			case "COMPRADOR":
				return "bg-purple-50 text-purple-700 border-purple-200";
			case "FORNECEDOR":
				return "bg-emerald-50 text-emerald-700 border-emerald-200";
			default:
				return "bg-slate-50 text-slate-700 border-slate-200";
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans select-none">
			{/* Top Corporate Bar */}
			<header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm relative z-10">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-9 h-9 rounded-xl bg-biap-blue shadow-md shadow-blue-500/10">
						<svg
							className="w-5 h-5 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.5}
							role="img"
							aria-label="BIAP Logo"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<div>
						<h2 className="text-md font-bold tracking-tight text-slate-900 uppercase">
							BIAP
						</h2>
						<span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block -mt-0.5">
							Painel do Usuário
						</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="hidden sm:flex flex-col text-right">
						<span className="text-xs font-semibold text-slate-900 leading-tight">
							{user.email}
						</span>
						<span className="text-[10px] text-slate-400 font-medium">
							Órgão/Identificador:{" "}
							{user.orgao_id || user.fornecedor_id || "Geral"}
						</span>
					</div>

					<span
						className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getRoleColor(
							user.papel,
						)}`}
					>
						{getRoleLabel(user.papel)}
					</span>

					<Button
						type="button"
						variant="outline"
						onClick={onLogout}
						className="py-1 px-3 h-8 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs"
					>
						<span>Sair</span>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.5}
							role="img"
							aria-label="Logout Icon"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</Button>
				</div>
			</header>

			{/* Main Workspace Area */}
			<main className="flex-grow p-6 sm:p-8 max-w-7xl w-full mx-auto grid gap-6">
				{/* Top Welcome Section */}
				<div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
					<h1 className="text-2xl font-bold font-display text-slate-900">
						Bem-vindo ao Portal de Licitações BIAP!
					</h1>
					<p className="mt-1.5 text-sm text-slate-500 max-w-2xl leading-relaxed">
						Sua autenticação foi concluída com sucesso via API segura. Abaixo
						estão as ferramentas e informações disponibilizadas para o seu
						perfil de <strong>{getRoleLabel(user.papel)}</strong>.
					</p>
				</div>

				{/* Dashboard widgets based on authenticated role */}
				{user.papel === "ADMIN_GERENCIADOR" && (
					<div className="grid gap-6">
						{/* Stats grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Atas Ativas sob sua Gestão
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									14 Atas
								</span>
								<span className="text-[10px] text-biap-green font-semibold mt-1 inline-block">
									100% de vigência
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Adesões Pendentes de Decisão
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									3 Pedidos
								</span>
								<span className="text-[10px] text-biap-warning font-semibold mt-1 inline-block">
									Aguardando justificativa
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Licitantes Ativos Homologados
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									87 Empresas
								</span>
								<span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
									Documentação em dia
								</span>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
							<h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
								Centro de Ações Administrativas
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<Button className="w-full h-11 text-xs uppercase font-extrabold tracking-wider bg-biap-brand hover:bg-slate-800 text-white rounded-xl shadow-xs cursor-pointer">
									Cadastrar Nova ATA (Carga Completa)
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Visualizar Fila de Homologação
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Configurar Limites de Carona
								</Button>
							</div>
						</div>
					</div>
				)}

				{user.papel === "COMPRADOR" && (
					<div className="grid gap-6">
						{/* Stats grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Pedidos Enviados
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									8 Pedidos
								</span>
								<span className="text-[10px] text-biap-green font-semibold mt-1 inline-block">
									5 autorizados • 3 pendentes
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Volume em Negociações
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									R$ 142K
								</span>
								<span className="text-[10px] text-biap-blue font-semibold mt-1 inline-block">
									Adesões diretas e caronas
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Itens no Carrinho
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									4 Itens
								</span>
								<span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
									Prontos para checkout
								</span>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
							<h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
								Módulo de Compras (Marketplace B2G)
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<Button className="w-full h-11 text-xs uppercase font-extrabold tracking-wider bg-biap-blue hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer">
									Pesquisar Itens & Saldo Físico
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Ir para o Carrinho de Compras
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Consultar Minhas Adesões
								</Button>
							</div>
						</div>
					</div>
				)}

				{user.papel === "FORNECEDOR" && (
					<div className="grid gap-6">
						{/* Stats grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Itens Homologados Ativos
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									6 Itens
								</span>
								<span className="text-[10px] text-biap-green font-semibold mt-1 inline-block">
									100% disponíveis
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Vendas Homologadas no Portal
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									R$ 310K
								</span>
								<span className="text-[10px] text-biap-blue font-semibold mt-1 inline-block">
									Pedidos liquidados
								</span>
							</div>

							<div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
								<span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
									Notas Fiscais de Entrega Pendentes
								</span>
								<span className="text-3xl font-bold text-slate-900 font-display block mt-1.5">
									2 Guias
								</span>
								<span className="text-[10px] text-biap-warning font-semibold mt-1 inline-block">
									Aguardando emissão
								</span>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
							<h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
								Central do Licitante
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								<Button className="w-full h-11 text-xs uppercase font-extrabold tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer">
									Ver Notificações de Vendas (Pedidos)
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Gerenciar Catálogo & Preços Vencidos
								</Button>
								<Button
									variant="outline"
									className="w-full h-11 text-xs uppercase font-extrabold tracking-wider border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
								>
									Histórico de Fornecimentos
								</Button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
