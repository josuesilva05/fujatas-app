import { useEffect, useState } from "react";
import { api } from "@/services/api";

const DEFAULT_LIMIT = 100;

function extractSupplierId() {
	try {
		const stored = localStorage.getItem("biap_user");
		if (!stored) return null;
		return JSON.parse(stored)?.fornecedor_id || null;
	} catch {
		return null;
	}
}

function adaptItemsPayload(payload: any) {
	if (Array.isArray(payload)) return payload;
	if (payload?.items && Array.isArray(payload.items)) return payload.items;
	if (payload?.data && Array.isArray(payload.data)) return payload.data;
	return [];
}

function safeText(value: unknown) {
	if (value === undefined || value === null || value === "") return "-";
	return String(value);
}

export default function SupplierBalances() {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [skip, setSkip] = useState(0);

	const supplierId = extractSupplierId();

	useEffect(() => {
		async function loadItems() {
			if (!supplierId) {
				setError("Não foi possível localizar o identificador do fornecedor.");
				setItems([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const response = await api.get(`/suppliers/${supplierId}/items`, {
					params: {
						limit: DEFAULT_LIMIT,
						skip,
					},
				});

				const loadedItems = adaptItemsPayload(response.data);
				setItems(loadedItems);
			} catch (err: any) {
				const message =
					err?.response?.data?.message ||
					err?.response?.data?.detail ||
					err?.message ||
					"Falha ao carregar os saldos do fornecedor.";
				setError(message);
				setItems([]);
			} finally {
				setLoading(false);
			}
		}

		loadItems();
	}, [supplierId, skip]);

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • CONTABILIDADE PÚBLICA
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Saldos do Licitante
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<caption className="sr-only">
								Tabela de saldos por item de ata
							</caption>
							<thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider">
								<tr>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Nome do Item
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Saldo Disponível
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Saldo Consumido
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 bg-white">
								{loading ? (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-10 text-center text-slate-500"
										>
											Carregando saldos do fornecedor...
										</td>
									</tr>
								) : error ? (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-10 text-center text-rose-700"
										>
											{error}
										</td>
									</tr>
								) : items.length === 0 ? (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-10 text-center text-slate-500"
										>
											Nenhum item encontrado para este fornecedor.
										</td>
									</tr>
								) : (
									items.map((item) => {
										const itemName =
											item.nome ||
											item.descricao ||
											item?.item_ata?.descricao_especificacao ||
											item?.item_ata?.nome ||
											item.id ||
											"Item não identificado";
										const available =
											item.saldo_disponivel ||
											item.saldoDisponivel ||
											item.quantidade_saldo_disponivel ||
											item.saldo ||
											0;
										const consumed =
											item.saldo_consumido ||
											item.saldoConsumido ||
											item.quantidade_consumida ||
											0;

										return (
											<tr key={item.id || itemName}>
												<td className="px-4 py-4 text-slate-700 align-top">
													{safeText(itemName)}
												</td>
												<td className="px-4 py-4 text-slate-700 align-top">
													{safeText(available)}
												</td>
												<td className="px-4 py-4 text-slate-700 align-top">
													{safeText(consumed)}
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>

					<div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs text-slate-500">
							Resultado da busca limitado por página para manter a leitura ágil
							e a performance institucional.
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={loading || skip === 0}
								onClick={() => setSkip(Math.max(skip - DEFAULT_LIMIT, 0))}
								className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
							>
								Anterior
							</button>
							<button
								type="button"
								disabled={loading || items.length < DEFAULT_LIMIT}
								onClick={() => setSkip(skip + DEFAULT_LIMIT)}
								className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
							>
								Próxima
							</button>
						</div>
					</div>
				</div>

				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ REGISTRO DE ADJUDICAÇÃO (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite adjudicado exige a associação da ata correspondente e a
							reserva de cotas físicas para atendimento aos órgãos públicos
							demandantes.
						</p>
						<div className="border border-dashed border-slate-950/20 p-4 bg-[#F7F6F2]/50 text-slate-400 text-center font-bold text-[10px] uppercase tracking-wide font-sans">
							[Livro de Saldos Inativo]
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
