export interface Supplier {
	id: string;
	cnpj: string;
	razao_social: string;
	endereco?: string;
	nome_representante?: string;
	cpf_representante?: string;
	telefone?: string;
	email?: string;
}

export interface FornecedorResponse {
	id: string;
	cnpj: string;
	razao_social: string;
	endereco?: string;
	nome_representante?: string;
	cpf_representante?: string;
	telefone?: string;
	email?: string;
}

export interface SupplierBalance {
	id: string;
	numero_item: string;
	descricao_especificacao: string;
	unidade_medida?: string;
	marca_modelo?: string;
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
	itens: unknown[];
}
