import type { LucideIcon } from "lucide-react";
import {
	Banknote,
	Bell,
	CheckCircle,
	ChevronDown,
	ClipboardList,
	Eye,
	FileUp,
	LogOut,
	Menu,
	Package,
	ShoppingCart,
	X,
} from "lucide-react";
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

interface NavItemProps {
	icon: LucideIcon;
	label: string;
	tabId: string;
	activeTab: string;
	onClick: (tabId: string) => void;
	badge?: number;
}

function NavItem({
	icon: Icon,
	label,
	tabId,
	activeTab,
	onClick,
	badge,
}: NavItemProps) {
	const isActive = activeTab === tabId;

	return (
		<button
			type="button"
			onClick={() => onClick(tabId)}
			aria-current={isActive ? "page" : undefined}
			className={`w-full text-left px-3 py-2 text-xs font-sans font-medium border transition cursor-pointer flex items-center gap-2.5 ${
				isActive
					? "border-slate-950 bg-slate-950 text-white"
					: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
			}`}
		>
			<Icon className="w-3.5 h-3.5 shrink-0" />
			<span className="flex-1">{label}</span>
			{badge != null && badge > 0 && (
				<span
					className={`px-1.5 py-0.5 text-[10px] font-sans font-bold rounded-sm ${
						isActive ? "bg-white text-slate-950" : "bg-slate-950 text-white"
					}`}
				>
					{badge}
				</span>
			)}
		</button>
	);
}

const NAV_ITEMS: Record<
	string,
	{ icon: LucideIcon; label: string; tabId: string }[]
