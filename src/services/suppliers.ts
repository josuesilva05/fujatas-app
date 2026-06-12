import { api } from "./api";

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

export async function listSuppliers(): Promise<Supplier[]> {
	const response = await api.get<Supplier[]>("/suppliers");
	return response.data;
}
