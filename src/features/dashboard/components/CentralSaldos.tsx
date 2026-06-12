import { useEffect, useState } from "react";
import { api } from "@/services/api";

type CentralSaldosProps = {
	supplierId?: string | null;
};

type SupplierItem = {
	id?: string | number;
	numero_item?: unknown;
	item_ata?: {
		numero_item?: unknown;
		descricao_especificacao?: unknown;
	};
	ata_id?: unknown;
	descricao_especificacao?: unknown;
	quantidade_total_ofertada?: unknown;
	quantidade_saldo_disponivel?: unknown;
	[chave: string]: unknown;
};

const DEFAULT_LIMIT = 100;

function extractSupplierId(propSupplierId: string | null | undefined) {
	if (propSupplierId) {
		return propSupplierId;
	}

	try {
		const stored = localStorage.getItem("biap_user");
		if (!stored) return null;
		const parsed = JSON.parse(stored);
		return parsed?.fornecedor_id || null;
	} catch {
		return null;
	}
}

function adaptResponsePayload(payload: unknown): SupplierItem[] {
	if (Array.isArray(payload)) {
		return payload as SupplierItem[];
	}

	if (typeof payload === "object" && payload !== null) {
		if (Array.isArray((payload as { items?: unknown }).items)) {
			return (payload as { items: SupplierItem[] }).items;
		}
		if (Array.isArray((payload as { data?: unknown }).data)) {
			return (payload as { data: SupplierItem[] }).data;
		}
	}

	return [];
}

function getErrorMessage(err: unknown, fallback: string) {
	if (typeof err === "object" && err !== null) {
		const response = (err as { response?: unknown }).response;
		if (typeof response === "object" && response !== null) {
			const data = (response as { data?: unknown }).data;
			if (typeof data === "object" && data !== null) {
				const message = (data as { message?: unknown }).message;
				if (typeof message === "string") return message;
				const detail = (data as { detail?: unknown }).detail;
				if (typeof detail === "string") return detail;
			}
		}
		const message = (err as { message?: unknown }).message;
		if (typeof message === "string") return message;
	}

	return fallback;
}

function safeText(value: unknown): string {
	return value !== undefined && value !== null && value !== ""
		? String(value)
		: "-";
}

export default function CentralSaldos({ supplierId }: CentralSaldosProps) {
	const [items, setItems] = useState<SupplierItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [skip, setSkip] = useState(0);

	const effectiveSupplierId = extractSupplierId(supplierId);

	useEffect(() => {
		async function loadItems() {
			if (!effectiveSupplierId) {
				setError("Não foi possível localizar o identificador do fornecedor.");
				setItems([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const response = await api.get(
					`/suppliers/${effectiveSupplierId}/items`,
					{
						params: {
							limit: DEFAULT_LIMIT,
							skip,
						},
					},
				);

				const loadedItems = adaptResponsePayload(response.data);
				setItems(loadedItems);
			} catch (err: unknown) {
				const message = getErrorMessage(
					err,
					"Falha ao carregar os saldos do fornecedor.",
				);
				setError(message);
				setItems([]);
			} finally {
				setLoading(false);
			}
		}

		loadItems();
	}, [effectiveSupplierId, skip]);

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • CONTABILIDADE PÚBLICA
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Saldos do Licitante
				</h2>
			</div>

			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-slate-600 max-w-2xl">
						Análise institucional dos itens homologados em licitação com saldo
						disponível, consumo e cota total ofertada.
					</p>
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<span>Página:</span>
						<span className="font-semibold text-slate-700">
							{Math.floor(skip / DEFAULT_LIMIT) + 1}
						</span>
						<span>• Limite:</span>
						<span className="font-semibold text-slate-700">
							{DEFAULT_LIMIT}
						</span>
					</div>
				</div>

				<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<caption className="sr-only">
								Tabela de saldos por item de ata
							</caption>
							<thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider">
								<tr>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Nº do Item
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Descrição / Especificação
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Quantidade Total Ofertada
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Saldo Disponível
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 bg-white">
								{loading ? (
									<tr>
										<td
											colSpan="4"
											className="px-4 py-10 text-center text-slate-500"
										>
											Carregando saldos do fornecedor...
										</td>
									</tr>
								) : error ? (
									<tr>
										<td
											colSpan="4"
											className="px-4 py-10 text-center text-rose-700"
										>
											{error}
										</td>
									</tr>
								) : items.length === 0 ? (
									<tr>
										<td
											colSpan="4"
											className="px-4 py-10 text-center text-slate-500"
										>
											Nenhum item encontrado para este fornecedor.
										</td>
									</tr>
								) : (
									items.map((item) => {
										const itemNumber =
											safeText(item.numero_item) ||
											safeText(item?.item_ata?.numero_item) ||
											safeText(item.ata_id);
										const itemDescription =
											safeText(item.descricao_especificacao) ||
											safeText(item?.item_ata?.descricao_especificacao);

										return (
											<tr key={item.id}>
												<td className="px-4 py-4 text-slate-700 align-top">
													{itemNumber}
												</td>
												<td className="px-4 py-4 text-slate-600 align-top">
													{itemDescription}
												</td>
												<td className="px-4 py-4 text-slate-700 align-top">
													{safeText(item.quantidade_total_ofertada)}
												</td>
												<td className="px-4 py-4 align-top">
													<span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-950">
														{safeText(item.quantidade_saldo_disponivel)}
													</span>
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
			</div>
		</div>
	);
}
