import axios from "axios";
import type { LoginResponse, UserSession } from "@/types/auth";
import { api } from "./api";

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

export async function getMe(): Promise<UserSession> {
	try {
		const response = await api.get<UserSession>("/auth/me");
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			const message =
				error.response?.data?.detail ||
				"Erro ao recuperar dados da sessão do usuário.";
			throw new Error(message);
		}
		throw new Error("Não foi possível conectar ao servidor BIAP.");
	}
}
