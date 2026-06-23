import {
	Banknote,
	Building2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Mail,
	Phone,
	Search,
	User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import {
	getSupplierOrders,
	getSuppliers,
	type SupplierItemsResponse,
} from "@/services/supplierService";
import type { FornecedorResponse, SupplierOrder } from "@/types/supplier";

const STATUS_STYLES: Record<
	string,
	{ color: string; bg: string; border: string; label: string }
> = {
	PENDENTE: {
		color: "text-amber-800",
		bg: "bg-amber-50/50",
		border: "border-amber-900/10",
		label: "Pendente",
	},
	AUTORIZADO: {
		color: "text-emerald-800",
		bg: "bg-emerald-50/50",
		border: "border-emerald-900/10",
		label: "Autorizado",
	},
	REJEITADO: {
		color: "text-red-800",
		bg: "bg-red-50/50",
		border: "border-red-900/10",
		label: "Rejeitado",
	},
	EMITIDO: {
		color: "text-blue-800",
		bg: "bg-blue-50/50",
		border: "border-blue-900/10",
		label: "Emitido",
	},
};

function getPageNumbers(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}
	const pages: (number | "ellipsis")[] = [];
	pages.push(1);
	if (current > 3) pages.push("ellipsis");
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i++) pages.push(i);
	if (current < total - 2) pages.push("ellipsis");
	pages.push(total);
	return pages;
}

interface SupplierSalesProps {
	user: {
		id: string;
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	};
}

