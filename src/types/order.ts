import type { ItemAtaResponse, OrgaoResponse } from "./ata";

export interface ItemPedidoCreate {
	item_ata_id: string;
	quantidade_solicitada: number;
	preco_unitario_no_pedido: number;
}

export interface PedidoCreate {
	orgao_comprador_id: string;
	ata_id: string;
	itens: ItemPedidoCreate[];
}

export interface ItemPedidoResponse {
	id: string;
	pedido_id: string;
	item_ata_id: string;
	quantidade_solicitada: string;
	preco_unitario_no_pedido: string;
	subtotal: string;
	item_ata: ItemAtaResponse;
}

export interface PedidoResponse {
	id: string;
	orgao_comprador_id: string;
	ata_id: string;
	data_pedido: string;
	tipo_adesao: "DIRETA" | "CARONA";
	status: "PENDENTE" | "AUTORIZADO" | "REJEITADO" | "EMITIDO";
	autorizado_por_usuario_id?: string;
	data_autorizacao?: string;
	justificativa_rejeicao?: string;
}

export interface PedidoDetailResponse extends PedidoResponse {
	orgao_comprador: OrgaoResponse;
	itens: ItemPedidoResponse[];
}
