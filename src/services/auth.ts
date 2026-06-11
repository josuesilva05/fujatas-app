import axios from "axios";
import { api } from "./api";

export interface LoginResponse {
	access_token: string;
	token_type: string;
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

export async function loginWithJson(
	email: string,
	password: string,
): Promise<LoginResponse> {
	try {
		const response = await api.post<LoginResponse>("/auth/login/json", {
			email,
			password,
		});
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const message =
				error.response?.data?.detail ||
				"Erro ao efetuar login. Verifique suas credenciais.";
			throw new Error(message);
		}
		throw new Error("Não foi possível conectar ao servidor BIAP.");
	}
}