> = {
	COMPRADOR: [
		{ icon: Package, label: "Vitrine (Catálogo)", tabId: "vitrine" },
		{ icon: ShoppingCart, label: "Carrinho", tabId: "carrinho" },
		{ icon: ClipboardList, label: "Meus Pedidos", tabId: "pedidos" },
	],
	ADMIN_GERENCIADOR: [
		{
			icon: CheckCircle,
			label: "Autorizações Pendentes",
			tabId: "autorizacoes",
		},
		{ icon: FileUp, label: "Cadastro / Upload ATA", tabId: "cadastro" },
		{ icon: Eye, label: "Monitoramento Geral", tabId: "monitoramento" },
	],
	FORNECEDOR: [
		{ icon: Banknote, label: "Central de Saldos", tabId: "saldos" },
		{ icon: Bell, label: "Notificações de Vendas", tabId: "vendas" },
	],
};

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
	const [activeRole, setActiveRole] = useState<string>(user.papel);
	const [activeTab, setActiveTab] = useState<string>("");
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

	// Close mobile sidebar on Escape
	useEffect(() => {
		if (!isSidebarOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsSidebarOpen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isSidebarOpen]);

	// Lock body scroll when sidebar is open on mobile
	useEffect(() => {
		if (isSidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isSidebarOpen]);

	// Reset active tab on role change
	useEffect(() => {
		if (activeRole === "COMPRADOR") {
			setActiveTab("vitrine");
		} else if (activeRole === "ADMIN_GERENCIADOR") {
			setActiveTab("autorizacoes");
		} else if (activeRole === "FORNECEDOR") {
			setActiveTab("saldos");
		}
	}, [activeRole]);

	const handleTabClick = (tabId: string) => {
		setActiveTab(tabId);
		setIsSidebarOpen(false);
	};

	// Cart Operations
	const cartCount = cart.reduce((acc, c) => acc + c.qty, 0);

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

	const navItems = NAV_ITEMS[activeRole] || [];

	return (
		<div className="h-screen w-screen bg-[#F7F6F2] text-slate-900 flex flex-col md:flex-row relative font-sans overflow-hidden select-none">
			{/* MOBILE HEADER */}
			<header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-950/10 bg-[#FAF9F5] shrink-0 z-30">
				<button
					type="button"
					onClick={() => setIsSidebarOpen(true)}
					aria-label="Abrir menu"
					className="p-2 -ml-2 hover:bg-slate-100 transition cursor-pointer"
				>
					<Menu className="w-5 h-5 text-slate-700" />
				</button>
				<h1 className="text-sm font-display font-light uppercase tracking-wider text-slate-900">
					BIAP
				</h1>
				<div className="w-9" />
			</header>

			{/* MOBILE SIDEBAR BACKDROP */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/30 z-40 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setIsSidebarOpen(false);
					}}
					aria-hidden="true"
				/>
			)}

			{/* SIDEBAR */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FAF9F5] border-r border-slate-950/10 flex flex-col justify-between p-6 overflow-y-auto transition-transform duration-200 ease-out md:static md:translate-x-0 ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Sidebar Top: Logo & Nav */}
				<div className="space-y-6">
					<div className="border-b border-slate-900/10 pb-4 flex items-start justify-between">
						<div>
							<span className="text-[10px] font-sans font-semibold tracking-wider text-slate-500 block uppercase">
								PORTAL REGIONAL
							</span>
							<h1 className="text-xl font-light font-display text-slate-900 uppercase tracking-wider leading-none mt-1">
								BIAP{" "}
								<span className="text-slate-500 text-xs font-sans tracking-normal">
									/ INTRANET
								</span>
							</h1>
						</div>
						<button
							type="button"
							onClick={() => setIsSidebarOpen(false)}
							aria-label="Fechar menu"
							className="p-1 -mt-1 -mr-1 hover:bg-slate-100 transition cursor-pointer md:hidden"
						>
							<X className="w-4 h-4 text-slate-500" />
						</button>
					</div>

					{/* Navigation */}
					<nav>
						<ul className="space-y-1.5" role="list">
							{navItems.map((item) => (
								<li key={item.tabId}>
									<NavItem
										icon={item.icon}
										label={item.label}
										tabId={item.tabId}
										activeTab={activeTab}
										onClick={handleTabClick}
										badge={item.tabId === "carrinho" ? cartCount : undefined}
									/>
								</li>
							))}
						</ul>
					</nav>
				</div>

				{/* Sidebar Bottom: Profile */}
				<div className="space-y-4 pt-6 border-t border-slate-900/10 mt-6 shrink-0">
					<div className="relative" ref={profileMenuRef}>
						{isProfileMenuOpen && (
							<div
								id="profile-menu-dropdown"
								role="menu"
								className="absolute bottom-full mb-2 left-0 right-0 bg-[#FAF9F5] border border-slate-950/15 shadow-xl p-4 font-sans text-xs z-50 animate-popover-in space-y-3 origin-bottom"
							>
								<span className="text-[8px] font-sans font-bold tracking-wider text-slate-500 block mb-2 border-b border-slate-950/10 pb-1">
									SESSÃO DO USUÁRIO
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
												{(
													[
														{
															role: "COMPRADOR",
															icon: ShoppingCart,
															label: "Órgão Comprador",
														},
														{
															role: "ADMIN_GERENCIADOR",
															icon: CheckCircle,
															label: "Órgão Gerenciador",
														},
														{
															role: "FORNECEDOR",
															icon: Banknote,
															label: "Fornecedor Licitante",
														},
													] as const
												).map((item) => (
													<button
														key={item.role}
														type="button"
														role="menuitem"
														onClick={() => {
															setActiveRole(item.role);
															setIsProfileMenuOpen(false);
														}}
														className={`w-full text-left px-2.5 py-1.5 text-xs font-sans font-medium border transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${
															activeRole === item.role
																? "border-slate-950 bg-slate-950 text-white"
																: "border-slate-950/10 bg-white hover:bg-slate-50 text-slate-600"
														}`}
													>
														<item.icon className="w-3.5 h-3.5 shrink-0" />
														<span>{item.label}</span>
													</button>
												))}
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
										{activeRole === "COMPRADOR" && "Comprador"}
										{activeRole === "ADMIN_GERENCIADOR" && "Gerenciador"}
										{activeRole === "FORNECEDOR" && "Fornecedor"}
									</span>
								</div>
							</div>
							<ChevronDown
								className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
							/>
						</button>
					</div>
				</div>
			</aside>

			{/* MAIN CONTENT */}
			<div className="flex-grow flex flex-col h-full md:h-screen overflow-hidden">
				<main className="flex-grow p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto pb-12">
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

						{/* Active tab content */}
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
		</div>
	);
}
