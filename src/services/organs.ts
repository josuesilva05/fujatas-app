import type { Organ } from "@/types/organ";
import { api } from "./api";

export async function listOrgans(): Promise<Organ[]> {
	const response = await api.get<Organ[]>("/organs");
	return response.data;
}
