import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Import modular layouts
import {
	BuyerCart,
	BuyerCatalog,
	BuyerOrders,
	ManagerApprovals,
	ManagerAtaMonitor,
	ManagerAtaUpload,
	SupplierBalances,
	SupplierSales,
} from "@/features/dashboard";

interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

interface DashboardPageProps {
	user: UserSession;
	onLogout: () => void;
}

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

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
	// Support simulating different roles for layout preview
	const [activeRole, setActiveRole] = useState<string>(user.papel);
	const [activeTab, setActiveTab] = useState<string>("");
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

	// Shopping Cart State (high-fidelity interaction for Buyer role)
	const [cart, setCart] = useState<CartItem[]>([]);

	const profileMenuRef = useRef<HTMLDivElement>(null);

	// Close profile menu when clicking outside or pressing Escape
	useEffect(() => {
		if (!isProfileMenuOpen) return;

		const handleOutsideClick = (e: MouseEvent) => {
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(e.target as Node)
			) {
				setIsProfileMenuOpen(false);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsProfileMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isProfileMenuOpen]);

	// Reset active tab on role change to first tab of new role
	useEffect(() => {
		if (activeRole === "COMPRADOR") {
			setActiveTab("vitrine");
		} else if (activeRole === "ADMIN_GERENCIADOR") {
			setActiveTab("autorizacoes");
		} else if (activeRole === "FORNECEDOR") {
			setActiveTab("saldos");
		}
	}, [activeRole]);

	// Cart Operations
	const handleAddToCart = (
		item: any,
		qty: number,
		type: "direta" | "carona",
	) => {
		setCart((prev) => {
			const existingIndex = prev.findIndex(
				(c) => c.id === item.id && c.type === type,
			);
			if (existingIndex > -1) {
				const updated = [...prev];
				updated[existingIndex].qty += qty;
				return updated;
			}
			return [
				...prev,
				{
					id: item.id,
					ataNumero: item.ataNumero,
					objeto: item.objeto,
					fornecedor: item.fornecedor,
					valorUnitario: item.valorUnitario,
					saldoTotal: item.saldoTotal,
					saldoConsumido: item.saldoConsumido,
					qty,
					type,
				},
			];
		});
		// Switch to cart tab automatically to showcase addition
		setActiveTab("carrinho");
	};

	const handleUpdateCartQty = (id: string, qty: number) => {
		setCart((prev) =>
			prev.map((item) => (item.id === id ? { ...item, qty } : item)),
		);
	};

	const handleRemoveCartItem = (id: string) => {
		setCart((prev) => prev.filter((item) => item.id !== id));
	};

	const handleCheckoutSuccess = () => {
		setCart([]);
	};

	return (
		<div className="h-screen w-screen bg-[#F7F6F2] text-slate-900 flex flex-col md:flex-row relative font-sans overflow-hidden select-none">
			{/* LAYOUT CONTAINER: SIDEBAR & MAIN SHEET */}

			{/* SIDEBAR NAVIGATION (Adopts Column 3 visual style) */}
			<aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-950/10 flex flex-col justify-between p-6 overflow-y-auto bg-[#FAF9F5]">
				{/* Sidebar Top: Logo & Main Actions */}
				<div className="space-y-6">
					<div className="border-b border-slate-900/10 pb-4">
						<span className="text-[10px] font-sans font-semibold tracking-wider text-slate-400 block uppercase">
							PORTAL REGIONAL
						</span>
						<h1 className="text-xl font-light font-display text-slate-900 uppercase tracking-wider leading-none mt-1">
							BIAP{" "}
							<span className="text-slate-400 text-xs font-sans tracking-normal">
								/ INTRANET
							</span>
						</h1>
					</div>

					{/* Vertical Navigation Links */}
					<nav className="space-y-1.5 pt-2">
						<span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 block uppercase mb-2">
							MENU DE AÇÕES
						</span>

						{activeRole === "COMPRADOR" && (
							<>
								<button
									type="button"
									onClick={() => setActiveTab("vitrine")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "vitrine"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Vitrine (Catálogo)
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("carrinho")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition flex items-center justify-between cursor-pointer ${
										activeTab === "carrinho"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									<span>Carrinho</span>
									<span
										className={`px-1.5 py-0.5 text-[10px] font-sans font-bold rounded-sm ${
											activeTab === "carrinho"
												? "bg-white text-slate-950"
												: "bg-slate-950 text-white"
										}`}
									>
										{cart.reduce((acc, c) => acc + c.qty, 0)}
									</span>
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("pedidos")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "pedidos"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Meus Pedidos
								</button>
							</>
						)}

						{activeRole === "ADMIN_GERENCIADOR" && (
							<>
								<button
									type="button"
									onClick={() => setActiveTab("autorizacoes")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "autorizacoes"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Autorizações Pendentes
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("cadastro")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "cadastro"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Cadastro / Upload ATA
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("monitoramento")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "monitoramento"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Monitoramento Geral
								</button>
							</>
						)}

						{activeRole === "FORNECEDOR" && (
							<>
								<button
									type="button"
									onClick={() => setActiveTab("saldos")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "saldos"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Central de Saldos
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("vendas")}
									className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer ${
										activeTab === "vendas"
											? "border-slate-950 bg-slate-950 text-white"
											: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
									}`}
								>
									Notificações de Vendas
								</button>
							</>
						)}
					</nav>
				</div>

				{/* Sidebar Bottom: Session Card & Clock */}
				<div className="space-y-4 pt-6 border-t border-slate-900/10 mt-6 shrink-0">
					{/* Profile Button with Avatar & Popover Dropdown */}
					<div className="relative" ref={profileMenuRef}>
						{isProfileMenuOpen && (
							<div
								id="profile-menu-dropdown"
								role="menu"
								className="absolute bottom-full mb-2 left-0 right-0 bg-[#FAF9F5] border border-slate-950/15 shadow-xl p-4 font-sans text-xs z-50 animate-popover-in space-y-3 origin-bottom"
							>
								<span className="text-[8px] font-sans font-bold tracking-wider text-slate-400 block mb-2 border-b border-slate-950/10 pb-1">
									§ SESSÃO DO USUÁRIO
								</span>
								<div className="space-y-3">
									<div>
										<span className="text-slate-500 uppercase block font-bold text-[8px] tracking-wider mb-0.5">
											E-mail:
										</span>
										<span
											className="font-semibold text-slate-900 block truncate"
											title={user.email}
										>
											{user.email}
										</span>
									</div>
									{user.papel === "ADMIN_GERENCIADOR" && (
										<div className="border-t border-slate-950/10 pt-2.5">
											<span className="text-slate-500 uppercase block mb-1.5 font-bold text-[8px] tracking-wider">
												Perfil de Atuação:
											</span>
											<div className="space-y-1" role="none">
												<button
													type="button"
													role="menuitem"
													onClick={() => {
														setActiveRole("COMPRADOR");
														setIsProfileMenuOpen(false);
													}}
													className={`w-full text-left px-2.5 py-1.5 text-xs font-sans font-medium border transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${
														activeRole === "COMPRADOR"
															? "border-slate-950 bg-slate-950 text-white"
															: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
													}`}
												>
													<span className="text-xs">🛍️</span>
													<span>Órgão Comprador</span>
												</button>
												<button
													type="button"
													role="menuitem"
													onClick={() => {
														setActiveRole("ADMIN_GERENCIADOR");
														setIsProfileMenuOpen(false);
													}}
													className={`w-full text-left px-2.5 py-1.5 text-xs font-sans font-medium border transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${
														activeRole === "ADMIN_GERENCIADOR"
															? "border-slate-950 bg-slate-950 text-white"
															: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
													}`}
												>
													<span className="text-xs">🏛️</span>
													<span>Órgão Gerenciador</span>
												</button>
												<button
													type="button"
													role="menuitem"
													onClick={() => {
														setActiveRole("FORNECEDOR");
														setIsProfileMenuOpen(false);
													}}
													className={`w-full text-left px-2.5 py-1.5 text-xs font-sans font-medium border transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${
														activeRole === "FORNECEDOR"
															? "border-slate-950 bg-slate-950 text-white"
															: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
													}`}
												>
													<span className="text-xs">🚚</span>
													<span>Fornecedor Licitante</span>
												</button>
											</div>
										</div>
									)}
									<div className="border-t border-slate-950/10 pt-2.5">
										<button
											type="button"
											role="menuitem"
											onClick={onLogout}
											className="w-full flex items-center justify-between hover:bg-slate-950 hover:text-white border border-slate-950/10 hover:border-slate-950 transition font-medium text-xs cursor-pointer p-2 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
										>
											<span className="flex items-center gap-1.5">
												<LogOut className="w-3.5 h-3.5" />
												<span>Encerrar Sessão</span>
											</span>
										</button>
									</div>
								</div>
							</div>
						)}

						<button
							type="button"
							onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
							aria-haspopup="menu"
							aria-expanded={isProfileMenuOpen}
							aria-controls={
								isProfileMenuOpen ? "profile-menu-dropdown" : undefined
							}
							className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-950/10 hover:border-slate-950/20 transition cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-8 h-8 shrink-0 bg-slate-950 text-white font-sans flex items-center justify-center font-bold text-xs border border-slate-950">
									{user.email.charAt(0).toUpperCase()}
								</div>
								<div className="min-w-0">
									<span className="text-xs font-sans font-bold text-slate-900 block truncate">
										{user.email.split("@")[0]}
									</span>
									<span className="text-[10px] font-sans text-slate-500 block mt-0.5">
										{activeRole === "COMPRADOR" && "🛍️ Comprador"}
										{activeRole === "ADMIN_GERENCIADOR" && "🏛️ Gerenciador"}
										{activeRole === "FORNECEDOR" && "🚚 Fornecedor"}
									</span>
								</div>
							</div>
							<ChevronDown
								className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
							/>
						</button>
					</div>
				</div>
			</aside>

			{/* MAIN CONTENT SHEET */}
			<div className="flex-grow flex flex-col h-full md:h-screen overflow-hidden">
				<main className="flex-grow p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto pb-12">
					{/* Elevated Paper Sheet representing the legal dossier/docket */}
					<div className="bg-[#FAF9F5] border border-slate-950/15 p-6 md:p-10 min-h-[calc(100vh-6rem)] shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative animate-fade-in">
						{/* Official Watermark Seal */}
						<div className="absolute top-6 right-6 pointer-events-none opacity-[0.03] select-none hidden md:block">
							<svg className="w-20 h-20 text-slate-950" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeDasharray="3 2"
								/>
								<circle
									cx="50"
									cy="50"
									r="38"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
								/>
								<text
									x="50"
									y="54"
									textAnchor="middle"
									className="fill-current font-mono text-[5px] font-extrabold uppercase tracking-widest"
								>
									★ HOMOLOGADO ★
								</text>
							</svg>
						</div>

						{/* Active tab content rendering */}
						{activeRole === "COMPRADOR" && (
							<>
								{activeTab === "vitrine" && (
									<BuyerCatalog onAddToCart={handleAddToCart} />
								)}
								{activeTab === "carrinho" && (
									<BuyerCart
										cart={cart}
										onUpdateQty={handleUpdateCartQty}
										onRemove={handleRemoveCartItem}
										onCheckout={handleCheckoutSuccess}
									/>
								)}
								{activeTab === "pedidos" && <BuyerOrders />}
							</>
						)}

						{activeRole === "ADMIN_GERENCIADOR" && (
							<>
								{activeTab === "autorizacoes" && (
									<ManagerApprovals user={user} />
								)}
								{activeTab === "cadastro" && <ManagerAtaUpload user={user} />}
								{activeTab === "monitoramento" && (
									<ManagerAtaMonitor user={user} />
								)}
							</>
						)}

						{activeRole === "FORNECEDOR" && (
							<>
								{activeTab === "saldos" && <SupplierBalances />}
								{activeTab === "vendas" && <SupplierSales />}
							</>
						)}
					</div>
				</main>
			</div>

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
					animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
				@keyframes popoverIn {
					0% {
						opacity: 0;
						transform: translateY(4px) scale(0.98);
					}
					100% {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				.animate-popover-in {
					animation: popoverIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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