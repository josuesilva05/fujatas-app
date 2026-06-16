import {
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Loader2,
	Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAtaMonitoring } from "@/services/atas";
import type { AtaMonitorResponse } from "@/types/ata";
import ManagerTabs from "./ManagerTabs";

interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

interface ManagerAtaMonitorProps {
	user: UserSession;
}

function formatCurrency(value: string | number): string {
	const num = typeof value === "string" ? Number.parseFloat(value) : value;
	return num.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function formatDate(dateStr?: string): string {
	if (!dateStr) return "—";
	try {
		return new Date(dateStr).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
}

function calcProgress(consumed: string, total: string): number {
	const c = Number.parseFloat(consumed);
	const t = Number.parseFloat(total);
	if (t <= 0) return 0;
	return Math.min(Math.round((c / t) * 100), 100);
}

function calcDaysUntilEnd(
	vigenciaMeses: number,
	dataAssinatura?: string,
): number {
	if (!dataAssinatura) return 0;
	const start = new Date(dataAssinatura);
	const end = new Date(start);
	end.setMonth(end.getMonth() + vigenciaMeses);
	const now = new Date();
	const diff = end.getTime() - now.getTime();
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ManagerAtaMonitor({
	user: _user,
}: ManagerAtaMonitorProps) {
	const [atas, setAtas] = useState<AtaMonitorResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchQ, setSearchQ] = useState("");
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getAtaMonitoring();
			setAtas(data);
		} catch {
			setError("Erro ao carregar dados de monitoramento.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const toggleExpand = (id: string) => {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const q = searchQ.toLowerCase();
	const filtered = atas.filter((a) => {
		if (!q) return true;
		return (
			a.numero_ata.toLowerCase().includes(q) ||
			(a.orgao_gerenciador_nome || "").toLowerCase().includes(q) ||
			a.items.some((i) => i.descricao_especificacao.toLowerCase().includes(q))
		);
	});

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">
				<div>
					<div className="flex items-start justify-between pb-4">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO ÓRGÃO GERENCIADOR • MONITORAMENTO
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Monitoramento Geral de ATAs
							</h2>
						</div>
					</div>
					<ManagerTabs activeTab="monitoramento" />
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
									placeholder="Buscar por ATA, órgão, item..."
									className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-9 pr-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
								/>
							</div>
							<span className="text-xs text-slate-500 font-sans">
								{atas.length} ATA{atas.length !== 1 ? "s" : ""}
							</span>
						</div>

						{atas.length === 0 && (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
								<CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">
									Nenhuma ATA encontrada para monitoramento.
								</p>
							</div>
						)}

						<div className="space-y-6">
							{filtered.map((ata) => {
								const globalConsumed = ata.items.reduce(
									(s, i) => s + Number.parseFloat(i.quantidade_consumida),
									0,
								);
								const globalTotal = ata.items.reduce(
									(s, i) => s + Number.parseFloat(i.quantidade_total_ofertada),
									0,
								);
								const globalProgress = calcProgress(
									String(globalConsumed),
									String(globalTotal),
								);
								const daysLeft = calcDaysUntilEnd(
									ata.vigencia_meses,
									ata.data_assinatura,
								);
								const isExpanded = expanded[ata.id] ?? false;

								return (
									<div
										key={ata.id}
										className="border border-slate-955/10 bg-white"
									>
										{/* ATA Header */}
										<div
											className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
											onClick={() => toggleExpand(ata.id)}
										>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-3 flex-wrap">
													<span className="text-[11px] font-bold font-sans text-slate-900 uppercase tracking-wider">
														ATA nº {ata.numero_ata}
													</span>
													<span className="text-[9px] font-sans text-slate-500">
														{ata.orgao_gerenciador_nome}
													</span>
												</div>
												<div className="flex items-center gap-4 mt-1.5">
													<span className="text-[9px] font-sans text-slate-500">
														Processo: {ata.processo_administrativo || "—"}
													</span>
													<span className="text-[9px] font-sans text-slate-500">
														Pregão: {ata.numero_pregao || "—"}
													</span>
													<span className="text-[9px] font-sans text-slate-500">
														Vigência: {ata.vigencia_meses} meses
													</span>
												</div>
											</div>
											<div className="flex items-center gap-4 shrink-0">
												<div className="text-right">
													<span className="text-[9px] font-sans text-slate-500 block">
														Saldo
													</span>
													<span
														className={`text-[10px] font-bold font-sans ${globalProgress >= 80 ? "text-amber-600" : "text-emerald-600"}`}
													>
														{100 - globalProgress}%
													</span>
												</div>
												<div className="w-32">
													<div className="flex items-center justify-between mb-0.5">
														<span className="text-[8px] font-sans text-slate-400 uppercase">
															{globalProgress}%
														</span>
													</div>
													<div className="h-1.5 bg-slate-100 w-full">
														<div
															className={`h-full transition-all duration-700 ${
																globalProgress >= 80
																	? "bg-amber-500"
																	: globalProgress >= 50
																		? "bg-amber-400"
																		: "bg-emerald-500"
															}`}
															style={{ width: `${globalProgress}%` }}
														/>
													</div>
												</div>
												<div className="text-right">
													<span className="text-[9px] font-sans text-slate-500 block">
														Restam
													</span>
													<span className="text-[10px] font-bold font-sans text-slate-900">
														{daysLeft} dias
													</span>
												</div>
												{isExpanded ? (
													<ChevronDown className="w-4 h-4 text-slate-400" />
												) : (
													<ChevronRight className="w-4 h-4 text-slate-400" />
												)}
											</div>
										</div>

										{/* Expanded Items */}
										{isExpanded && (
											<div className="border-t border-slate-955/10">
												<table className="w-full text-[10px] font-sans">
													<thead>
														<tr className="bg-[#F4F7FA] border-b border-slate-955/10 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
															<th className="text-left px-4 py-2">Item</th>
															<th className="text-left px-4 py-2">Descrição</th>
															<th className="text-right px-4 py-2">
																Valor Unit.
															</th>
															<th className="text-right px-4 py-2">
																Fornecedor
															</th>
															<th className="text-right px-4 py-2">
																Total Ofertado
															</th>
															<th className="text-right px-4 py-2">
																Consumido
															</th>
															<th className="text-right px-4 py-2">Saldo</th>
															<th className="text-right px-4 py-2">%</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-slate-955/8">
														{ata.items.map((item) => {
															const consumed = Number.parseFloat(
																item.quantidade_consumida,
															);
															const total = Number.parseFloat(
																item.quantidade_total_ofertada,
															);
															const balance = Number.parseFloat(
																item.quantidade_saldo_disponivel,
															);
															const pct = calcProgress(
																item.quantidade_consumida,
																item.quantidade_total_ofertada,
															);

															return (
																<tr
																	key={item.id}
																	className="hover:bg-slate-50/50"
																>
																	<td className="px-4 py-2.5 font-bold text-slate-500">
																		{item.numero_item || "—"}
																	</td>
																	<td className="px-4 py-2.5 text-slate-900 max-w-[200px] truncate">
																		{item.descricao_especificacao}
																	</td>
																	<td className="px-4 py-2.5 text-right text-slate-900">
																		{formatCurrency(item.valor_unitario)}
																	</td>
																	<td className="px-4 py-2.5 text-right text-slate-500 max-w-[140px] truncate">
																		{item.fornecedor_razao_social}
																	</td>
																	<td className="px-4 py-2.5 text-right text-slate-900">
																		{Number(total).toLocaleString("pt-BR")}
																	</td>
																	<td className="px-4 py-2.5 text-right text-slate-900">
																		{Number(consumed).toLocaleString("pt-BR")}
																	</td>
																	<td className="px-4 py-2.5 text-right font-bold text-slate-900">
																		{Number(balance).toLocaleString("pt-BR")}
																	</td>
																	<td className="px-4 py-2.5 text-right">
																		<span
																			className={`inline-block text-[9px] font-bold px-1.5 py-0.5 ${
																				pct >= 80
																					? "text-amber-700 bg-amber-50"
																					: "text-emerald-700 bg-emerald-50"
																			}`}
																		>
																			{pct}%
																		</span>
																	</td>
																</tr>
															);
														})}
													</tbody>
												</table>

												{/* Participants section */}
												{ata.items.some((i) => i.participantes.length > 0) && (
													<div className="border-t border-slate-955/10 p-4">
														<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-sans">
															Consumo por Participante
														</span>
														<div className="mt-2 space-y-2">
															{ata.items.map((item) =>
																item.participantes.length === 0 ? null : (
																	<div
																		key={item.id}
																		className="border border-slate-955/8 p-3"
																	>
																		<span className="text-[10px] font-bold text-slate-900 font-sans block mb-1">
																			{item.descricao_especificacao}
																		</span>
																		<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
																			{item.participantes.map((p) => {
																				const planned = Number.parseFloat(
																					p.quantidade_planejada,
																				);
																				const consumedP = Number.parseFloat(
																					p.quantidade_consumida,
																				);
																				const pctP = calcProgress(
																					p.quantidade_consumida,
																					p.quantidade_planejada,
																				);
																				return (
																					<div
																						key={p.orgao_id}
																						className="bg-[#F8FAFE] border border-slate-955/8 p-2"
																					>
																						<span
																							className="text-[9px] font-bold text-slate-700 font-sans block truncate"
																							title={p.nome_orgao}
																						>
																							{p.nome_orgao}
																						</span>
																						<div className="flex items-center justify-between mt-1 text-[8px] text-slate-500 font-sans">
																							<span>
																								Plan:{" "}
																								{Number(planned).toLocaleString(
																									"pt-BR",
																								)}
																							</span>
																							<span>
																								Cons:{" "}
																								{Number(
																									consumedP,
																								).toLocaleString("pt-BR")}
																							</span>
																							<span
																								className={`font-bold ${pctP >= 80 ? "text-amber-600" : "text-emerald-600"}`}
																							>
																								{pctP}%
																							</span>
																						</div>
																						<div className="h-1 bg-slate-100 mt-1 w-full">
																							<div
																								className={`h-full ${
																									pctP >= 80
																										? "bg-amber-500"
																										: "bg-emerald-500"
																								}`}
																								style={{ width: `${pctP}%` }}
																							/>
																						</div>
																					</div>
																				);
																			})}
																		</div>
																	</div>
																),
															)}
														</div>
													</div>
												)}

												{/* ATA footer details */}
												<div className="border-t border-slate-955/10 bg-[#F8FAFE] px-4 py-2 flex items-center gap-6 text-[9px] text-slate-500 font-sans">
													<span>
														Assinatura: {formatDate(ata.data_assinatura)}
													</span>
													<span>
														Publicação: {formatDate(ata.data_publicacao)}
													</span>
													<span>Vigência: {ata.vigencia_meses} meses</span>
													{ata.valor_total_global && (
														<span className="font-bold text-slate-700">
															Valor Global:{" "}
															{formatCurrency(ata.valor_total_global)}
														</span>
													)}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
