import {
	AlertTriangle,
	CheckCircle,
	ChevronDown,
	Clock,
	Edit3,
	FileText,
	History,
	Loader2,
	RotateCcw,
	Search,
	Users,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
	getAtaAuditLog,
	getAtaMonitoring,
	updateAta,
	updateAtaStatus,
} from "@/services/atas";
import type {
	AtaAuditLogEntry,
	AtaMonitorResponse,
	AtaStatusUpdatePayload,
	AtaUpdatePayload,
} from "@/types/ata";
import ManagerTabs from "./ManagerTabs";

interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}
interface ManagerAtaMonitorProps { user: UserSession; }

/* ── helpers ──────────────────────────────────────────────── */
function fmtCurrency(v: string | number) {
	const n = typeof v === "string" ? Number.parseFloat(v) : v;
	return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(s?: string) {
	if (!s) return "—";
	try { return new Date(s).toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric" }); }
	catch { return s; }
}
function fmtDateTime(s?: string) {
	if (!s) return "—";
	try { return new Date(s).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
	catch { return s; }
}
function calcPct(consumed: string, total: string) {
	const c = Number.parseFloat(consumed), t = Number.parseFloat(total);
	if (t <= 0) return 0;
	return Math.min(Math.round((c / t) * 100), 100);
}
function calcDays(meses: number, assinatura?: string) {
	if (!assinatura) return 0;
	const end = new Date(assinatura);
	end.setMonth(end.getMonth() + meses);
	return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
}

/* ── status config ────────────────────────────────────────── */
type StatusKey = "ATIVA" | "INATIVA" | "CANCELADA";
const S: Record<StatusKey, { label: string; bg: string; text: string; border: string; dot: string; card: string }> = {
	ATIVA:     { label:"Ativa",     bg:"bg-emerald-50",  text:"text-emerald-700", border:"border-emerald-200", dot:"bg-emerald-500", card:"border-l-emerald-400" },
	INATIVA:   { label:"Inativa",   bg:"bg-amber-50",    text:"text-amber-700",   border:"border-amber-200",   dot:"bg-amber-400",   card:"border-l-amber-400"   },
	CANCELADA: { label:"Cancelada", bg:"bg-red-50",      text:"text-red-700",     border:"border-red-200",     dot:"bg-red-400",     card:"border-l-red-400"     },
};

const ACAO_LABEL: Record<string, string> = {
	EDICAO_METADADOS: "Edição",
	INATIVACAO: "Inativação",
	CANCELAMENTO: "Cancelamento",
	REATIVACAO: "Reativação",
};

/* ══════════════════════════════════════════════════════════
   Main
══════════════════════════════════════════════════════════════ */
export default function ManagerAtaMonitor({ user: _user }: ManagerAtaMonitorProps) {
	const [atas, setAtas] = useState<AtaMonitorResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQ, setSearchQ] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const [editTarget, setEditTarget] = useState<AtaMonitorResponse | null>(null);
	const [statusTarget, setStatusTarget] = useState<AtaMonitorResponse | null>(null);
	const [statusAction, setStatusAction] = useState<StatusKey | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true); setError("");
		try { setAtas(await getAtaMonitoring()); }
		catch { setError("Erro ao carregar dados de monitoramento."); }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	const patch = (u: Partial<AtaMonitorResponse> & { id: string }) =>
		setAtas(prev => prev.map(a => a.id === u.id ? { ...a, ...u } as AtaMonitorResponse : a));

	const q = searchQ.toLowerCase();
	const filtered = atas.filter(a =>
		!q ||
		a.numero_ata.toLowerCase().includes(q) ||
		(a.orgao_gerenciador_nome ?? "").toLowerCase().includes(q) ||
		a.items.some(i => i.descricao_especificacao.toLowerCase().includes(q))
	);

	const selected = filtered.find(a => a.id === selectedId) ?? null;

	// stats
	const total = atas.length;
	const ativas = atas.filter(a => a.status === "ATIVA").length;
	const inativas = atas.filter(a => a.status === "INATIVA").length;
	const canceladas = atas.filter(a => a.status === "CANCELADA").length;

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">

				{/* Header */}
				<div>
					<div className="pb-4">
						<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
							Módulo Órgão Gerenciador • Monitoramento
						</span>
						<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
							Monitoramento Geral de ATAs
						</h2>
					</div>
					<ManagerTabs activeTab="monitoramento" />
				</div>

				{/* Summary strip */}
				{!loading && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{[
							{ label:"Total", value: total,     color:"text-slate-900",    bg:"bg-white border-slate-955/10" },
							{ label:"Ativas",     value: ativas,    color:"text-emerald-700",  bg:"bg-emerald-50 border-emerald-200" },
							{ label:"Inativas",   value: inativas,  color:"text-amber-700",    bg:"bg-amber-50 border-amber-200"   },
							{ label:"Canceladas", value: canceladas,color:"text-red-700",      bg:"bg-red-50 border-red-200"       },
						].map(({ label, value, color, bg }) => (
							<div key={label} className={`border ${bg} px-4 py-3`}>
								<span className="text-[9px] font-bold font-sans uppercase tracking-wider text-slate-500 block">{label}</span>
								<span className={`text-2xl font-bold font-display ${color}`}>{value}</span>
							</div>
						))}
					</div>
				)}

				{error && (
					<div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans">
						<AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
					</div>
				)}

				{loading && (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
					</div>
				)}

				{!loading && (
					<>
						{/* Search */}
						<div className="flex items-center gap-3">
							<div className="relative flex-1 max-w-sm">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
								<input
									type="text"
									value={searchQ}
									onChange={e => setSearchQ(e.target.value)}
									placeholder="Buscar por ATA, órgão, item..."
									className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-9 pr-3 py-2 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
								/>
							</div>
							{searchQ && (
								<button type="button" onClick={() => setSearchQ("")}
									className="text-[10px] text-slate-400 hover:text-slate-600 font-sans flex items-center gap-1 transition cursor-pointer"
								>
									<X className="w-3 h-3" /> Limpar
								</button>
							)}
							<span className="text-[10px] text-slate-400 font-sans ml-auto">
								{filtered.length} de {total} ATA{total !== 1 ? "s" : ""}
							</span>
						</div>

						{filtered.length === 0 && (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-14 text-center">
								<CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">Nenhuma ATA encontrada.</p>
							</div>
						)}

						{/* ── Grid de cards ── */}
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{filtered.map(ata => (
								<AtaCard
									key={ata.id}
									ata={ata}
									isSelected={selectedId === ata.id}
									onSelect={() => setSelectedId(selectedId === ata.id ? null : ata.id)}
									onEdit={e => { e.stopPropagation(); setEditTarget(ata); }}
									onStatus={(action, e) => { e.stopPropagation(); setStatusTarget(ata); setStatusAction(action); }}
								/>
							))}
						</div>

						{/* ── Detail panel rendered in a Portal modal overlay ── */}
						{selected && createPortal(
							<DetailPanel
								ata={selected}
								onClose={() => setSelectedId(null)}
							/>,
							document.body
						)}
					</>
				)}
			</div>

			{/* Portals */}
			{editTarget && createPortal(
				<EditMetadataModal
					ata={editTarget}
					onClose={() => setEditTarget(null)}
					onSaved={u => { patch(u as AtaMonitorResponse); setEditTarget(null); }}
				/>, document.body
			)}
			{statusTarget && statusAction && createPortal(
				<StatusChangeModal
					ata={statusTarget}
					action={statusAction}
					onClose={() => { setStatusTarget(null); setStatusAction(null); }}
					onSaved={u => { patch(u as AtaMonitorResponse); setStatusTarget(null); setStatusAction(null); }}
				/>, document.body
			)}
		</div>
	);
}

