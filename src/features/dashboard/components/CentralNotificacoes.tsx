import { useEffect, useState } from "react";
import { api } from "@/services/api";

type CentralNotificacoesProps = {
	supplierId?: string | null;
};

type SupplierOrder = {
	id?: string | number;
	status?: unknown;
	status_pedido?: unknown;
	data_pedido?: unknown;
	created_at?: unknown;
	data?: unknown;
	orgao_comprador?: {
		nome?: unknown;
		cnpj?: unknown;
	};
	orgao?: {
		nome?: unknown;
		cnpj?: unknown;
	};
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

function adaptResponsePayload(payload: unknown): SupplierOrder[] {
	if (Array.isArray(payload)) {
		return payload as SupplierOrder[];
	}

	if (typeof payload === "object" && payload !== null) {
		if (Array.isArray((payload as { orders?: unknown }).orders)) {
			return (payload as { orders: SupplierOrder[] }).orders;
		}
		if (Array.isArray((payload as { data?: unknown }).data)) {
			return (payload as { data: SupplierOrder[] }).data;
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

function formatDate(value: unknown) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";

	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function getStatusClass(status) {
	switch (status) {
		case "AUTORIZADO":
			return "text-emerald-800 bg-emerald-50 border-emerald-200";
		case "REJEITADO":
			return "text-rose-800 bg-rose-50 border-rose-200";
		case "EMITIDO":
			return "text-slate-900 bg-slate-100 border-slate-300";
		case "PENDENTE":
		default:
			return "text-amber-800 bg-amber-50 border-amber-200";
	}
}

export default function CentralNotificacoes({
	supplierId,
}: CentralNotificacoesProps) {
	const [orders, setOrders] = useState<SupplierOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [skip, setSkip] = useState(0);

	const effectiveSupplierId = extractSupplierId(supplierId);

	useEffect(() => {
		async function loadOrders() {
			if (!effectiveSupplierId) {
				setError("Não foi possível localizar o identificador do fornecedor.");
				setOrders([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const response = await api.get(
					`/suppliers/${effectiveSupplierId}/orders`,
					{
						params: {
							limit: DEFAULT_LIMIT,
							skip,
						},
					},
				);

				const loadedOrders = adaptResponsePayload(response.data);
				setOrders(loadedOrders);
			} catch (err: unknown) {
				const message = getErrorMessage(
					err,
					"Falha ao carregar as notificações de vendas.",
				);
				setError(message);
				setOrders([]);
			} finally {
				setLoading(false);
			}
		}

		loadOrders();
	}, [effectiveSupplierId, skip]);

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • FLUXO DE VENDAS
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Notificações de Vendas
				</h2>
			</div>

			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-slate-600 max-w-2xl">
						Lista institucional de pedidos por fornecedor com status, unidade
						compradora e data de emissão.
					</p>
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<span>Página:</span>
						<span className="font-semibold text-slate-700">
							{Math.floor(skip / DEFAULT_LIMIT) + 1}
						</span>
					</div>
				</div>

				<div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<caption className="sr-only">
								Tabela de pedidos do fornecedor
							</caption>
							<thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wider">
								<tr>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Pedido
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Órgão Comprador
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Data do Pedido
									</th>
									<th scope="col" className="px-4 py-3 text-left font-semibold">
										Status
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
											Carregando pedidos do fornecedor...
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
								) : orders.length === 0 ? (
									<tr>
										<td
											colSpan="4"
											className="px-4 py-10 text-center text-slate-500"
										>
											Nenhum pedido encontrado para este fornecedor.
										</td>
									</tr>
								) : (
									orders.map((order) => {
										const orgao = order?.orgao_comprador || {};
										const statusClass = getStatusClass(order.status);

										return (
											<tr key={order.id}>
												<td className="px-4 py-4 align-top text-slate-700">
													{safeText(order.id)}
												</td>
												<td className="px-4 py-4 align-top text-slate-600">
													<div className="font-semibold text-slate-900">
														{safeText(orgao.nome)}
													</div>
													<div className="text-xs text-slate-500">
														{safeText(orgao.cnpj)}
													</div>
												</td>
												<td className="px-4 py-4 align-top text-slate-700">
													{formatDate(order.data_pedido)}
												</td>
												<td className="px-4 py-4 align-top">
													<span
														className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass}`}
													>
														{safeText(order.status)}
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
							O status de cada pedido é apresentado em badge institucional para
							apoiar a rotina de emissão de NF-e e despacho.
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
								disabled={loading || orders.length < DEFAULT_LIMIT}
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

function safeText(value: unknown): string {
	return value !== undefined && value !== null && value !== ""
		? String(value)
		: "-";
}
