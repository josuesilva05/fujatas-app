import type {
	AtaAuditLogEntry,
	AtaCreatePayload,
	AtaDetailResponse,
	AtaMonitorPageResponse,
	AtaMonitorResponse,
	AtaResponse,
	AtaStatusUpdatePayload,
	AtaUpdatePayload,
	ItemSearchPageResponse,
	SearchItemsParams,
	VwSaldoItemAtaResponse,
} from "@/types/ata";
import type { FornecedorResponse } from "@/types/supplier";
import { api } from "./api";

// URL base da API (sem trailing slash)
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function listAtas(skip = 0, limit = 100): Promise<AtaResponse[]> {
	const response = await api.get<AtaResponse[]>("/atas", {
		params: { skip, limit },
	});
	return response.data;
}

export async function getAta(id: string): Promise<AtaDetailResponse> {
	const response = await api.get<AtaDetailResponse>(`/atas/${id}`);
	return response.data;
}

export async function getAtaBalances(
	id: string,
): Promise<VwSaldoItemAtaResponse[]> {
	const response = await api.get<VwSaldoItemAtaResponse[]>(
		`/atas/${id}/balances`,
	);
	return response.data;
}

export async function getItemBalance(
	itemAtaId: string,
): Promise<VwSaldoItemAtaResponse> {
	const response = await api.get<VwSaldoItemAtaResponse>(
		`/atas/balances/item/${itemAtaId}`,
	);
	return response.data;
}

export async function searchItems(
	params: SearchItemsParams = {},
): Promise<ItemSearchPageResponse> {
	const response = await api.get<ItemSearchPageResponse>("/items/search", {
		params,
	});
	return response.data;
}

export async function listSuppliers(
	skip = 0,
	limit = 100,
): Promise<FornecedorResponse[]> {
	const response = await api.get<FornecedorResponse[]>("/suppliers", {
		params: { skip, limit },
	});
	return response.data;
}

export async function createAta(payload: AtaCreatePayload) {
	const response = await api.post("/atas", payload);
	return response.data;
}

export async function getAtaMonitoring(
	skip = 0,
	limit = 100,
): Promise<AtaMonitorResponse[]> {
	const response = await api.get<AtaMonitorPageResponse>("/atas/monitoring", {
		params: { skip, limit },
	});
	// A API retorna objeto paginado — extrai o array de conteúdo
	return response.data?.content ?? [];
}

export async function updateAta(
	id: string,
	payload: AtaUpdatePayload,
): Promise<AtaResponse> {
	const response = await api.patch<AtaResponse>(`/atas/${id}`, payload);
	return response.data;
}

export async function updateAtaStatus(
	id: string,
	payload: AtaStatusUpdatePayload,
): Promise<AtaResponse> {
	const response = await api.patch<AtaResponse>(`/atas/${id}/status`, payload);
	return response.data;
}

export async function getAtaAuditLog(id: string): Promise<AtaAuditLogEntry[]> {
	const response = await api.get<AtaAuditLogEntry[]>(`/atas/${id}/audit-log`);
	return response.data;
}

/**
 * Faz upload de uma imagem de produto para o backend.
 * Retorna a URL pública completa da imagem (ex: http://localhost:8000/uploads/items/abc123.jpg)
 */
export async function uploadItemImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<{ url: string; filename: string }>(
		"/uploads/image",
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		},
	);

	// Montar a URL completa a partir do caminho relativo retornado pelo backend
	return `${API_BASE_URL}${response.data.url}`;
}

export async function parseAtaPdf(file: File): Promise<any> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<any>(
		"/uploads/parse-pdf",
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		},
	);
	return response.data;
}