export default function SupplierSales({ user }: SupplierSalesProps) {
	const { role: rolePath } = useParams();
	const role = rolePath ?? "fornecedor";

	const isAdminViewing =
		user.papel === "ADMIN_GERENCIADOR" && !user.fornecedor_id;

	const [suppliers, setSuppliers] = useState<FornecedorResponse[]>([]);
	const [loadingSuppliers, setLoadingSuppliers] = useState(false);
	const [supplierQ, setSupplierQ] = useState("");
	const [debouncedSupplierQ, setDebouncedSupplierQ] = useState("");
	const [supplierPage, setSupplierPage] = useState(1);
	const [supplierTotalItems, setSupplierTotalItems] = useState(0);
	const supplierPageSize = 8;

	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);
	const [orders, setOrders] = useState<SupplierOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [totalItems, setTotalItems] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(8);

	const supplierDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleSupplierSearchChange = useCallback((value: string) => {
		setSupplierQ(value);
		if (supplierDebounceRef.current !== null)
			clearTimeout(supplierDebounceRef.current);
		supplierDebounceRef.current = setTimeout(() => {
			setDebouncedSupplierQ(value);
			setSupplierPage(1);
		}, 350);
	}, []);

	useEffect(() => {
		if (isAdminViewing && !selectedSupplierId) {
			setLoadingSuppliers(true);
			getSuppliers({
				skip: (supplierPage - 1) * supplierPageSize,
				limit: supplierPageSize,
				q: debouncedSupplierQ || undefined,
			})
				.then((data) => {
					setSuppliers(data.content);
					setSupplierTotalItems(data.totalElements);
				})
				.catch(() => setError("Erro ao carregar fornecedores."))
				.finally(() => setLoadingSuppliers(false));
		}
	}, [isAdminViewing, selectedSupplierId, supplierPage, debouncedSupplierQ]);

	useEffect(() => {
		const id = selectedSupplierId || user.fornecedor_id;
		if (!id) return;

		setLoading(true);
		setError("");
		getSupplierOrders(id, {
			skip: (page - 1) * pageSize,
			limit: pageSize,
		})
			.then((data: SupplierItemsResponse<SupplierOrder>) => {
				setOrders(data.content);
				setTotalItems(data.totalElements);
			})
			.catch(() => setError("Erro ao carregar pedidos."))
			.finally(() => setLoading(false));
	}, [selectedSupplierId, user.fornecedor_id, page, pageSize]);

	useEffect(() => {
		return () => {
			if (supplierDebounceRef.current !== null)
				clearTimeout(supplierDebounceRef.current);
		};
	}, []);

	const supplierTotalPages = Math.max(
		1,
		Math.ceil(supplierTotalItems / supplierPageSize),
	);

	const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">
				<div className="border-b border-slate-955/10 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO FORNECEDOR • NOTIFICAÇÕES
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								{selectedSupplierId
									? `Pedidos — ${selectedSupplier?.razao_social ?? ""}`
									: "Central de Notificações"}
							</h2>
							<Breadcrumb className="mt-4">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink
											asChild
											className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
										>
											<Link to={`/${role}/saldos`}>Itens Ativos</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									{isAdminViewing && (
										<>
											<BreadcrumbSeparator />
											<BreadcrumbItem>
												{selectedSupplierId ? (
													<BreadcrumbLink
														asChild
														className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
													>
														<button
															type="button"
															onClick={() => setSelectedSupplierId(null)}
															className="cursor-pointer"
														>
															Fornecedores
														</button>
													</BreadcrumbLink>
												) : (
													<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
														Fornecedores
													</BreadcrumbPage>
												)}
											</BreadcrumbItem>
										</>
									)}
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
											Notificações
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<Link
								to={`/${role}/saldos`}
								className="border border-slate-950/8 px-3 py-1.5 text-xs font-sans font-medium text-slate-600 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer flex items-center gap-1.5 rounded-none"
							>
								<Banknote className="w-3.5 h-3.5" />
								<span>Itens Ativos</span>
							</Link>
						</div>
					</div>
				</div>

				{error && (
					<div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
						{error}
					</div>
				)}

				{/* Admin: supplier list */}
				{isAdminViewing && !selectedSupplierId && (
					<>
						<div className="relative w-full max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
							<input
								type="text"
								value={supplierQ}
								onChange={(e) => handleSupplierSearchChange(e.target.value)}
								placeholder="Buscar fornecedor..."
								className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-10 pr-4 py-2.5 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
							/>
						</div>

						{loadingSuppliers ? (
							<div className="flex items-center justify-center py-16">
								<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
							</div>
						) : suppliers.length === 0 ? (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
								<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">
									Nenhum fornecedor encontrado.
								</p>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{suppliers.map((s) => (
										<button
											type="button"
											key={s.id}
											onClick={() => setSelectedSupplierId(s.id)}
											className="border border-slate-955/10 bg-white p-4 text-left hover:border-blue-600 hover:shadow-sm transition cursor-pointer group"
										>
											<span className="text-xs font-bold font-sans text-slate-900 group-hover:text-blue-600 transition block truncate">
												{s.razao_social}
											</span>
											<span className="text-[10px] font-sans text-slate-500 block mt-0.5">
												{s.cnpj}
											</span>
											<div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400 font-sans">
												{s.email && (
													<span className="flex items-center gap-1 truncate">
														<Mail className="w-3 h-3 shrink-0" />
														<span className="truncate">{s.email}</span>
													</span>
												)}
												{s.telefone && (
													<span className="flex items-center gap-1 shrink-0">
														<Phone className="w-3 h-3" />
														{s.telefone}
													</span>
												)}
											</div>
											{s.nome_representante && (
												<span className="flex items-center gap-1 text-[9px] text-slate-400 font-sans mt-1">
													<User className="w-3 h-3 shrink-0" />
													<span className="truncate">
														{s.nome_representante}
													</span>
												</span>
											)}
										</button>
									))}
								</div>
								<div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-955/10">
									<div className="flex items-center gap-1 flex-wrap justify-center">
										<button
											onClick={() => setSupplierPage((p) => Math.max(1, p - 1))}
											disabled={supplierPage <= 1}
											className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
										>
											<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
											<span>Anterior</span>
										</button>
										{(() => {
											const pages = getPageNumbers(
												supplierPage,
												supplierTotalPages,
											);
											let ellipsisCount = 0;
											return pages.map((p) => {
												if (p === "ellipsis") {
													ellipsisCount++;
													return (
														<span
															key={`ellipsis-${ellipsisCount}`}
															className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none"
														>
															...
														</span>
													);
												}
												return (
													<button
														key={`page-${p}`}
														onClick={() => setSupplierPage(p)}
														className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${
															p === supplierPage
																? "bg-slate-955 text-white border-slate-955"
																: "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"
														}`}
													>
														{p}
													</button>
												);
											});
										})()}
										<button
											onClick={() => setSupplierPage((p) => p + 1)}
											disabled={supplierPage >= supplierTotalPages}
											className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
										>
											<span>Próximo</span>
											<ChevronRight className="w-3.5 h-3.5 shrink-0" />
										</button>
									</div>
								</div>
							</>
						)}
					</>
				)}

				{/* Selected supplier data or regular user data */}
				{selectedSupplierId && isAdminViewing && (
					<div>
						<button
							type="button"
							onClick={() => setSelectedSupplierId(null)}
							className="flex items-center gap-1 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500 hover:text-blue-600 transition cursor-pointer mb-4"
						>
							<ChevronLeft className="w-3.5 h-3.5" />
							Voltar para fornecedores
						</button>
						{renderOrders()}
					</div>
				)}

				{!isAdminViewing && user.fornecedor_id && renderOrders()}
			</div>
		</div>
	);

	function renderOrders() {
		if (loading) {
			return (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
				</div>
			);
		}

		if (orders.length === 0) {
			return (
				<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
					<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
					<p className="text-xs text-slate-500 font-sans">
						Nenhum pedido encontrado.
					</p>
				</div>
			);
		}

		return (
			<>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					<div className="lg:col-span-8 space-y-4">
						{orders.map((order) => (
							<div
								key={order.id}
								className="border border-slate-955/10 bg-white p-4"
							>
								<div className="flex justify-between items-start border-b border-slate-955/10 pb-3 mb-3">
									<div>
										<h3 className="font-semibold text-slate-900 text-sm">
											{order.orgao_comprador?.nome}
										</h3>
										<p className="text-xs text-slate-500 mt-0.5">
											{order.orgao_comprador?.cnpj}
										</p>
									</div>
									{(() => {
										const s =
											STATUS_STYLES[order.status] || STATUS_STYLES.PENDENTE;
										return (
											<span
												className={`text-[10px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border ${s.color} ${s.bg} ${s.border}`}
											>
												{s.label}
											</span>
										);
									})()}
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
									<div>
										<strong>Tipo:</strong> {order.tipo_adesao}
									</div>
									<div>
										<strong>Itens:</strong> {order.itens?.length ?? 0}
									</div>
									<div>
										<strong>Data:</strong>{" "}
										{new Date(order.data_pedido).toLocaleDateString("pt-BR")}
									</div>
									<div>
										<strong>ID:</strong> {order.id.slice(0, 8)}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="lg:col-span-4 space-y-5">
						<div className="bg-white border border-slate-955/10 p-5 space-y-5">
							<span className="text-xs font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-3 uppercase">
								§ FATURAMENTO E LOGÍSTICA
							</span>
							<div className="space-y-4 font-sans text-xs text-slate-500">
								<p className="leading-relaxed text-xs text-slate-600">
									O trâmite logístico exige a associação da chave de acesso ou
									número da NF-e para liberação do pagamento financeiro pela
									administração pública.
								</p>
								<div className="border border-slate-955/10 p-4 bg-[#F4F7FA]/50 space-y-2">
									<div className="flex justify-between items-center">
										<span className="font-semibold text-slate-700 text-xs">
											Total de Pedidos
										</span>
										<strong className="text-sm font-bold text-slate-955">
											{totalItems}
										</strong>
									</div>
									<div className="border-t border-slate-955/5 pt-2 space-y-1.5">
										<div className="flex justify-between items-center">
											<span className="flex items-center gap-1.5 text-xs text-amber-800">
												<span className="w-1.5 h-1.5 bg-amber-400" />
												Pendentes
											</span>
											<strong className="text-amber-800">
												{orders.filter((o) => o.status === "PENDENTE").length}
											</strong>
										</div>
										<div className="flex justify-between items-center">
											<span className="flex items-center gap-1.5 text-xs text-emerald-800">
												<span className="w-1.5 h-1.5 bg-emerald-400" />
												Autorizados
											</span>
											<strong className="text-emerald-800">
												{orders.filter((o) => o.status === "AUTORIZADO").length}
											</strong>
										</div>
									</div>
								</div>
								<div className="border border-slate-955/10 p-4 bg-[#F4F7FA]/50">
									<p className="font-bold text-xs uppercase tracking-wide mb-2 text-slate-600">
										Última atualização
									</p>
									<p className="text-xs text-slate-900">
										{new Date().toLocaleString("pt-BR")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-955/10">
					<div className="flex items-center gap-1 flex-wrap justify-center">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page <= 1}
							className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
							<span>Anterior</span>
						</button>
						{(() => {
							const pages = getPageNumbers(page, totalPages);
							let ellipsisCount = 0;
							return pages.map((p) => {
								if (p === "ellipsis") {
									ellipsisCount++;
									return (
										<span
											key={`ellipsis-${ellipsisCount}`}
											className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none"
										>
											...
										</span>
									);
								}
								return (
									<button
										key={`page-${p}`}
										onClick={() => setPage(p)}
										className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${
											p === page
												? "bg-slate-955 text-white border-slate-955"
												: "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"
										}`}
									>
										{p}
									</button>
								);
							});
						})()}
						<button
							onClick={() => setPage((p) => p + 1)}
							disabled={page >= totalPages}
							className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<span>Próximo</span>
							<ChevronRight className="w-3.5 h-3.5 shrink-0" />
						</button>
					</div>
				</div>
			</>
		);
	}
}
