import type { SupplierBalance, SupplierOrder } from "@/types/supplier";
import { api } from "./api";

function extractArray<T>(data: unknown): T[] {
	if (Array.isArray(data)) return data as T[];
	if (data && typeof data === "object" && "content" in data) {
		const obj = data as { content: unknown };
		if (Array.isArray(obj.content)) return obj.content as T[];
	}
	return [];
}

export async function getSupplierBalances(
	supplierId: string,
): Promise<SupplierBalance[]> {
	const response = await api.get(`/suppliers/${supplierId}/items`);
	return extractArray<SupplierBalance>(response.data);
}

export async function getSupplierOrders(
	supplierId: string,
): Promise<SupplierOrder[]> {
	const response = await api.get(`/suppliers/${supplierId}/orders`);
	return extractArray<SupplierOrder>(response.data);
}