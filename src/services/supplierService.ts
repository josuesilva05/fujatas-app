import type {
	FornecedorResponse,
	SupplierBalance,
	SupplierOrder,
} from "@/types/supplier";
import { api } from "./api";

export interface SupplierItemsResponse<T = SupplierBalance> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number?: number;
	size?: number;
	first?: boolean;
	last?: boolean;
}
function extractPage<T>(
	data: unknown,
	limit: number,
): SupplierItemsResponse<T> {
	limit = Math.max(1, limit);

	if (Array.isArray(data)) {
		return {
			content: data as T[],
			totalElements: data.length,
			totalPages: Math.ceil(data.length / limit),
			number: 0,
			size: limit,
			first: true,
			last: data.length <= limit,
		};
	}

	if (data && typeof data === "object") {
		const obj = data as Record<string, unknown>;
		const content = (Array.isArray(obj.content) ? obj.content : []) as T[];
		const totalElements =
			typeof obj.totalElements === "number"
				? obj.totalElements
				: content.length;
		const totalPages =
			typeof obj.totalPages === "number"
				? obj.totalPages
				: Math.ceil(totalElements / limit);

		return {
			content,
			totalElements,
			totalPages,
			number: typeof obj.number === "number" ? obj.number : undefined,
			size: typeof obj.size === "number" ? obj.size : limit,
			first: typeof obj.first === "boolean" ? obj.first : undefined,
			last: typeof obj.last === "boolean" ? obj.last : undefined,
		};
	}

	return { content: [], totalElements: 0, totalPages: 0, size: limit };
}

export async function getSupplierBalances(
	supplierId: string,
	params: { skip?: number; limit?: number; q?: string } = {},
): Promise<SupplierItemsResponse> {
	const response = await api.get(`/suppliers/${supplierId}/items`, {
		params,
	});
	return extractPage<SupplierBalance>(response.data, params.limit ?? 8);
}

export async function getSuppliers(
	params: { skip?: number; limit?: number; q?: string } = {},
): Promise<SupplierItemsResponse<FornecedorResponse>> {
	const response = await api.get("/suppliers", { params });
	return extractPage<FornecedorResponse>(response.data, params.limit ?? 8);
}

export async function getSupplierOrders(
	supplierId: string,
	params: { skip?: number; limit?: number } = {},
): Promise<SupplierItemsResponse<SupplierOrder>> {
	const response = await api.get(`/suppliers/${supplierId}/orders`, {
		params,
	});
	return extractPage<SupplierOrder>(response.data, params.limit ?? 8);
}
