import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";

const DEFAULT_LIMIT = 100;

type SupplierSalesOrder = {
	id?: string | number;
	orgao_comprador?: { nome?: string; cnpj?: string };
	orgao?: { nome?: string; cnpj?: string };
	orgao_nome?: string;
	orgao_cnpj?: string;
	status?: string;
	status_pedido?: string;
	data_pedido?: string;
	created_at?: string;
	data?: string;
	[chave: string]: unknown;
};

function extractSupplierId() {
	try {
		const stored = localStorage.getItem("biap_user");
		if (!stored) return null;
		return JSON.parse(stored)?.fornecedor_id || null;
	} catch {
		return null;
	}
}

function adaptOrdersPayload(payload: unknown): SupplierSalesOrder[] {
	if (Array.isArray(payload)) return payload as SupplierSalesOrder[];
	if (typeof payload === "object" && payload !== null) {
		if (Array.isArray((payload as { orders?: unknown }).orders)) {
			return (payload as { orders: SupplierSalesOrder[] }).orders;
		}
		if (Array.isArray((payload as { data?: unknown }).data)) {
			return (payload as { data: SupplierSalesOrder[] }).data;
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

function safeText(value: unknown) {
	if (value === undefined || value === null || value === "") return "-";
	return String(value);
}

function formatDate(value: unknown) {
	if (!value) return "-";
	const date = new Date(String(value));
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function getStatusClass(status: string) {
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

export default function SupplierSales() {
	const [orders, setOrders] = useState<SupplierSalesOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [skip, setSkip] = useState(0);
	const [invoiceKey, setInvoiceKey] = useState("");
	const [selectedOrderId, setSelectedOrderId] = useState("");
	const [updating, setUpdating] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");
	const [statusError, setStatusError] = useState("");

	const supplierId = extractSupplierId();
	const selectedOrderIdRef = useRef(selectedOrderId);

	useEffect(() => {
		selectedOrderIdRef.current = selectedOrderId;
	}, [selectedOrderId]);

	const loadOrders = useCallback(async () => {
		if (!supplierId) {
			setError("Não foi possível localizar o identificador do fornecedor.");
			setOrders([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await api.get(`/suppliers/${supplierId}/orders`, {
				params: {
					limit: DEFAULT_LIMIT,
					skip,
				},
			});

			const loadedOrders = adaptOrdersPayload(response.data);
			setOrders(loadedOrders);
			if (!selectedOrderIdRef.current && loadedOrders.length > 0) {
				setSelectedOrderId(String(loadedOrders[0].id));
			}
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
	}, [supplierId, skip]);

	useEffect(() => {
		void loadOrders();
	}, [loadOrders]);

	const handleRegisterInvoice = async () => {
		if (!selectedOrderId) {
			setStatusError("Selecione um pedido antes de registrar a NF-e.");
			return;
		}

		if (!invoiceKey.trim()) {
			setStatusError("Informe a chave da NF-e antes de enviar.");
			return;
		}

		setUpdating(true);
		setStatusError("");
		setStatusMessage("");

		try {
			await api.put(`/orders/${selectedOrderId}/status`, {
				status: "EMITIDO",
				chave_nfe: invoiceKey.trim(),
			});

			setStatusMessage("NF-e registrada com sucesso.");
			setInvoiceKey("");
			loadOrders();
		} catch (err: unknown) {
			const message = getErrorMessage(
				err,
				"Falha ao atualizar o status do pedido.",
			);
			setStatusError(message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • FLUXO DE VENDAS
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Notificações de Vendas
				</h2>
			</div>

			{/* Placeholder Content */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					<div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
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
											colSpan={4}
											className="px-4 py-10 text-center text-slate-500"
										>
											Carregando pedidos do fornecedor...
										</td>
									</tr>
								) : error ? (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-10 text-center text-rose-700"
										>
											{error}
										</td>
									</tr>
								) : orders.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-10 text-center text-slate-500"
										>
											Nenhum pedido encontrado para este fornecedor.
										</td>
									</tr>
								) : (
									orders.map((order) => {
										const orgao = order?.orgao_comprador || order?.orgao || {};
										const statusClass = getStatusClass(
											String(order.status || order.status_pedido || "PENDENTE"),
										);

										return (
											<tr key={order.id}>
												<td className="px-4 py-4 align-top text-slate-700">
													{safeText(order.id)}
												</td>
												<td className="px-4 py-4 align-top text-slate-600">
													<div className="font-semibold text-slate-900">
														{safeText(orgao.nome) || safeText(order.orgao_nome)}
													</div>
													<div className="text-xs text-slate-500">
														{safeText(orgao.cnpj) || safeText(order.orgao_cnpj)}
													</div>
												</td>
												<td className="px-4 py-4 align-top text-slate-700">
													{formatDate(
														order.data_pedido || order.created_at || order.data,
													)}
												</td>
												<td className="px-4 py-4 align-top">
													<span
														className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass}`}
													>
														{safeText(order.status || order.status_pedido)}
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
							a rotina de emissão de NF-e e despacho.
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

				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ FATURAMENTO E LOGÍSTICA (MOCKUP)
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite logístico exige a associação da chave de acesso ou
							número da NF-e para liberação do pagamento financeiro pela
							administração pública.
						</p>
						<div className="space-y-4">
							<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
								Pedido selecionado
							</label>
							<select
								value={selectedOrderId}
								onChange={(e) => setSelectedOrderId(e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950"
							>
								{orders.length === 0 ? (
									<option value="">Nenhum pedido disponível</option>
								) : (
									orders.map((order) => (
										<option key={order.id} value={order.id}>
											{`Pedido ${safeText(order.id)} — ${safeText(order.status)}`}
										</option>
									))
								)}
							</select>
							<input
								value={invoiceKey}
								onChange={(e) => setInvoiceKey(e.target.value)}
								placeholder="Chave de acesso da NF-e"
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950"
							/>
							<button
								type="button"
								onClick={handleRegisterInvoice}
								disabled={updating || !selectedOrderId || !invoiceKey.trim()}
								className="w-full rounded-xl border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
							>
								{updating ? "Registrando..." : "Registrar NF-e"}
							</button>
							{statusError ? (
								<p className="text-xs text-rose-700">{statusError}</p>
							) : statusMessage ? (
								<p className="text-xs text-emerald-700">{statusMessage}</p>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
