import {
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	Clock,
	FileText,
	Loader2,
	Package,
	Search,
	ThumbsDown,
	ThumbsUp,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
	return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string, short = false): string {
	try {
		if (short) {
			return new Date(dateStr).toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		}
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

const STATUS_CONFIG: Record<
	string,
	{
		color: string;
		bg: string;
		border: string;
		dot: string;
		label: string;
		Icon: React.ElementType;
	}
> = {
	PENDENTE: {
		color: "text-amber-800",
		bg: "bg-amber-50",
		border: "border-amber-300",
		dot: "bg-amber-400",
		label: "Pendente",
		Icon: Clock,
	},
	AUTORIZADO: {
		color: "text-emerald-800",
		bg: "bg-emerald-50",
		border: "border-emerald-300",
		dot: "bg-emerald-500",
		label: "Autorizado",
		Icon: CheckCircle2,
	},
	REJEITADO: {
		color: "text-red-800",
		bg: "bg-red-50",
		border: "border-red-300",
		dot: "bg-red-500",
		label: "Rejeitado",
		Icon: XCircle,
	},
	EMITIDO: {
		color: "text-blue-800",
		bg: "bg-blue-50",
		border: "border-blue-300",
		dot: "bg-blue-500",
		label: "Emitido",
		Icon: FileText,
	},
};

/* ──────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────── */
export default function ManagerApprovals({ user }: ManagerApprovalsProps) {
	const [orders, setOrders] = useState<PedidoResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQ, setSearchQ] = useState("");

	const [actionOrder, setActionOrder] = useState<PedidoResponse | null>(null);
	const [actionType, setActionType] = useState<"AUTORIZADO" | "REJEITADO" | null>(null);
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

	useEffect(() => { fetchOrders(); }, [fetchOrders]);

	const handleOpenAction = (order: PedidoResponse, type: "AUTORIZADO" | "REJEITADO") => {
		setActionOrder(order);
		setActionType(type);
		setJustificativa("");
	};

	const handleConfirmAction = async () => {
		if (!actionOrder || !actionType) return;
		if (actionType === "REJEITADO" && !justificativa.trim()) return;
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

	const q = searchQ.toLowerCase();
	const filtered = orders.filter((o) =>
		!q ||
		o.id.toLowerCase().includes(q) ||
		o.status.toLowerCase().includes(q) ||
		o.tipo_adesao.toLowerCase().includes(q),
	);

	const pending = filtered.filter((o) => o.status === "PENDENTE");
	const authorized = orders.filter((o) => o.status === "AUTORIZADO");
	const rejected = orders.filter((o) => o.status === "REJEITADO");
	const history = filtered.filter((o) => o.status !== "PENDENTE");

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">

				{/* ── Header ── */}
				<div>
					<div className="flex items-start justify-between pb-4">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								Módulo Órgão Gerenciador • Autorizações
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Workflow de Autorização
							</h2>
						</div>
					</div>
					<ManagerTabs activeTab="autorizacoes" />
				</div>

				{/* ── Stats Bar ── */}
				{!loading && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<StatCard
							label="Total de Pedidos"
							value={orders.length}
							icon={<FileText className="w-3.5 h-3.5" />}
							color="slate"
						/>
						<StatCard
							label="Pendentes"
							value={pending.length}
							icon={<Clock className="w-3.5 h-3.5" />}
							color="amber"
							highlight={pending.length > 0}
						/>
						<StatCard
							label="Autorizados"
							value={authorized.length}
							icon={<CheckCircle2 className="w-3.5 h-3.5" />}
							color="emerald"
						/>
						<StatCard
							label="Rejeitados"
							value={rejected.length}
							icon={<XCircle className="w-3.5 h-3.5" />}
							color="red"
						/>
					</div>
				)}

				{/* ── Error ── */}
				{error && (
					<div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans">
						<AlertTriangle className="w-3.5 h-3.5 shrink-0" />
						{error}
					</div>
				)}

				{/* ── Loading ── */}
				{loading && (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
							<span className="text-xs text-slate-400 font-sans">Carregando pedidos…</span>
						</div>
					</div>
				)}

				{!loading && (
					<>
						{/* ── Search ── */}
						<div className="flex items-center gap-3">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
								<input
									type="text"
									value={searchQ}
									onChange={(e) => setSearchQ(e.target.value)}
									placeholder="Buscar por ID, status ou tipo…"
									className="w-full bg-[#F4F7FA] border border-slate-955/10 pl-9 pr-3 py-2 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 transition"
								/>
							</div>
							{searchQ && (
								<button
									type="button"
									onClick={() => setSearchQ("")}
									className="text-[10px] text-slate-500 hover:text-slate-800 font-sans flex items-center gap-1 transition cursor-pointer"
								>
									<X className="w-3 h-3" /> Limpar
								</button>
							)}
						</div>

						{/* ── Empty ── */}
						{pending.length === 0 && history.length === 0 && (
							<div className="border border-dashed border-slate-200 bg-[#F8FAFE] p-14 text-center">
								<CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">Nenhum pedido encontrado.</p>
							</div>
						)}

						{/* ── PENDING section ── */}
						{pending.length > 0 && (
							<section className="space-y-2">
								<SectionLabel
									dot="bg-amber-400"
									label="Aguardando Decisão"
									count={pending.length}
									urgent
								/>
								<div className="space-y-2">
									{pending.map((order) => (
										<PendingAccordionCard
											key={order.id}
											order={order}
											onApprove={() => handleOpenAction(order, "AUTORIZADO")}
											onReject={() => handleOpenAction(order, "REJEITADO")}
										/>
									))}
								</div>
							</section>
						)}

						{/* ── HISTORY section ── */}
						{history.length > 0 && (
							<section className="space-y-2">
								<SectionLabel
									dot="bg-slate-400"
									label="Histórico"
									count={history.length}
								/>
								<div className="space-y-1.5">
									{history.map((order) => (
										<HistoryAccordionRow key={order.id} order={order} />
									))}
								</div>
							</section>
						)}
					</>
				)}
			</div>

			{/* ── Action Modal ── */}
			{actionOrder && actionType && createPortal(
				<div
					className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
					onClick={() => { setActionOrder(null); setActionType(null); }}
				>
					<div
						className="bg-white border border-slate-200 w-full sm:max-w-md mx-4 mb-0 sm:mb-auto p-6 shadow-2xl animate-slide-up"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal header */}
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-2">
								<span
									className={`w-2 h-2 rounded-full ${actionType === "AUTORIZADO" ? "bg-emerald-500" : "bg-red-500"}`}
								/>
								<span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
									{actionType === "AUTORIZADO" ? "Autorizar Pedido" : "Rejeitar Pedido"}
								</span>
							</div>
							<button
								type="button"
								onClick={() => { setActionOrder(null); setActionType(null); }}
								className="p-1 hover:bg-slate-100 transition cursor-pointer"
							>
								<X className="w-4 h-4 text-slate-400" />
							</button>
						</div>

						{/* Pedido ID */}
						<p className="text-[10px] text-slate-400 font-sans mb-4 font-mono">
							#{actionOrder.id.toUpperCase()}
						</p>

						<p className="text-xs text-slate-600 font-sans mb-4 leading-relaxed">
							{actionType === "AUTORIZADO"
								? "Confirmar a autorização deste pedido? Esta ação não poderá ser desfeita."
								: "Informe a justificativa para rejeitar este pedido. O campo é obrigatório."}
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
									placeholder="Descreva o motivo da rejeição…"
									className="w-full border border-slate-955/10 px-3 py-2 text-xs font-sans text-slate-900 bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400 resize-none transition"
								/>
							</div>
						)}

						<div className="flex items-center gap-3 justify-end pt-1">
							<button
								type="button"
								onClick={() => { setActionOrder(null); setActionType(null); }}
								className="px-4 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleConfirmAction}
								disabled={submitting || (actionType === "REJEITADO" && !justificativa.trim())}
								className={`px-5 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
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
								{actionType === "AUTORIZADO" ? "Confirmar Autorização" : "Confirmar Rejeição"}
							</button>
						</div>
					</div>
				</div>
			, document.body)}
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   StatCard
────────────────────────────────────────────────────────── */
function StatCard({
	label,
	value,
	icon,
	color,
	highlight,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: "slate" | "amber" | "emerald" | "red";
	highlight?: boolean;
}) {
	const palette = {
		slate: { bg: "bg-white border-slate-955/10", text: "text-slate-700", icon: "text-slate-400", val: "text-slate-900" },
		amber: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "text-amber-500", val: "text-amber-900" },
		emerald: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500", val: "text-emerald-900" },
		red: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "text-red-500", val: "text-red-900" },
	}[color];

	return (
		<div className={`border ${palette.bg} p-3 ${highlight ? "ring-1 ring-amber-300" : ""}`}>
			<div className="flex items-center justify-between mb-2">
				<span className={`text-[9px] font-bold uppercase tracking-wider font-sans ${palette.text}`}>
					{label}
				</span>
				<span className={palette.icon}>{icon}</span>
			</div>
			<span className={`text-xl font-bold font-display ${palette.val}`}>
				{value}
			</span>
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   SectionLabel
────────────────────────────────────────────────────────── */
function SectionLabel({
	dot,
	label,
	count,
	urgent,
}: {
	dot: string;
	label: string;
	count: number;
	urgent?: boolean;
}) {
	return (
		<div className="flex items-center gap-2 mb-1">
			<span className={`w-2 h-2 rounded-full ${dot} ${urgent ? "animate-pulse" : ""}`} />
			<span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${urgent ? "text-amber-700" : "text-slate-500"}`}>
				{label}
			</span>
			<span className={`text-[9px] font-bold px-1.5 py-0.5 font-sans ${urgent ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
				{count}
			</span>
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   PendingAccordionCard — pedidos PENDENTES
────────────────────────────────────────────────────────── */
function PendingAccordionCard({
	order,
	onApprove,
	onReject,
}: {
	order: PedidoResponse;
	onApprove: () => void;
	onReject: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [detail, setDetail] = useState<PedidoDetailResponse | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const toggle = async () => {
		const next = !open;
		setOpen(next);
		if (next && !detail) {
			setLoadingDetail(true);
			try {
				const d = await getOrderDetail(order.id);
				setDetail(d);
			} catch { /* silently fail */ }
			finally { setLoadingDetail(false); }
		}
	};

	const isCarona = order.tipo_adesao !== "DIRETA";

	return (
		<div className="border border-amber-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
			{/* Left accent bar */}
			<div className="flex">
				<div className="w-1 bg-amber-400 shrink-0" />
				<div className="flex-1">
					{/* Header row — usar div em vez de button para evitar button aninhado */}
					<div
						role="button"
						tabIndex={0}
						onClick={toggle}
						onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(); }}
						className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-amber-50/30 transition-colors cursor-pointer group"
					>
						<div className="flex items-center gap-3 flex-wrap min-w-0 text-left">
							<span className="text-[11px] font-bold text-slate-800 font-display uppercase tracking-wide">
								#{order.id.slice(0, 8).toUpperCase()}
							</span>

							<span className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border ${
								isCarona
									? "text-amber-800 bg-amber-50 border-amber-200"
									: "text-blue-800 bg-blue-50 border-blue-200"
							}`}>
								{isCarona ? "Carona" : "Direta"}
							</span>

							<span className="text-[10px] text-slate-400 font-sans">
								{formatDate(order.data_pedido)}
							</span>
						</div>

						<div className="flex items-center gap-2 shrink-0">
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onApprove(); }}
								className="px-3 py-1.5 text-[9px] font-bold font-sans uppercase tracking-wider bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
							>
								<ThumbsUp className="w-3 h-3" />
								Autorizar
							</button>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); onReject(); }}
								className="px-3 py-1.5 text-[9px] font-bold font-sans uppercase tracking-wider bg-white text-red-600 border border-red-300 hover:bg-red-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
							>
								<ThumbsDown className="w-3 h-3" />
								Rejeitar
							</button>
							<ChevronDown
								className={`w-4 h-4 text-slate-400 transition-transform duration-250 shrink-0 ${open ? "rotate-180" : ""}`}
							/>
						</div>
					</div>

					{/* Accordion panel */}
					{open && (
						<div className="border-t border-amber-100 bg-[#FFFDF5] px-4 pb-5 pt-4 animate-fade-in">
							{loadingDetail ? (
								<div className="flex items-center justify-center py-8 gap-2">
									<Loader2 className="w-4 h-4 animate-spin text-amber-400" />
									<span className="text-[10px] text-slate-400 font-sans">Carregando detalhes…</span>
								</div>
							) : detail ? (
								<OrderDetailContent detail={detail} />
							) : (
								<p className="text-xs text-slate-400 font-sans py-4 text-center">
									Erro ao carregar. Tente fechar e abrir novamente.
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   HistoryAccordionRow — histórico compacto
────────────────────────────────────────────────────────── */
function HistoryAccordionRow({ order }: { order: PedidoResponse }) {
	const [open, setOpen] = useState(false);
	const [detail, setDetail] = useState<PedidoDetailResponse | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDENTE;
	const StatusIcon = cfg.Icon;

	const toggle = async () => {
		const next = !open;
		setOpen(next);
		if (next && !detail) {
			setLoadingDetail(true);
			try {
				const d = await getOrderDetail(order.id);
				setDetail(d);
			} catch { /* silently fail */ }
			finally { setLoadingDetail(false); }
		}
	};

	return (
		<div className="border border-slate-955/8 bg-white overflow-hidden">
			<button
				type="button"
				onClick={toggle}
				className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#F8FAFE] transition-colors cursor-pointer group"
			>
				<div className="flex items-center gap-3 min-w-0">
					<StatusIcon className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
					<span className="text-[10px] font-bold text-slate-600 font-sans uppercase tracking-wider shrink-0">
						#{order.id.slice(0, 8).toUpperCase()}
					</span>
					<span className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border shrink-0 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
						{cfg.label}
					</span>
					<span className={`text-[9px] font-bold font-sans uppercase tracking-wider px-2 py-0.5 border shrink-0 ${
						order.tipo_adesao === "DIRETA"
							? "text-blue-700 bg-blue-50 border-blue-200"
							: "text-amber-700 bg-amber-50 border-amber-200"
					}`}>
						{order.tipo_adesao === "DIRETA" ? "Direta" : "Carona"}
					</span>
					<span className="text-[10px] text-slate-400 font-sans truncate hidden sm:block">
						{formatDate(order.data_pedido, true)}
					</span>
				</div>
				<ChevronDown
					className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="border-t border-slate-100 bg-[#FAFBFD] px-4 pb-4 pt-3.5 animate-fade-in">
					{loadingDetail ? (
						<div className="flex items-center justify-center py-8 gap-2">
							<Loader2 className="w-4 h-4 animate-spin text-slate-400" />
							<span className="text-[10px] text-slate-400 font-sans">Carregando detalhes…</span>
						</div>
					) : detail ? (
						<OrderDetailContent detail={detail} />
					) : (
						<p className="text-xs text-slate-400 font-sans py-4 text-center">
							Erro ao carregar. Tente novamente.
						</p>
					)}
				</div>
			)}
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   OrderDetailContent — conteúdo expandido compartilhado
────────────────────────────────────────────────────────── */
function OrderDetailContent({ detail }: { detail: PedidoDetailResponse }) {
	const total = (items: ItemPedidoResponse[]) =>
		items.reduce((acc, i) => acc + Number.parseFloat(i.subtotal), 0);

	return (
		<div className="space-y-4 text-xs font-sans">
			{/* Metadata grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
				<InfoField label="Órgão Comprador" value={detail.orgao_comprador?.nome || "—"} />
				<InfoField label="CNPJ" value={detail.orgao_comprador?.cnpj || "—"} />
				<InfoField label="Data do Pedido" value={formatDate(detail.data_pedido)} />
				<div>
					<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
						Tipo de Adesão
					</span>
					<span className={`inline-block text-[9px] font-bold px-2 py-0.5 border ${
						detail.tipo_adesao === "DIRETA"
							? "text-blue-800 bg-blue-50 border-blue-200"
							: "text-amber-800 bg-amber-50 border-amber-200"
					}`}>
						{detail.tipo_adesao === "DIRETA" ? "Direta" : "Carona"}
					</span>
				</div>
			</div>

			{/* Items table */}
			{detail.itens && detail.itens.length > 0 && (
				<div>
					<div className="flex items-center gap-1.5 mb-2">
						<Package className="w-3 h-3 text-slate-400" />
						<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
							Itens do Pedido
						</span>
					</div>
					<div className="border border-slate-955/8 overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="bg-[#F4F7FA] border-b border-slate-955/8 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
									<th className="text-left px-3 py-2">Nº</th>
									<th className="text-left px-3 py-2">Descrição</th>
									<th className="text-right px-3 py-2">Qtd</th>
									<th className="text-right px-3 py-2">Valor Unit.</th>
									<th className="text-right px-3 py-2">Subtotal</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-955/6">
								{detail.itens.map((item) => (
									<tr key={item.id} className="text-[10px] hover:bg-slate-50/60 transition-colors">
										<td className="px-3 py-2.5 text-slate-400 font-mono">
											{item.item_ata?.numero_item ?? "—"}
										</td>
										<td className="px-3 py-2.5 text-slate-800 max-w-[200px]">
											<span className="block truncate" title={item.item_ata?.descricao_especificacao}>
												{item.item_ata?.descricao_especificacao}
											</span>
										</td>
										<td className="px-3 py-2.5 text-right text-slate-700">
											{Number(item.quantidade_solicitada).toLocaleString("pt-BR")}
										</td>
										<td className="px-3 py-2.5 text-right text-slate-700">
											{formatCurrency(item.preco_unitario_no_pedido)}
										</td>
										<td className="px-3 py-2.5 text-right font-bold text-slate-900">
											{formatCurrency(item.subtotal)}
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="bg-slate-50 border-t border-slate-955/8 text-[10px] font-bold">
									<td colSpan={4} className="px-3 py-2.5 text-right text-slate-500">
										Total Geral
									</td>
									<td className="px-3 py-2.5 text-right text-slate-900">
										{formatCurrency(total(detail.itens))}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			)}

			{/* Rejection reason */}
			{detail.justificativa_rejeicao && (
				<div className="flex gap-2 border border-red-200 bg-red-50 p-3">
					<XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
					<div>
						<span className="text-[9px] font-bold text-red-700 uppercase tracking-wider block mb-0.5">
							Justificativa de Rejeição
						</span>
						<p className="text-[10px] text-red-700 leading-relaxed">
							{detail.justificativa_rejeicao}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

/* ──────────────────────────────────────────────────────────
   InfoField — label + value pair
────────────────────────────────────────────────────────── */
function InfoField({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
				{label}
			</span>
			<span className="text-[11px] text-slate-800">{value}</span>
		</div>
	);
}
