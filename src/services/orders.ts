import { api } from "./api";
import type { ItemAtaResponse, OrgaoResponse } from "./atas";

/* ─── Types matching backend schemas ─── */

export interface ItemPedidoCreate {
  item_ata_id: string;
  quantidade_solicitada: number;
  preco_unitario_no_pedido: number;
}

export interface PedidoCreate {
  orgao_comprador_id: string;
  ata_id: string;
  // tipo_adesao is NOT sent — backend determines it automatically
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

/* ─── API functions ─── */

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
