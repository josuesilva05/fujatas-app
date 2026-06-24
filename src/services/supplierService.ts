import type { SupplierBalance, SupplierOrder } from "@/types/supplier";
import { api } from "./api";

export async function getSupplierBalances(
	supplierId: string,
): Promise<SupplierBalance[]> {
	try {
		const url = `/suppliers/${supplierId}/items`;

		console.log("URL BALANCES:", url);

		const response = await api.get(url);

		console.log("BALANCES RESPONSE:", response);

		return response.data?.content || [];
	} catch (error: unknown) {
		console.error("BALANCES ERROR:", error);

		const axiosErr = error as {
			response?: { status?: number; data?: unknown };
		};
		if (axiosErr.response) {
			console.error("STATUS:", axiosErr.response.status);
			console.error("DATA:", axiosErr.response.data);
		}

		throw error;
	}
}

export async function getSupplierOrders(
	supplierId: string,
): Promise<SupplierOrder[]> {
	try {
		const response = await api.get(`/suppliers/${supplierId}/orders`);

		return response.data?.content || [];
	} catch (error) {
		console.error(error);
		throw error;
	}
}
