import { api } from "./api";

export interface Organ {
	id: string;
	cnpj: string;
	nome: string;
	tipo: "FEDERAL" | "ESTADUAL" | "MUNICIPAL";
	endereco?: string;
}

export async function listOrgans(): Promise<Organ[]> {
	const response = await api.get<Organ[]>("/organs");
	return response.data;
}