/* ══════════════════════════════════════════════════════════
   AtaCard — grid item
══════════════════════════════════════════════════════════════ */
function AtaCard({
	ata, isSelected, onSelect, onEdit, onStatus,
}: {
	ata: AtaMonitorResponse;
	isSelected: boolean;
	onSelect: () => void;
	onEdit: (e: React.MouseEvent) => void;
	onStatus: (action: StatusKey, e: React.MouseEvent) => void;
}) {
	const cfg = S[ata.status] ?? S.ATIVA;
	const pct = (() => {
		const c = ata.items.reduce((s, i) => s + Number.parseFloat(i.quantidade_consumida), 0);
		const t = ata.items.reduce((s, i) => s + Number.parseFloat(i.quantidade_total_ofertada), 0);
		return calcPct(String(c), String(t));
	})();
	const days = calcDays(ata.vigencia_meses, ata.data_assinatura);
	const urgentDays = days <= 30;
	const urgentPct = pct >= 80;

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
			className={`
				group relative bg-white border-l-4 border border-slate-955/10 ${cfg.card}
				cursor-pointer transition-all duration-200 select-none
				hover:shadow-md hover:-translate-y-0.5
				${isSelected ? "ring-2 ring-blue-500 shadow-md" : ""}
				${ata.status !== "ATIVA" ? "opacity-75" : ""}
			`}
		>
			{/* Top row */}
			<div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
				<div className="min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-[11px] font-bold font-sans text-slate-900 uppercase tracking-wide">
							ATA {ata.numero_ata}
						</span>
						<span className={`inline-flex items-center gap-1 text-[8px] font-bold font-sans uppercase tracking-wider px-1.5 py-0.5 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
							<span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
							{cfg.label}
						</span>
					</div>
					<p className="text-[10px] text-slate-500 font-sans mt-0.5 truncate" title={ata.orgao_gerenciador_nome}>
						{ata.orgao_gerenciador_nome}
					</p>
				</div>

				{/* Action buttons — visible on hover */}
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
					<button type="button" onClick={onEdit} title="Editar"
						className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition rounded-sm cursor-pointer"
					>
						<Edit3 className="w-3.5 h-3.5" />
					</button>
					{ata.status === "ATIVA" && (
						<>
							<button type="button" onClick={e => onStatus("INATIVA", e)} title="Inativar"
								className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition rounded-sm cursor-pointer"
							>
								<Clock className="w-3.5 h-3.5" />
							</button>
							<button type="button" onClick={e => onStatus("CANCELADA", e)} title="Cancelar"
								className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition rounded-sm cursor-pointer"
							>
								<XCircle className="w-3.5 h-3.5" />
							</button>
						</>
					)}
					{(ata.status === "INATIVA" || ata.status === "CANCELADA") && (
						<button type="button" onClick={e => onStatus("ATIVA", e)} title="Reativar"
							className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition rounded-sm cursor-pointer"
						>
							<RotateCcw className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Progress bar */}
			<div className="px-4 pb-3 space-y-1">
				<div className="flex items-center justify-between">
					<span className="text-[8px] font-sans text-slate-400 uppercase tracking-wider">Consumo geral</span>
					<span className={`text-[9px] font-bold font-sans ${urgentPct ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
				</div>
				<div className="h-1.5 bg-slate-100 w-full overflow-hidden">
					<div
						className={`h-full transition-all duration-700 ${pct >= 80 ? "bg-amber-500" : pct >= 50 ? "bg-amber-400" : "bg-emerald-500"}`}
						style={{ width: `${pct}%` }}
					/>
				</div>
				<div className="flex items-center justify-between text-[8px] font-sans text-slate-400">
					<span>Saldo: {(100 - pct)}%</span>
					<span className={urgentPct ? "text-amber-500 font-bold" : ""}>{100 - pct}% disponível</span>
				</div>
			</div>

			{/* Footer stats */}
			<div className="border-t border-slate-955/8 px-4 py-2.5 flex items-center justify-between">
				<div className="flex items-center gap-3 text-[9px] font-sans text-slate-500">
					<span className="flex items-center gap-1">
						<FileText className="w-3 h-3" />
						{ata.items.length} {ata.items.length === 1 ? "item" : "itens"}
					</span>
					<span className="flex items-center gap-1">
						<Users className="w-3 h-3" />
						{ata.items.reduce((acc, i) => acc + i.participantes.length, 0)} part.
					</span>
				</div>
				<div className="flex items-center gap-1 text-[9px] font-sans">
					<Clock className={`w-3 h-3 ${urgentDays ? "text-amber-500" : "text-slate-400"}`} />
					<span className={urgentDays ? "text-amber-600 font-bold" : "text-slate-500"}>
						{days} dias
					</span>
				</div>
			</div>

			{/* Selected indicator */}
			{isSelected && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
			)}
		</div>
	);
}

