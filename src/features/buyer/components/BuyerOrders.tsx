import { ChevronDown, ClipboardList, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { getOrderDetail, listOrders } from "@/services/orders";
import type { PedidoDetailResponse, PedidoResponse } from "@/types/order";

/* ─── Helpers ─── */

function formatCurrency(value: string | number): string {
	const num = typeof value === "string" ? Number.parseFloat(value) : value;
	return num.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function formatDate(dateStr: string): string {
	try {
		return new Date(dateStr).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

/* ─── Status badge styling ─── */

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

const STATUS_FILTERS = [
	{ value: "", label: "Todos os status" },
	{ value: "PENDENTE", label: "Pendentes" },
	{ value: "AUTORIZADO", label: "Autorizados" },
	{ value: "EMITIDO", label: "Emitidos" },
	{ value: "REJEITADO", label: "Rejeitados" },
];

/* ─── Order Card Component ─── */

function OrderCard({ order }: { order: PedidoResponse }) {
	const [expanded, setExpanded] = useState(false);
	const [detail, setDetail] = useState<PedidoDetailResponse | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDENTE;

	useEffect(() => {
		if (!expanded || detail) return;
		setLoadingDetail(true);
		getOrderDetail(order.id)
			.then(setDetail)
			.catch(console.error)
			.finally(() => setLoadingDetail(false));
	}, [expanded, order.id, detail]);

	return (
		<div className="border border-slate-955/10 bg-white">
			{/* Header */}
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
			>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3 flex-wrap">
						<span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-wider">
							Pedido #{order.id.slice(0, 8).toUpperCase()}
						</span>
						<span
							className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border ${statusStyle.color} ${statusStyle.bg} ${statusStyle.border}`}
						>
							{statusStyle.label}
						</span>
						<span
							className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border ${
								order.tipo_adesao === "DIRETA"
									? "text-blue-800 bg-blue-50/50 border-blue-900/10"
									: "text-amber-800 bg-amber-50/50 border-amber-900/10"
							}`}
						>
							{order.tipo_adesao === "DIRETA" ? "DIRETA" : "CARONA"}
						</span>
					</div>
					<div className="flex items-center gap-3 mt-1">
						<span className="text-[10px] text-slate-500 font-sans">
							{formatDate(order.data_pedido)}
						</span>
						{order.status === "REJEITADO" && order.justificativa_rejeicao && (
							<span className="text-[10px] text-red-500 font-sans italic max-w-[200px] truncate">
								Motivo: {order.justificativa_rejeicao}
							</span>
						)}
					</div>
				</div>
				<ChevronDown
					className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
						expanded ? "rotate-180" : ""
					}`}
				/>
			</button>

			{/* Expanded Details */}
			{expanded && (
				<div className="border-t border-slate-955/8 p-4">
					{loadingDetail && (
						<div className="text-center py-4">
							<div className="inline-flex items-center gap-2 text-xs text-slate-500 font-sans">
								<svg
									className="animate-spin h-3.5 w-3.5 text-biap-blue"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Carregando detalhes...
							</div>
						</div>
					)}

					{!loadingDetail && detail && (
						<div className="space-y-4">
							{/* Order Info */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-sans">
								<div>
									<span className="text-slate-500 block font-bold uppercase tracking-wider">
										Órgão
									</span>
									<span className="text-slate-900 font-medium">
										{detail.orgao_comprador?.nome || "—"}
									</span>
								</div>
								{detail.orgao_comprador?.cnpj && (
									<div>
										<span className="text-slate-500 block font-bold uppercase tracking-wider">
											CNPJ
										</span>
										<span className="text-slate-900 font-medium">
											{detail.orgao_comprador.cnpj}
										</span>
									</div>
								)}
								<div>
									<span className="text-slate-500 block font-bold uppercase tracking-wider">
										Data
									</span>
									<span className="text-slate-900 font-medium">
										{formatDate(order.data_pedido)}
									</span>
								</div>
								<div>
									<span className="text-slate-500 block font-bold uppercase tracking-wider">
										Total de Itens
									</span>
									<span className="text-slate-900 font-medium">
										{detail.itens?.length || 0} item(ns)
									</span>
								</div>
							</div>

							{/* Items Table */}
							{detail.itens && detail.itens.length > 0 && (
								<div>
									<span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans block mb-2">
										Itens do Pedido
									</span>
									<div className="border border-slate-955/10 overflow-x-auto">
										<table className="w-full text-[10px] font-sans">
											<thead>
												<tr className="bg-[#F4F7FA] border-b border-slate-955/10">
													<th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider">
														Item
													</th>
													<th className="text-left px-3 py-2 font-bold text-slate-600 uppercase tracking-wider">
														Descrição
													</th>
													<th className="text-right px-3 py-2 font-bold text-slate-600 uppercase tracking-wider">
														Qtd
													</th>
													<th className="text-right px-3 py-2 font-bold text-slate-600 uppercase tracking-wider">
														Valor Unit.
													</th>
													<th className="text-right px-3 py-2 font-bold text-slate-600 uppercase tracking-wider">
														Subtotal
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-955/8">
												{detail.itens.map((item) => (
													<tr key={item.id} className="hover:bg-slate-50/30">
														<td className="px-3 py-2 text-slate-500">
															{item.item_ata?.numero_item || "—"}
														</td>
														<td
															className="px-3 py-2 text-slate-900 max-w-[200px] truncate"
															title={item.item_ata?.descricao_especificacao}
														>
															{item.item_ata?.descricao_especificacao}
														</td>
														<td className="px-3 py-2 text-right text-slate-900 font-medium">
															{Number(
																item.quantidade_solicitada,
															).toLocaleString("pt-BR")}
														</td>
														<td className="px-3 py-2 text-right text-slate-900 font-medium">
															{formatCurrency(item.preco_unitario_no_pedido)}
														</td>
														<td className="px-3 py-2 text-right text-slate-900 font-bold">
															{formatCurrency(item.subtotal)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Total */}
									<div className="flex justify-end mt-2 text-xs font-sans">
										<span className="font-bold text-slate-900">
											Total:{" "}
											{formatCurrency(
												detail.itens.reduce(
													(acc, i) => acc + Number.parseFloat(i.subtotal),
													0,
												),
											)}
										</span>
									</div>
								</div>
							)}

							{/* Rejection reason */}
							{order.status === "REJEITADO" && order.justificativa_rejeicao && (
								<div className="border border-red-200 bg-red-50 p-3">
									<span className="text-[9px] font-bold uppercase tracking-wider text-red-700 font-sans block mb-1">
										Justificativa de Rejeição
									</span>
									<p className="text-[11px] text-red-700 font-sans">
										{order.justificativa_rejeicao}
									</p>
								</div>
							)}

							{/* Authorization info */}
							{(order.status === "AUTORIZADO" || order.status === "EMITIDO") &&
								order.data_autorizacao && (
									<div className="border border-emerald-200 bg-emerald-50 p-3">
										<span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 font-sans block mb-1">
											Autorização
										</span>
										<p className="text-[11px] text-emerald-700 font-sans">
											Autorizado em {formatDate(order.data_autorizacao)}
										</p>
									</div>
								)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

/* ─── Main Component ─── */

export default function BuyerOrders() {
	const { role: rolePath } = useParams();
	const role = rolePath ?? "comprador";
	const [orders, setOrders] = useState<PedidoResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const pageSize = 20;

	useEffect(() => {
		setPage(1);
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const data = await listOrders(0, pageSize + 1);
				const items = data.slice(0, pageSize);
				setHasMore(data.length > pageSize);
				setOrders(items);
			} catch (err: unknown) {
				console.error(err);
				setError("Erro ao carregar pedidos. Verifique sua conexão.");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const handleLoadMore = async () => {
		const nextPage = page + 1;
		setPage(nextPage);
		setLoading(true);
		try {
			const data = await listOrders((nextPage - 1) * pageSize, pageSize + 1);
			const items = data.slice(0, pageSize);
			setHasMore(data.length > pageSize);
			setOrders((prev) => [...prev, ...items]);
		} catch (err: unknown) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const filteredOrders = statusFilter
		? orders.filter((o) => o.status === statusFilter)
		: orders;

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">
				<div className="border-b border-slate-955/10 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO COMPRADOR • MEUS PEDIDOS
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Meus Pedidos
							</h2>
							<p className="text-xs text-slate-500 font-sans mt-2">
								Acompanhe o status dos seus pedidos de adesão. Use os filtros
								para visualizar pedidos pendentes, autorizados ou rejeitados.
							</p>
							<Breadcrumb className="mt-4">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink
											asChild
											className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
										>
											<Link to={`/${role}/vitrine`}>Catálogo</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
											Pedidos
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<Link
							to={`/${role}/vitrine`}
							className="border border-slate-950/8 px-3 py-1.5 text-xs font-sans font-medium text-slate-600 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer flex items-center gap-1.5 rounded-none shrink-0"
						>
							<Package className="w-3.5 h-3.5" />
							<span>Catálogo</span>
						</Link>
					</div>
				</div>

				{/* Status filter */}
				<div className="flex flex-wrap items-center gap-3">
					{STATUS_FILTERS.map((f) => (
						<button
							key={f.value}
							type="button"
							onClick={() => setStatusFilter(f.value)}
							className={`px-3 py-1.5 text-[10px] font-bold font-sans uppercase tracking-wider border transition cursor-pointer ${
								statusFilter === f.value
									? "bg-slate-955 text-white border-slate-955"
									: "bg-white text-slate-600 border-slate-955/10 hover:bg-slate-50"
							}`}
						>
							{f.label}
						</button>
					))}
				</div>

				{/* Loading */}
				{loading && orders.length === 0 && (
					<div className="border border-slate-955/10 bg-white p-10 text-center">
						<div className="inline-flex items-center gap-2 text-xs text-slate-500 font-sans">
							<svg
								className="animate-spin h-4 w-4 text-biap-blue"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Carregando pedidos...
						</div>
					</div>
				)}

				{/* Error */}
				{!loading && !error && orders.length === 0 && (
					<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
						<ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
						<p className="text-xs text-slate-500 font-sans">
							Nenhum pedido de adesão encontrado. Quando você efetuar um
							checkout no carrinho, seus pedidos aparecerão aqui.
						</p>
					</div>
				)}

				{!loading && error && (
					<div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
						{error}
					</div>
				)}

				{/* Order Summary Stats */}
				{!loading && !error && orders.length > 0 && (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{[
								{
									label: "Total",
									value: orders.length,
									color: "text-slate-900",
								},
								{
									label: "Pendentes",
									value: orders.filter((o) => o.status === "PENDENTE").length,
									color: "text-amber-700",
								},
								{
									label: "Autorizados",
									value: orders.filter(
										(o) => o.status === "AUTORIZADO" || o.status === "EMITIDO",
									).length,
									color: "text-emerald-700",
								},
								{
									label: "Rejeitados",
									value: orders.filter((o) => o.status === "REJEITADO").length,
									color: "text-red-700",
								},
							].map((stat) => (
								<div
									key={stat.label}
									className="bg-[#F8FAFE] border border-slate-955/10 p-4 text-center"
								>
									<span className="text-2xl font-light font-display block text-slate-955">
										{stat.value}
									</span>
									<span
										className={`text-[9px] font-bold uppercase tracking-wider font-sans ${stat.color}`}
									>
										{stat.label}
									</span>
								</div>
							))}
						</div>

						{/* Order List */}
						<div className="space-y-3">
							{filteredOrders.map((order) => (
								<OrderCard key={order.id} order={order} />
							))}
						</div>

						{/* Load More */}
						{hasMore && !loading && (
							<div className="text-center pt-4">
								<button
									type="button"
									onClick={handleLoadMore}
									className="px-5 py-2 text-[10px] font-bold font-sans uppercase tracking-wider bg-white text-slate-700 border border-slate-955/10 hover:bg-slate-50 transition cursor-pointer"
								>
									Carregar mais pedidos
								</button>
							</div>
						)}

						{loading && orders.length > 0 && (
							<div className="text-center py-4">
								<div className="inline-flex items-center gap-2 text-xs text-slate-500 font-sans">
									<svg
										className="animate-spin h-4 w-4 text-biap-blue"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Carregando mais...
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
