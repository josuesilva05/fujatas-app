import { api } from "./api";

export interface OrderItem {
	id: string;
	pedido_id: string;
	item_ata_id: string;
	quantidade_solicitada: number;
	preco_unitario_no_pedido: number;
	subtotal: number;
	item_ata: {
		id: string;
		numero_item: string;
		descricao_especificacao: string;
		unidade_medida?: string;
		marca_modelo?: string;
		valor_unitario: number;
	};
}

export interface OrderDetail {
	id: string;
	orgao_comprador_id: string;
	ata_id: string;
	data_pedido: string;
	tipo_adesao: "DIRETA" | "CARONA";
	status: "PENDENTE" | "AUTORIZADO" | "REJEITADO" | "EMITIDO";
	autorizado_por_usuario_id?: string;
	data_autorizacao?: string;
	justificativa_rejeicao?: string;
	orgao_comprador: {
		id: string;
		cnpj: string;
		nome: string;
		tipo: string;
	};
	itens: OrderItem[];
}

export async function listOrders() {
	const response = await api.get("/orders");
	return response.data;
}

export async function getOrderDetail(id: string): Promise<OrderDetail> {
	const response = await api.get<OrderDetail>(`/orders/${id}`);
	return response.data;
}

export async function updateOrderStatus(
	id: string,
	status: "AUTORIZADO" | "REJEITADO" | "EMITIDO",
	justificativa?: string,
	autorizadoPor?: string,
) {
	const payload: {
		status: string;
		justificativa_rejeicao?: string;
		autorizado_por_usuario_id?: string;
	} = {
		status,
	};
	if (justificativa) {
		payload.justificativa_rejeicao = justificativa;
	}
	if (autorizadoPor) {
		payload.autorizado_por_usuario_id = autorizadoPor;
	}
	const response = await api.put(`/orders/${id}/status`, payload);
	return response.data;
}
