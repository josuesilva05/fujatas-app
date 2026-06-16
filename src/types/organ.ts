export interface Organ {
	id: string;
	cnpj: string;
	nome: string;
	tipo: "FEDERAL" | "ESTADUAL" | "MUNICIPAL";
	endereco?: string;
}
