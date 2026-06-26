import type { Organ } from "@/types/organ";
import { api } from "./api";

export async function listOrgans(): Promise<Organ[]> {
	const response = await api.get<Organ[]>("/organs");
	return response.data;
}

export async function createOrgan(organ: Omit<Organ, "id">): Promise<Organ> {
	const response = await api.post<Organ>("/organs", organ);
	return response.data;
}

export async function updateOrgan(id: string, organ: Partial<Omit<Organ, "id">>): Promise<Organ> {
	const response = await api.put<Organ>(`/organs/${id}`, organ);
	return response.data;
}

export async function deleteOrgan(id: string): Promise<void> {
	await api.delete(`/organs/${id}`);
}

