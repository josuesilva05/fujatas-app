import {
	Banknote,
	CheckCircle,
	ChevronDown,
	LogOut,
	ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toast, { type ToastType } from "@/components/ui/Toast";

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

import {
	pathToRole,
	pathToTab,
	ROLE_DEFAULTS,
	roleToPath,
	TAB_ROUTES,
} from "@/lib/routes";
import type { UserSession } from "@/types/auth";

interface DashboardPageProps {
	user: UserSession;
	onLogout: () => void;
}

interface CartItem {
	id: string;
	ataNumero: string;
	ataId: string;
	objeto: string;
	fornecedor: string;
	fornecedorId: string;
	valorUnitario: number;
	saldoTotal: number;
	saldoConsumido: number;
	qty: number;
	type: "direta" | "carona";
}

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
	const { role: rolePath, tab: tabPath } = useParams();
	const navigate = useNavigate();

	const activeRole = pathToRole(rolePath ?? "");
	const activeTab = tabPath
		? pathToTab(activeRole, tabPath)
		: (ROLE_DEFAULTS[activeRole] ?? "");

	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

	// Redirect if URL doesn't match user role (admins can access all roles)
	useEffect(() => {
		if (user.papel === "ADMIN_GERENCIADOR") return;
		const expectedPath = roleToPath(user.papel);
		if (rolePath !== expectedPath) {
			navigate(`/${expectedPath}/${ROLE_DEFAULTS[user.papel] ?? "vitrine"}`, {
				replace: true,
			});
		}
	}, [user.papel, rolePath, navigate]);

	// Redirect to default tab if current tab is invalid for the role
	useEffect(() => {
		const roleTabs = TAB_ROUTES[activeRole];
		if (roleTabs && tabPath && !roleTabs[activeTab]) {
			navigate(`/${roleToPath(activeRole)}/${ROLE_DEFAULTS[activeRole]}`, {
				replace: true,
			});
		}
	}, [activeRole, activeTab, tabPath, navigate]);

	const [cart, setCart] = useState<CartItem[]>(() => {
		try {
			const saved = localStorage.getItem("biap_cart");
			return saved ? (JSON.parse(saved) as CartItem[]) : [];
		} catch {
			return [];
		}
	});

	const [toast, setToast] = useState<{
		message: string;
		type: ToastType;
	} | null>(null);
	const showToast = useCallback(
		(message: string, type: ToastType = "success") => {
			setToast({ message, type });
		},
		[],
	);

	// Sync cart to localStorage
	useEffect(() => {
		localStorage.setItem("biap_cart", JSON.stringify(cart));
	}, [cart]);

	// Cart item IDs set for badge display in vitrine
	const cartItemIds = new Set(cart.map((item) => item.id));

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

	const navigateToRole = (role: string) => {
		navigate(`/${roleToPath(role)}/${ROLE_DEFAULTS[role]}`, { replace: true });
	};

	// Cart Operations
	const cartCount = cart.reduce((acc, c) => acc + c.qty, 0);

	const handleAddToCart = (payload: {
		item: {
			id: string;
			descricao_especificacao: string;
			valor_unitario: string;
			fornecedor: { id: string; razao_social: string };
			quantidade_total_ofertada: string;
			quantidade_saldo_disponivel: string;
			ata: { id: string; numero_ata: string };
		};
		qty: number;
		type: "direta" | "carona";
	}) => {
		setCart((prev) => {
			const existingIndex = prev.findIndex(
				(c) => c.id === payload.item.id && c.type === payload.type,
			);
			if (existingIndex > -1) {
				const updated = [...prev];
				updated[existingIndex].qty += payload.qty;
				showToast(
					`Quantidade atualizada: ${payload.item.descricao_especificacao.slice(0, 60)} (${updated[existingIndex].qty} un)`,
				);
				return updated;
			}
			showToast(
				`"${payload.item.descricao_especificacao.slice(0, 60)}" adicionado ao carrinho`,
			);
			return [
				...prev,
				{
					id: payload.item.id,
					ataNumero: payload.item.ata.numero_ata,
					ataId: payload.item.ata.id,
					objeto: payload.item.descricao_especificacao,
					fornecedor: payload.item.fornecedor?.razao_social || "",
					fornecedorId: payload.item.fornecedor?.id || "",
					valorUnitario: Number.parseFloat(payload.item.valor_unitario),
					saldoTotal: Number.parseFloat(payload.item.quantidade_total_ofertada),
					saldoConsumido: Number.parseFloat(
						payload.item.quantidade_saldo_disponivel,
					),
					qty: payload.qty,
					type: payload.type,
				},
			];
		});
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
		<div className="h-screen w-screen bg-[#F4F7FA] bg-pattern-document text-slate-900 flex flex-col relative font-sans overflow-hidden select-none">
			{/* BRANDING HEADER */}
			<header className="shrink-0 z-30 bg-[#EFF3F8] border-b border-blue-950/8">
				<div className="flex items-center justify-between px-4 md:px-6 h-12">
					{/* Left: Logo */}
					<div className="flex items-center gap-3 min-w-0">
						<div className="min-w-0">
							<span className="text-[10px] font-sans font-semibold tracking-wider text-slate-500 hidden sm:block uppercase leading-none">
								PORTAL REGIONAL
							</span>
							<h1 className="text-lg md:text-xl font-light font-display text-slate-900 uppercase tracking-wider leading-none mt-0.5 truncate">
								BIAP
								<span className="text-slate-500 text-[10px] md:text-xs font-sans tracking-normal hidden sm:inline">
									&nbsp;/ INTRANET
								</span>
							</h1>
						</div>
					</div>

					{/* Right: Profile */}
					<div className="flex items-center gap-4">
						<div className="relative flex-shrink-0" ref={profileMenuRef}>
							<button
								type="button"
								onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
								aria-haspopup="menu"
								aria-expanded={isProfileMenuOpen}
								aria-controls={
									isProfileMenuOpen ? "profile-menu-dropdown" : undefined
								}
								className="flex items-center gap-2 p-1.5 -mr-1.5 hover:bg-slate-100 transition cursor-pointer"
							>
								<div className="w-7 h-7 md:w-8 md:h-8 shrink-0 bg-slate-950 text-white font-sans flex items-center justify-center font-bold text-[10px] md:text-xs border border-slate-950">
									{user.email.charAt(0).toUpperCase()}
								</div>
								<span className="hidden md:block text-xs font-sans font-medium text-slate-700 max-w-[120px] truncate">
									{user.email.split("@")[0]}
								</span>
								<ChevronDown
									className={`w-3 h-3 text-slate-500 transition-transform duration-200 hidden md:block ${isProfileMenuOpen ? "rotate-180" : ""}`}
								/>
							</button>

							{isProfileMenuOpen && (
								<div
									id="profile-menu-dropdown"
									role="menu"
									className="absolute top-full right-0 mt-1 min-w-[240px] bg-[#EFF3F8] border border-blue-950/10 shadow-xl p-4 font-sans text-xs z-50 animate-popover-in space-y-3 origin-top-right"
								>
									<span className="text-[8px] font-sans font-bold tracking-wider text-slate-500 block mb-2 border-b border-blue-950/8 pb-1 uppercase">
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
											<div className="border-t border-blue-950/8 pt-2.5">
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
																navigateToRole(item.role);
																setIsProfileMenuOpen(false);
															}}
															className={`w-full text-left px-2.5 py-1.5 text-xs font-sans font-medium border transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 ${
																activeRole === item.role
																	? "border-blue-600 bg-blue-600 text-white"
																	: "border-blue-950/8 bg-white hover:bg-slate-50 text-slate-600"
															}`}
														>
															<item.icon className="w-3.5 h-3.5 shrink-0" />
															<span>{item.label}</span>
														</button>
													))}
												</div>
											</div>
										)}
										<div className="border-t border-blue-950/8 pt-2.5">
											<button
												type="button"
												role="menuitem"
												onClick={onLogout}
												className="w-full flex items-center justify-between hover:bg-slate-950 hover:text-white border border-blue-950/8 hover:border-slate-950 transition font-medium text-xs cursor-pointer p-2 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
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
						</div>
					</div>
				</div>
			</header>

			{/* MAIN CONTENT — full bleed */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<main className="flex-1 overflow-y-auto">
					<div className="relative min-h-full animate-fade-in">
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
									<BuyerCatalog
										onAddToCart={handleAddToCart}
										orgaoCompradorId={user.orgao_id || undefined}
										cartItemIds={cartItemIds}
										cartCount={cartCount}
									/>
								)}
								{activeTab === "carrinho" && (
									<BuyerCart
										cart={cart}
										onUpdateQty={handleUpdateCartQty}
										onRemove={handleRemoveCartItem}
										onCheckout={handleCheckoutSuccess}
										orgaoCompradorId={user.orgao_id || undefined}
										showToast={showToast}
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
								{activeTab === "saldos" && <SupplierBalances user={user} />}
								{activeTab === "vendas" && <SupplierSales user={user} />}
							</>
						)}
					</div>
				</main>
			</div>

			{/* Toast Notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	);
}
