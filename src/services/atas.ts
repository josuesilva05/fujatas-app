import type {
	AtaCreatePayload,
	AtaDetailResponse,
	AtaMonitorResponse,
	AtaResponse,
	ItemSearchPageResponse,
	SearchItemsParams,
	VwSaldoItemAtaResponse,
} from "@/types/ata";
import type { FornecedorResponse } from "@/types/supplier";
import { api } from "./api";

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

export async function getAtaMonitoring(): Promise<AtaMonitorResponse[]> {
	const response = await api.get<AtaMonitorResponse[]>("/atas/monitoring");
	return response.data;
}
