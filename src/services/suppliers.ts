import type { Supplier } from "@/types/supplier";
import { api } from "./api";

export async function listSuppliers(): Promise<Supplier[]> {
	const response = await api.get<Supplier[]>("/suppliers");
	return response.data;
}
