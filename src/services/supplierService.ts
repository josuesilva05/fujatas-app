import { api } from "./api";

export interface SupplierBalance {
	id: string;
	numero_item: string;
	descricao_especificacao: string;
	unidade_medida?: string;
	marca_modelo?: string;
	url_imagem?: string;
	valor_unitario: number;
	quantidade_total_ofertada?: number;
	quantidade_saldo_disponivel?: number;

	fornecedor?: {
		id: string;
		cnpj: string;
		razao_social: string;
	};

	ata?: {
		id: string;
		numero_ata: string;
	};

	grupo?: {
		id: string;
		numero_grupo: string;
		descricao: string;
	};
}

export interface SupplierOrder {
	id: string;
	data_pedido: string;
	status: string;
	tipo_adesao: string;

	orgao_comprador: {
		id: string;
		nome: string;
		cnpj: string;
		tipo: string;
	};

	itens: any[];
}

export async function getSupplierBalances(
	supplierId: string,
): Promise<SupplierBalance[]> {
	try {
		const url = `/suppliers/${supplierId}/items`;

		console.log("URL BALANCES:", url);

		const response = await api.get(url);

		console.log("BALANCES RESPONSE:", response);

		return response.data;
	} catch (error: any) {
		console.error("BALANCES ERROR:", error);

		if (error.response) {
			console.error("STATUS:", error.response.status);
			console.error("DATA:", error.response.data);
		}

		throw error;
	}
}

export async function getSupplierOrders(
	supplierId: string,
): Promise<SupplierOrder[]> {
	try {
		const response = await api.get(`/suppliers/${supplierId}/orders`);

		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
