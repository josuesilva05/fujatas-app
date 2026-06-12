import { api } from "./api";

export interface AtaCreatePayload {
	numero_ata: string;
	processo_administrativo?: string;
	numero_pregao?: string;
	orgao_gerenciador_id: string;
	data_assinatura?: string; // YYYY-MM-DD
	data_publicacao?: string; // YYYY-MM-DD
	vigencia_meses: number;
	valor_total_global?: number;
	grupos: {
		numero_grupo: string;
		descricao?: string;
		orgao_id?: string;
		quantidade_planejada?: number;
	}[];
	regras_carona: {
		percentual_maximo_do_saldo: number;
		descricao?: string;
	}[];
	items: {
		grupo_numero?: string;
		fornecedor_id: string;
		numero_item?: string;
		descricao_especificacao: string;
		unidade_medida?: string;
		marca_modelo?: string;
		valor_unitario: number;
		quantidade_total_ofertada: number;
	}[];
}

export async function listAtas() {
	const response = await api.get("/atas");
	return response.data;
}

export async function getAta(id: string) {
	const response = await api.get(`/atas/${id}`);
	return response.data;
}

export async function getAtaBalances(id: string) {
	const response = await api.get(`/atas/${id}/balances`);
	return response.data;
}

export async function createAta(payload: AtaCreatePayload) {
	const response = await api.post("/atas", payload);
	return response.data;
}
