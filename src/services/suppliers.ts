import type { Supplier } from "@/types/supplier";
import { api } from "./api";

export async function listSuppliers(): Promise<Supplier[]> {
	const response = await api.get<Supplier[]>("/suppliers");
	return response.data;
}

export async function createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
	const response = await api.post<Supplier>("/suppliers", supplier);
	return response.data;
}

export async function updateSupplier(id: string, supplier: Partial<Omit<Supplier, "id">>): Promise<Supplier> {
	const response = await api.put<Supplier>(`/suppliers/${id}`, supplier);
	return response.data;
}

export async function deleteSupplier(id: string): Promise<void> {
	await api.delete(`/suppliers/${id}`);
}