function DetailPanel({ ata, onClose }: { ata: AtaMonitorResponse; onClose: () => void }) {
	const [auditOpen, setAuditOpen] = useState(false);
	const [logs, setLogs] = useState<AtaAuditLogEntry[]>([]);
	const [loadingLogs, setLoadingLogs] = useState(false);
	const [fetchedLogs, setFetchedLogs] = useState(false);

	const loadLogs = async () => {
		if (fetchedLogs) { setAuditOpen(v => !v); return; }
		setAuditOpen(true); setLoadingLogs(true);
		try { const d = await getAtaAuditLog(ata.id); setLogs(d); setFetchedLogs(true); }
		catch { /* silently fail */ }
		finally { setLoadingLogs(false); }
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
			<div className="bg-white border border-slate-200 w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
				{/* Panel header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-slate-955/10 bg-[#F8FAFE] shrink-0">
					<div className="flex items-center gap-3">
						<div className={`w-1.5 h-1.5 rounded-full ${S[ata.status]?.dot ?? "bg-slate-400"}`} />
						<span className="text-[11px] font-bold font-sans text-slate-900 uppercase tracking-wider">
							ATA nº {ata.numero_ata}
						</span>
						<span className="text-[9px] text-slate-500 font-sans">{ata.orgao_gerenciador_nome}</span>
					</div>
					<button type="button" onClick={onClose}
						className="p-1.5 hover:bg-slate-250 transition cursor-pointer"
					>
						<X className="w-4 h-4 text-slate-400" />
					</button>
				</div>

				{/* Scrollable Panel Body */}
				<div className="flex-1 overflow-y-auto divide-y divide-slate-100">
					{/* Metadata grid */}
					<div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
						{[
							{ label: "Processo", value: ata.processo_administrativo || "—" },
							{ label: "Pregão", value: ata.numero_pregao || "—" },
							{ label: "Assinatura", value: fmtDate(ata.data_assinatura) },
							{ label: "Publicação", value: fmtDate(ata.data_publicacao) },
							{ label: "Vigência", value: `${ata.vigencia_meses} meses` },
							{ label: "Restam", value: `${calcDays(ata.vigencia_meses, ata.data_assinatura)} dias` },
							{ label: "Valor Global", value: ata.valor_total_global ? fmtCurrency(ata.valor_total_global) : "—" },
							{ label: "CNPJ Gerenciador", value: ata.orgao_gerenciador_cnpj },
						].map(({ label, value }) => (
							<div key={label}>
								<span className="text-[8px] font-bold font-sans text-slate-400 uppercase tracking-wider block mb-0.5">{label}</span>
								<span className="text-[10px] font-sans text-slate-800">{value}</span>
							</div>
						))}
					</div>

					{/* Items table */}
					{ata.items.length > 0 && (
						<div className="overflow-x-auto">
							<table className="w-full text-[10px] font-sans">
								<thead>
									<tr className="bg-[#F4F7FA] border-b border-slate-955/8 text-[8px] font-bold text-slate-500 uppercase tracking-wider">
										<th className="text-left px-4 py-2">Nº</th>
										<th className="text-left px-4 py-2">Descrição</th>
										<th className="text-right px-4 py-2">Val. Unit.</th>
										<th className="text-right px-4 py-2">Fornecedor</th>
										<th className="text-right px-4 py-2">Total</th>
										<th className="text-right px-4 py-2">Consumido</th>
										<th className="text-right px-4 py-2">Saldo</th>
										<th className="text-right px-4 py-2 w-24">%</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-955/6">
									{ata.items.map(item => {
										const pct = calcPct(item.quantidade_consumida, item.quantidade_total_ofertada);
										return (
											<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
												<td className="px-4 py-2.5 text-slate-400 font-mono">{item.numero_item || "—"}</td>
												<td className="px-4 py-2.5 text-slate-800 max-w-[220px]">
													<span className="block truncate" title={item.descricao_especificacao}>{item.descricao_especificacao}</span>
												</td>
												<td className="px-4 py-2.5 text-right text-slate-700">{fmtCurrency(item.valor_unitario)}</td>
												<td className="px-4 py-2.5 text-right text-slate-500 max-w-[140px]">
													<span className="block truncate" title={item.fornecedor_razao_social}>{item.fornecedor_razao_social}</span>
												</td>
												<td className="px-4 py-2.5 text-right text-slate-700">{Number.parseFloat(item.quantidade_total_ofertada).toLocaleString("pt-BR")}</td>
												<td className="px-4 py-2.5 text-right text-slate-700">{Number.parseFloat(item.quantidade_consumida).toLocaleString("pt-BR")}</td>
												<td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number.parseFloat(item.quantidade_saldo_disponivel).toLocaleString("pt-BR")}</td>
												<td className="px-4 py-2.5 text-right">
													<div className="flex items-center gap-1.5 justify-end">
														<div className="w-12 h-1 bg-slate-100 overflow-hidden">
															<div
																className={`h-full ${pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
																style={{ width: `${pct}%` }}
															/>
														</div>
														<span className={`text-[8px] font-bold ${pct >= 80 ? "text-amber-600" : "text-emerald-600"}`}>{pct}%</span>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					{/* Participantes */}
					{ata.items.some(i => i.participantes.length > 0) && (
						<div className="px-5 py-4">
							<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans block mb-3">
								Consumo por Participante
							</span>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{ata.items.filter(i => i.participantes.length > 0).map(item => (
									<div key={item.id} className="border border-slate-955/8 p-3 bg-[#F8FAFE]">
										<span className="text-[9px] font-bold text-slate-700 font-sans block mb-2 truncate" title={item.descricao_especificacao}>
											{item.descricao_especificacao}
										</span>
										<div className="space-y-1.5">
											{item.participantes.map(p => {
												const pctP = calcPct(p.quantidade_consumida, p.quantidade_planejada);
												return (
													<div key={p.orgao_id} className="flex items-center gap-3">
														<span className="text-[8px] text-slate-600 font-sans flex-1 truncate" title={p.nome_orgao}>{p.nome_orgao}</span>
														<div className="w-20 h-1 bg-slate-200 overflow-hidden shrink-0">
															<div className={`h-full ${pctP >= 80 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width:`${pctP}%` }} />
														</div>
														<span className={`text-[8px] font-bold w-8 text-right shrink-0 ${pctP >= 80 ? "text-amber-600" : "text-emerald-600"}`}>{pctP}%</span>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Audit log accordion */}
					<div>
						<div
							role="button" tabIndex={0}
							onClick={auditOpen && fetchedLogs ? () => setAuditOpen(false) : loadLogs}
							onKeyDown={e => { if (e.key === "Enter" || e.key === " ") (auditOpen && fetchedLogs ? () => setAuditOpen(false) : loadLogs)(); }}
							className="flex items-center gap-2 px-5 py-3 cursor-pointer hover:bg-slate-50 transition select-none"
						>
							<History className="w-3.5 h-3.5 text-slate-400" />
							<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">Histórico de Alterações</span>
							{loadingLogs && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
							<ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-auto transition-transform duration-200 ${auditOpen ? "rotate-180" : ""}`} />
						</div>
						{auditOpen && !loadingLogs && (
							<div className="px-5 pb-4 animate-fade-in">
								{logs.length === 0 ? (
									<p className="text-[10px] text-slate-400 font-sans text-center py-3">Nenhuma alteração registrada.</p>
								) : (
									<div className="space-y-1.5">
										{logs.map(log => (
											<div key={log.id} className="border border-slate-955/8 bg-[#F8FAFE] px-3 py-2 text-[10px] font-sans">
												<div className="flex items-center justify-between gap-4 flex-wrap">
													<div className="flex items-center gap-2">
														<span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${
															log.acao === "INATIVACAO"   ? "bg-amber-100 text-amber-700" :
															log.acao === "CANCELAMENTO" ? "bg-red-100 text-red-700" :
															log.acao === "REATIVACAO"   ? "bg-emerald-100 text-emerald-700" :
															                              "bg-slate-100 text-slate-600"
														}`}>
															{ACAO_LABEL[log.acao] ?? log.acao}
														</span>
														{log.campo_alterado && <span className="text-slate-500">{log.campo_alterado}</span>}
													</div>
													<div className="flex items-center gap-2 text-[9px] text-slate-400">
														{log.usuario_email && <span>{log.usuario_email}</span>}
														<span>·</span>
														<span>{fmtDateTime(log.criado_em)}</span>
													</div>
												</div>
												{(log.valor_anterior || log.valor_novo) && (
													<div className="flex items-center gap-2 mt-1 text-[9px]">
														{log.valor_anterior && <span className="line-through text-slate-400">{log.valor_anterior}</span>}
														{log.valor_anterior && log.valor_novo && <span className="text-slate-300">→</span>}
														{log.valor_novo && <span className="font-bold text-slate-700">{log.valor_novo}</span>}
													</div>
												)}
												{log.justificativa && (
													<p className="mt-1 text-[9px] text-slate-500 italic">"{log.justificativa}"</p>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

/* ══════════════════════════════════════════════════════════
   EditMetadataModal
══════════════════════════════════════════════════════════════ */
function EditMetadataModal({ ata, onClose, onSaved }: {
	ata: AtaMonitorResponse; onClose: () => void; onSaved: (u: unknown) => void;
}) {
	const [form, setForm] = useState<AtaUpdatePayload>({
		numero_ata: ata.numero_ata,
		processo_administrativo: ata.processo_administrativo ?? "",
		numero_pregao: ata.numero_pregao ?? "",
		data_assinatura: ata.data_assinatura?.slice(0, 10) ?? "",
		data_publicacao: ata.data_publicacao?.slice(0, 10) ?? "",
		vigencia_meses: ata.vigencia_meses,
		valor_total_global: ata.valor_total_global ? Number.parseFloat(ata.valor_total_global) : undefined,
	});
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");
	const set = (k: keyof AtaUpdatePayload, v: unknown) => setForm(p => ({ ...p, [k]: v }));

	const save = async () => {
		if (!form.numero_ata?.trim()) { setErr("Número da ATA é obrigatório."); return; }
		setSaving(true); setErr("");
		try {
			const payload: AtaUpdatePayload = {
				...form,
				data_assinatura: form.data_assinatura || undefined,
				data_publicacao: form.data_publicacao || undefined,
				processo_administrativo: form.processo_administrativo || undefined,
				numero_pregao: form.numero_pregao || undefined,
			};
			onSaved(await updateAta(ata.id, payload));
		} catch (e: unknown) {
			setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erro ao salvar.");
		} finally { setSaving(false); }
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
			<div className="bg-white border border-slate-200 w-full max-w-lg mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
				<div className="flex items-center justify-between px-5 py-4 border-b border-slate-955/10">
					<div>
						<span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans block">ATA nº {ata.numero_ata}</span>
						<span className="text-sm font-bold text-slate-900 font-display">Editar Metadados</span>
					</div>
					<button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
				</div>
				<div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
					{err && (
						<div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans">
							<AlertTriangle className="w-3.5 h-3.5 shrink-0" />{err}
						</div>
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{([
							["Número ATA *",           "numero_ata",              "text"],
							["Número do Pregão",        "numero_pregao",           "text"],
							["Processo Administrativo", "processo_administrativo", "text"],
							["Vigência (meses)",        "vigencia_meses",          "number"],
							["Data de Assinatura",      "data_assinatura",         "date"],
							["Data de Publicação",      "data_publicacao",         "date"],
						] as [string, keyof AtaUpdatePayload, string][]).map(([label, key, type]) => (
							<div key={key}>
								<label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">{label}</label>
								<input type={type} value={(form[key] as string | number) ?? ""}
									onChange={e => set(key, type === "number" ? Number.parseInt(e.target.value) : e.target.value)}
									className="w-full border border-slate-955/10 px-3 py-2 text-xs font-sans bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
								/>
							</div>
						))}
						<div className="sm:col-span-2">
							<label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">Valor Total Global (R$)</label>
							<input type="number" min={0} step={0.01} value={form.valor_total_global ?? ""}
								onChange={e => set("valor_total_global", e.target.value ? Number.parseFloat(e.target.value) : undefined)}
								className="w-full border border-slate-955/10 px-3 py-2 text-xs font-sans bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
							/>
						</div>
					</div>
				</div>
				<div className="px-5 py-4 border-t border-slate-955/10 flex justify-end gap-3">
					<button type="button" onClick={onClose} className="px-4 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
					<button type="button" onClick={save} disabled={saving}
						className="px-5 py-2 text-[10px] font-bold font-sans uppercase tracking-wider bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
					>
						{saving && <Loader2 className="w-3 h-3 animate-spin" />} Salvar
					</button>
				</div>
			</div>
		</div>
	);
}

/* ══════════════════════════════════════════════════════════
   StatusChangeModal
══════════════════════════════════════════════════════════════ */
function StatusChangeModal({ ata, action, onClose, onSaved }: {
	ata: AtaMonitorResponse; action: StatusKey; onClose: () => void; onSaved: (u: unknown) => void;
}) {
	const [justificativa, setJustificativa] = useState("");
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");

	const CFG = {
		INATIVA:   { title:"Inativar ATA",  desc:"A ATA ficará suspensa. Pode ser reativada futuramente.", color:"amber"   },
		CANCELADA: { title:"Cancelar ATA",  desc:"Cancelamento definitivo. A ATA permanecerá no histórico.", color:"red"   },
		ATIVA:     { title:"Reativar ATA",  desc:"A ATA voltará a aceitar novos pedidos.",                  color:"emerald" },
	} as const;
	const cfg = CFG[action];

	const COLORS = {
		amber:   { banner:"border-amber-200 bg-amber-50 text-amber-800",       btn:"bg-amber-600 border-amber-600 hover:bg-amber-700"     },
		red:     { banner:"border-red-200 bg-red-50 text-red-800",             btn:"bg-red-600 border-red-600 hover:bg-red-700"           },
		emerald: { banner:"border-emerald-200 bg-emerald-50 text-emerald-800", btn:"bg-emerald-600 border-emerald-600 hover:bg-emerald-700" },
	};
	const colors = COLORS[cfg.color];

	const confirm = async () => {
		if (!justificativa.trim()) { setErr("Justificativa é obrigatória."); return; }
		setSaving(true); setErr("");
		try {
			const payload: AtaStatusUpdatePayload = { status: action, justificativa: justificativa.trim() };
			onSaved(await updateAtaStatus(ata.id, payload));
		} catch (e: unknown) {
			setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erro ao alterar status.");
		} finally { setSaving(false); }
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
			<div className="bg-white border border-slate-200 w-full max-w-md mx-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
				<div className="flex items-center justify-between px-5 py-4 border-b border-slate-955/10">
					<span className="text-sm font-bold text-slate-900 font-display">{cfg.title}</span>
					<button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
				</div>
				<div className="p-5 space-y-4">
					<div className={`border p-3 text-xs font-sans ${colors.banner}`}>
						<strong>ATA nº {ata.numero_ata}</strong>
						<p className="mt-1 opacity-80">{cfg.desc}</p>
					</div>
					{err && (
						<div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans">
							<AlertTriangle className="w-3.5 h-3.5 shrink-0" />{err}
						</div>
					)}
					<div>
						<label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">Justificativa *</label>
						<textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} rows={3}
							placeholder="Descreva o motivo desta alteração…"
							className="w-full border border-slate-955/10 px-3 py-2 text-xs font-sans bg-white focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 resize-none"
						/>
					</div>
				</div>
				<div className="px-5 py-4 border-t border-slate-955/10 flex justify-end gap-3">
					<button type="button" onClick={onClose} className="px-4 py-2 text-[10px] font-bold font-sans uppercase tracking-wider border border-slate-955/10 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
					<button type="button" onClick={confirm} disabled={saving || !justificativa.trim()}
						className={`px-5 py-2 text-[10px] font-bold font-sans uppercase tracking-wider text-white border transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${colors.btn}`}
					>
						{saving && <Loader2 className="w-3 h-3 animate-spin" />} Confirmar
					</button>
				</div>
			</div>
		</div>
	);
}
