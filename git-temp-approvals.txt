import {
	CheckCircle,
	Eye,
	Loader2,
	Search,
	ThumbsDown,
	ThumbsUp,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	getOrderDetail,
	listOrders,
	updateOrderStatus,
} from "@/services/orders";
import type {
	ItemPedidoResponse,
	PedidoDetailResponse,
	PedidoResponse,
} from "@/types/order";
import ManagerTabs from "./ManagerTabs";

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

export default function ManagerApprovals({ user }: ManagerApprovalsProps) {
	const [orders, setOrders] = useState<PedidoResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQ, setSearchQ] = useState("");

	// Detail modal
	const [detailOrder, setDetailOrder] = useState<PedidoDetailResponse | null>(
		null,
	);
	const [loadingDetail, setLoadingDetail] = useState(false);

	// Action modal
	const [actionOrder, setActionOrder] = useState<PedidoResponse | null>(null);
	const [actionType, setActionType] = useState<
		"AUTORIZADO" | "REJEITADO" | null
	>(null);
	const [justificativa, setJustificativa] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const fetchOrders = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await listOrders(0, 200);
			setOrders(data);
		} catch {
			setError("Erro ao carregar pedidos.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleOpenDetail = async (id: string) => {
		setLoadingDetail(true);
		try {
			const data = await getOrderDetail(id);
			setDetailOrder(data);
		} catch {
			setError("Erro ao carregar detalhes do pedido.");
		} finally {
			setLoadingDetail(false);
		}
	};

	const handleOpenAction = (
		order: PedidoResponse,
		type: "AUTORIZADO" | "REJEITADO",
	) => {
		setActionOrder(order);
		setActionType(type);
		setJustificativa("");
	};

	const handleConfirmAction = async () => {
		if (!actionOrder || !actionType) return;

		if (actionType === "REJEITADO" && !justificativa.trim()) {
			return;
		}

		setSubmitting(true);
		try {
			await updateOrderStatus(
				actionOrder.id,
				actionType,
				actionType === "REJEITADO" ? justificativa.trim() : undefined,
				actionType === "AUTORIZADO" ? user.id : undefined,
			);
			setActionOrder(null);
			setActionType(null);
			setJustificativa("");
			fetchOrders();
		} catch {
			setError("Erro ao atualizar status do pedido.");
		} finally {
			setSubmitting(false);
		}
	};

	const statusFilter = searchQ.toLowerCase();
	const filteredOrders = orders.filter((o) => {
		if (!statusFilter) return true;
		return (
			o.id.toLowerCase().includes(statusFilter) ||
			o.status.toLowerCase().includes(statusFilter) ||
			o.tipo_adesao.toLowerCase().includes(statusFilter)
		);
	});

	const pendingOrders = filteredOrders.filter((o) => o.status === "PENDENTE");
	const otherOrders = filteredOrders.filter((o) => o.status !== "PENDENTE");

	const totalValue = (items: ItemPedidoResponse[]) =>
		items.reduce((acc, i) => acc + Number.parseFloat(i.subtotal), 0);

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">
				<div>
					<div className="flex items-start justify-between pb-4">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO ÓRGÃO GERENCIADOR • AUTORIZAÇÕES
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Workflow de Autorização
							</h2>
						</div>
					</div>
					<ManagerTabs activeTab="autorizacoes" />
				</div>

				{error && (
					<div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
						{error}
					</div>
				)}

				{loading && (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
					</div>
				)}

				{!loading && (
					<>
						<div className="flex items-center gap-4">
							<div className="relative flex-1 max-w-xs">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
								<input
									type="text"
									value={searchQ}
									onChange={(e) => setSearchQ(e.target.value)}
									placeholder="Buscar pedidos..."
									className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-9 pr-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
								/>
							</div>
							<span className="text-xs text-slate-500 font-sans">
								{pendingOrders.length} pendente
								{pendingOrders.length !== 1 ? "s" : ""} · {orders.length} total
							</span>
						</div>

						{pendingOrders.length === 0 && otherOrders.length === 0 && (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
								<CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">
									Nenhum pedido encontrado.
								</p>
							</div>
						)}

						{pendingOrders.length > 0 && (
							<div>
								<h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
									<span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />
									Pendentes ({pendingOrders.length})
								</h3>
								<div className="space-y-3">
									{pendingOrders.map((order) => (
										<OrderApprovalCard
											key={order.id}
											order={order}
											onViewDetail={() => handleOpenDetail(order.id)}
											onApprove={() => handleOpenAction(order, "AUTORIZADO")}
											onReject={() => handleOpenAction(order, "REJEITADO")}
										/>
									))}
								</div>
							</div>
						)}

						{otherOrders.length > 0 && (
							<div>
								<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
									Histórico ({otherOrders.length})
								</h3>
								<div className="space-y-2">
									{otherOrders.map((order) => (
										<OrderHistoryRow
											key={order.id}
											order={order}
											onViewDetail={() => handleOpenDetail(order.id)}
										/>
									))}
								</div>
							</div>
						)}
					</>
				)}

				{/* Detail Modal */}
				{detailOrder && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
						onClick={() => setDetailOrder(null)}
					>
						<div
							className="bg-white border border-slate-955/10 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between p-4 border-b border-slate-955/10">
								<span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
									Pedido #{detailOrder.id.slice(0, 8).toUpperCase()}
								</span>
								<button
									type="button"
									onClick={() => setDetailOrder(null)}
									className="p-1 hover:bg-slate-100 transition cursor-pointer"
								>
									<X className="w-4 h-4 text-slate-400" />
								</button>
							</div>
							{loadingDetail ? (
								<div className="flex items-center justify-center py-16">
									<Loader2 className="w-5 h-5 animate-spin text-slate-400" />
								</div>
							) : (
								<div className="p-4 space-y-4 text-xs font-sans">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
												Órgão Comprador
											</span>
											<span className="text-slate-900">
												{detailOrder.orgao_comprador?.nome || "—"}
											</span>
										</div>
										<div>
											<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
												CNPJ
											</span>
											<span className="text-slate-900">
												{detailOrder.orgao_comprador?.cnpj || "—"}
											</span>
										</div>
										<div>
											<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
												Data
											</span>
											<span className="text-slate-900">
												{formatDate(detailOrder.data_pedido)}
											</span>
										</div>
										<div>
											<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
												Tipo
											</span>
											<span
												className={`inline-block text-[9px] font-bold px-2 py-0.5 border ${detailOrder.tipo_adesao === "DIRETA" ? "text-blue-800 bg-blue-50/50 border-blue-900/10" : "text-amber-800 bg-amber-50/50 border-amber-900/10"}`}
											>
												{detailOrder.tipo_adesao}
											</span>
										</div>
									</div>

									{detailOrder.itens && detailOrder.itens.length > 0 && (
										<div>
											<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
												Itens
											</span>
											<table className="w-full border border-slate-955/10">
												<thead>
													<tr className="bg-[#F4F7FA] border-b border-slate-955/10 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
														<th className="text-left px-3 py-2">Item</th>
														<th className="text-left px-3 py-2">Descrição</th>
														<th className="text-right px-3 py-2">Qtd</th>
														<th className="text-right px-3 py-2">
															Valor Unit.
														</th>
														<th className="text-right px-3 py-2">Subtotal</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-slate-955/8">
													{detailOrder.itens.map((item) => (
														<tr key={item.id} className="text-[10px]">
															<td className="px-3 py-2 text-slate-500">
																{item.item_ata?.numero_item || "—"}
															</td>
															<td className="px-3 py-2 text-slate-900 max-w-[200px] truncate">
																{item.item_ata?.descricao_especificacao}
															</td>
															<td className="px-3 py-2 text-right text-slate-900">
																{Number(
																	item.quantidade_solicitada,
																).toLocaleString("pt-BR")}
															</td>
															<td className="px-3 py-2 text-right text-slate-900">
																{formatCurrency(item.preco_unitario_no_pedido)}
															</td>
															<td className="px-3 py-2 text-right text-slate-900 font-bold">
																{formatCurrency(item.subtotal)}
															</td>
														</tr>
													))}
												</tbody>
												<tfoot>
													<tr className="bg-slate-50 text-[10px] font-bold">
														<td
															colSpan={4}
															className="px-3 py-2 text-right text-slate-600"
														>
															Total
														</td>
														<td className="px-3 py-2 text-right text-slate-900">
															{formatCurrency(totalValue(detailOrder.itens))}
														</td>
													</tr>
												</tfoot>
											</table>
										</div>
									)}

									{detailOrder.justificativa_rejeicao && (
										<div className="border border-red-200 bg-red-50 p-3">
											<span className="text-[9px] font-bold text-red-700 uppercase tracking-wider block mb-1">
												Justificativa de Rejeição
											</span>
											<p className="text-[10px] text-red-700">
												{detailOrder.justificativa_rejeicao}
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Action Modal */}
				{actionOrder && actionType && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
						onClick={() => {
							setActionOrder(null);
							setActionType(null);
						}}
					>
						<div
							className="bg-white border border-slate-955/10 max-w-md w-full mx-4 p-6"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between mb-4">
								<span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
									{actionType === "AUTORIZADO"
										? "Autorizar Pedido"
										: "Rejeitar Pedido"}
								</span>
								<button
									type="button"
									onClick={() => {
										setActionOrder(null);
										setActionType(null);
									}}
									className="p-1 hover:bg-slate-100 transition cursor-pointer"
								>
									<X className="w-4 h-4 text-slate-400" />
								</button>
							</div>

							<p className="text-xs text-slate-600 font-sans mb-4">
								{actionType === "AUTORIZADO"
									? `Confirmar autorização do pedido #${actionOrder.id.slice(0, 8).toUpperCase()}?`
									: `Informe a justificativa para rejeitar o pedido #${actionOrder.id.slice(0, 8).toUpperCase()}.`}
							</p>

							{actionType === "REJEITADO" && (
								<div className="mb-4">
									<label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">
										Justificativa *
									</label>
									<textarea
										value={justificativa}
										onChange={(e) => setJustificativa(e.target.value)}
										rows={3}
										placeholder="Descreva o motivo da rejeição..."
										className="w-full border border-slate-955/10 px-3 py-2 text-xs font-sans text-slate-900 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 resize-none"
									/>
								</div>
							)}

							<div className="flex items-center gap-3 justify-end">
								<button
									type="button"
									onClick={() => {
										setActionOrder(null);
										setActionType(null);
									}}
									className="px-4 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={handleConfirmAction}
									disabled={
										submitting ||
										(actionType === "REJEITADO" && !justificativa.trim())
									}
									className={`px-4 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
										actionType === "AUTORIZADO"
											? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
											: "bg-red-600 text-white border-red-600 hover:bg-red-700"
									}`}
								>
									{submitting ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : actionType === "AUTORIZADO" ? (
										<ThumbsUp className="w-3 h-3" />
									) : (
										<ThumbsDown className="w-3 h-3" />
									)}
									{actionType === "AUTORIZADO" ? "Autorizar" : "Rejeitar"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function OrderApprovalCard({
	order,
	onViewDetail,
	onApprove,
	onReject,
}: {
	order: PedidoResponse;
	onViewDetail: () => void;
	onApprove: () => void;
	onReject: () => void;
}) {
	const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDENTE;

	return (
		<div className="border border-amber-200 bg-amber-50/20 p-4">
			<div className="flex items-start justify-between gap-4">
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
							className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border ${order.tipo_adesao === "DIRETA" ? "text-blue-800 bg-blue-50/50 border-blue-900/10" : "text-amber-800 bg-amber-50/50 border-amber-900/10"}`}
						>
							{order.tipo_adesao === "DIRETA" ? "DIRETA" : "CARONA"}
						</span>
					</div>
					<p className="text-[10px] text-slate-500 font-sans mt-1">
						{new Date(order.data_pedido).toLocaleDateString("pt-BR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={onViewDetail}
						className="px-2 py-1 text-[9px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
					>
						<Eye className="w-3 h-3" />
					</button>
					<button
						type="button"
						onClick={onApprove}
						className="px-3 py-1 text-[9px] font-bold font-sans uppercase tracking-wider bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
					>
						<ThumbsUp className="w-3 h-3" />
						Autorizar
					</button>
					<button
						type="button"
						onClick={onReject}
						className="px-3 py-1 text-[9px] font-bold font-sans uppercase tracking-wider bg-red-600 text-white border border-red-600 hover:bg-red-700 transition cursor-pointer flex items-center gap-1"
					>
						<ThumbsDown className="w-3 h-3" />
						Rejeitar
					</button>
				</div>
			</div>
		</div>
	);
}

function OrderHistoryRow({
	order,
	onViewDetail,
}: {
	order: PedidoResponse;
	onViewDetail: () => void;
}) {
	const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDENTE;

	return (
		<div className="border border-slate-955/10 bg-white p-3 flex items-center justify-between gap-4">
			<div className="flex items-center gap-3 min-w-0">
				<span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-wider shrink-0">
					#{order.id.slice(0, 8).toUpperCase()}
				</span>
				<span
					className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border shrink-0 ${statusStyle.color} ${statusStyle.bg} ${statusStyle.border}`}
				>
					{statusStyle.label}
				</span>
				<span
					className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border shrink-0 ${order.tipo_adesao === "DIRETA" ? "text-blue-800 bg-blue-50/50 border-blue-900/10" : "text-amber-800 bg-amber-50/50 border-amber-900/10"}`}
				>
					{order.tipo_adesao}
				</span>
				<span className="text-[10px] text-slate-500 font-sans truncate">
					{new Date(order.data_pedido).toLocaleDateString("pt-BR")}
				</span>
			</div>
			<button
				type="button"
				onClick={onViewDetail}
				className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
			>
				<Eye className="w-3.5 h-3.5" />
			</button>
		</div>
	);
}
