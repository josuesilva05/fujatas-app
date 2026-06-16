import type {
	PedidoCreate,
	PedidoDetailResponse,
	PedidoResponse,
} from "@/types/order";
import { api } from "./api";

export async function listOrders(
	skip = 0,
	limit = 100,
): Promise<PedidoResponse[]> {
	const response = await api.get<PedidoResponse[]>("/orders", {
		params: { skip, limit },
	});
	return response.data;
}

export async function getOrderDetail(
	id: string,
): Promise<PedidoDetailResponse> {
	const response = await api.get<PedidoDetailResponse>(`/orders/${id}`);
	return response.data;
}

export async function createOrder(
	payload: PedidoCreate,
): Promise<PedidoResponse> {
	const response = await api.post<PedidoResponse>("/orders", payload);
	return response.data;
}

export async function updateOrderStatus(
	id: string,
	status: "AUTORIZADO" | "REJEITADO" | "EMITIDO",
	justificativa?: string,
	autorizadoPor?: string,
) {
	const response = await api.put(`/orders/${id}/status`, {
		status,
		justificativa_rejeicao: justificativa,
		autorizado_por_usuario_id: autorizadoPor,
	});
	return response.data;
}
