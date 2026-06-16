import { ChevronLeft, ChevronRight, Clock, Search, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	getSupplierOrders,
	type SupplierOrder,
} from "@/services/supplierService";


const STATUS_OPTIONS = ["PENDENTE", "AUTORIZADO", "EMITIDO"] as const;

const STATUS_STYLES: Record<string, string> = {
	PENDENTE: "bg-amber-50 text-amber-700 border-amber-200",
	AUTORIZADO: "bg-blue-50 text-blue-700 border-blue-200",
	EMITIDO: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_DOT: Record<string, string> = {
	PENDENTE: "bg-amber-500",
	AUTORIZADO: "bg-blue-500",
	EMITIDO: "bg-emerald-500",
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
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

export default function SupplierSales() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState<SupplierOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());

	useEffect(() => {
		const session = JSON.parse(localStorage.getItem("biap_user") || "{}");

		const fornecedorId = session.fornecedor_id;

		if (!fornecedorId) {
			setError("Fornecedor não identificado.");
			setLoading(false);
			return;
		}

		getSupplierOrders(fornecedorId)
			.then(setOrders)
			.catch((err) => {
				console.error(err);
				setError("Erro ao carregar pedidos.");
			})
			.finally(() => setLoading(false));
	}, []);

	const toggleStatus = (status: string) => {
		setActiveStatuses((prev) => {
			const next = new Set(prev);
			if (next.has(status)) next.delete(status);
			else next.add(status);
			return next;
		});
	};

	const filteredOrders = useMemo(() => {
		let result = orders;
		if (search.trim()) {
			const term = search.toLowerCase();
			result = result.filter(
				(o) =>
					o.orgao_comprador?.nome?.toLowerCase().includes(term) ||
					o.orgao_comprador?.cnpj?.includes(term),
			);
		}
		if (activeStatuses.size > 0) {
			result = result.filter((o) => activeStatuses.has(o.status));
		}
		return result;
	}, [orders, search, activeStatuses]);

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 3;
	const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
	const paginatedItems = filteredOrders.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);
	const goToPage = (page: number) =>
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);
	const hasNext = currentPage < totalPages;
	const hasPrev = currentPage > 1;

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const o of orders) {
			counts[o.status] = (counts[o.status] || 0) + 1;
		}
		return counts;
	}, [orders]);

	const statusClass = (status: string) =>
		STATUS_STYLES[status] ?? "bg-slate-50 text-slate-600 border-slate-200";

	const dotClass = (status: string) => STATUS_DOT[status] ?? "bg-slate-400";

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
					MÓDULO FORNECEDOR • FLUXO DE VENDAS
				</span>

				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Notificações de Vendas
				</h2>
			</div>

			<div className="flex gap-4 border-b border-slate-200 pb-0">
				<button
					type="button"
					onClick={() => navigate("/fornecedor/saldos")}
					className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer -mb-[1px] border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
				>
					Central de Saldos
				</button>
				<button
					type="button"
					onClick={() => navigate("/fornecedor/vendas")}
					className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer -mb-[1px] border-slate-955 text-slate-955"
				>
					Notificações de Vendas
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* COLUNA PRINCIPAL */}
				<div className="lg:col-span-8 space-y-4">
					{loading && (
						<div className="border border-dashed border-blue-950/10 bg-[#F8FAFE] p-8 text-center">
							Carregando pedidos...
						</div>
					)}

					{error && (
						<div className="border border-red-200 bg-red-50 p-4 text-red-600">
							{error}
						</div>
					)}

					{!loading && !error && (
						<>
							{/* Busca e filtros */}
							<div className="bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-4">
								<div className="relative max-w-md">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<input
										type="text"
										placeholder="Buscar por órgão comprador..."
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											goToPage(1);
										}}
										className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 bg-white rounded-md outline-none focus:border-slate-955/30 focus:ring-1 focus:ring-slate-955/10 transition"
									/>
								</div>
								<div className="flex flex-wrap gap-2">
									{STATUS_OPTIONS.map((status) => {
										const active = activeStatuses.has(status);
										const count = statusCounts[status] ?? 0;
										return (
											<button
												key={status}
												type="button"
												onClick={() => {
													toggleStatus(status);
													goToPage(1);
												}}
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
													active
														? statusClass(status)
														: "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${active ? dotClass(status) : "bg-slate-300"}`}
												/>
												{status}
												{count > 0 && (
													<span
														className={`ml-0.5 text-[10px] ${active ? "opacity-70" : "text-slate-400"}`}
													>
														({count})
													</span>
												)}
											</button>
										);
									})}
									{activeStatuses.size > 0 && (
										<button
											type="button"
											onClick={() => {
												setActiveStatuses(new Set());
												goToPage(1);
											}}
											className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
										>
											Limpar
										</button>
									)}
								</div>
							</div>

							{filteredOrders.length === 0 ? (
								<div className="border border-dashed border-blue-950/10 bg-[#F8FAFE] p-8 text-center">
									{search || activeStatuses.size > 0
										? "Nenhum pedido encontrado para esta busca."
										: "Nenhum pedido encontrado."}
								</div>
							) : (
								<>
									{paginatedItems.map((order) => (
										<div
											key={order.id}
											className="border border-blue-950/8 bg-[#F8FAFE] p-5"
										>
											<div className="flex justify-between items-start gap-3">
												<div className="flex items-start gap-3 min-w-0">
													<div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
														<ShoppingBag className="w-4 h-4 text-blue-600" />
													</div>
													<div className="min-w-0">
														<h3 className="font-semibold text-slate-900 truncate">
															{order.orgao_comprador?.nome}
														</h3>
														<p className="text-xs text-slate-500">
															{order.orgao_comprador?.cnpj}
														</p>
													</div>
												</div>
												<span
													className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusClass(order.status)}`}
												>
													<span
														className={`w-1.5 h-1.5 rounded-full ${dotClass(order.status)}`}
													/>
													{order.status}
												</span>
											</div>

											<div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-3">
												<div>
													<strong>Tipo:</strong> {order.tipo_adesao}
												</div>

												<div>
													<strong>Itens:</strong> {order.itens?.length ?? 0}
												</div>

												<div>
													<strong>Data:</strong>{" "}
													{new Date(order.data_pedido).toLocaleDateString(
														"pt-BR",
													)}
												</div>

												<div>
													<strong>ID:</strong> {order.id.slice(0, 8)}
												</div>
											</div>
										</div>
									))}
									{filteredOrders.length > 3 && (
										<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-955/10">
											<span className="text-xs text-slate-500 font-sans order-2 sm:order-1">
												{filteredOrders.length} pedido
												{filteredOrders.length !== 1 ? "s" : ""} encontrado
												{filteredOrders.length !== 1 ? "s" : ""}
											</span>
											<div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
												<button
													onClick={prevPage}
													disabled={!hasPrev}
													className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
												>
													<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
													<span>Anterior</span>
												</button>
												{(() => {
													const pages = getPageNumbers(currentPage, totalPages);
													let ellipsisCount = 0;
													return pages.map((p) => {
														if (p === "ellipsis") {
															ellipsisCount++;
															return (
																<span key={`ellipsis-${ellipsisCount}`} className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none">
																	...
																</span>
															);
														}
														return (
															<button
																key={`page-${p}`}
																onClick={() => goToPage(p)}
																className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${p === currentPage ? "bg-slate-955 text-white border-slate-955" : "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"}`}
															>
																{p}
															</button>
														);
													});
												})()}
												<button
													onClick={nextPage}
													disabled={!hasNext}
													className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
												>
													<span>Próximo</span>
													<ChevronRight className="w-3.5 h-3.5 shrink-0" />
												</button>
											</div>
										</div>
									)}
								</>
							)}
						</>
					)}
				</div>

				{/* COLUNA LATERAL */}
				<div className="lg:col-span-4 space-y-4">
					<div className="bg-[#F8FAFE] border border-slate-955/10 p-5">
						<div className="flex items-center gap-2 border-b border-slate-955/10 pb-3 mb-4">
							<Truck className="w-4 h-4 text-slate-500" />
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 uppercase">
								Faturamento e Logística
							</span>
						</div>

						<p className="text-xs text-slate-500 leading-relaxed mb-4">
							O trâmite logístico exige a associação da chave de acesso ou
							número da NF-e para liberação do pagamento financeiro pela
							administração pública.
						</p>

						<div className="space-y-2">
							<div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded">
								<span className="text-xs text-slate-500">Total de Pedidos</span>
								<span className="text-sm font-bold text-slate-900">{orders.length}</span>
							</div>
							<div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded">
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-amber-500" />
									<span className="text-xs text-slate-500">Pendentes</span>
								</div>
								<span className="text-sm font-bold text-amber-600">
									{orders.filter((o) => o.status === "PENDENTE").length}
								</span>
							</div>
							<div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded">
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-blue-500" />
									<span className="text-xs text-slate-500">Autorizados</span>
								</div>
								<span className="text-sm font-bold text-blue-600">
									{orders.filter((o) => o.status === "AUTORIZADO").length}
								</span>
							</div>
						</div>
					</div>

					<div className="bg-[#F8FAFE] border border-slate-955/10 p-5">
						<div className="flex items-center gap-2 pb-1">
							<Clock className="w-3.5 h-3.5 text-slate-400" />
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 uppercase">
								Última atualização
							</span>
						</div>
						<p className="text-sm text-slate-600 mt-2">
							{new Date().toLocaleString("pt-BR")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
