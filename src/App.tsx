import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLE_DEFAULTS, roleToPath } from "@/lib/routes";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import { getMe } from "@/services/auth";
import type { UserSession } from "@/types/auth";

interface LoginSuccessData {
	access_token: string;
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

function App() {
	const [user, setUser] = useState<UserSession | null>(null);
	const [loading, setLoading] = useState(true);

	// Check authentication state on mount
	useEffect(() => {
		const token = localStorage.getItem("biap_access_token");

		if (token) {
			getMe()
				.then((userData) => {
					setUser(userData);
					setLoading(false);
				})
				.catch(() => {
					// Clear invalid data
					localStorage.removeItem("biap_access_token");
					localStorage.removeItem("biap_user");
					setUser(null);
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, []);

	const handleLoginSuccess = (loginData: LoginSuccessData) => {
		setUser({
			id: loginData.id,
			email: loginData.email,
			papel: loginData.papel,
			orgao_id: loginData.orgao_id,
			fornecedor_id: loginData.fornecedor_id,
		});
	};

	const handleLogout = () => {
		localStorage.removeItem("biap_access_token");
		localStorage.removeItem("biap_user");
		setUser(null);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
				<svg
					className="animate-spin h-8 w-8 text-biap-blue mb-4"
					fill="none"
					viewBox="0 0 24 24"
					role="img"
					aria-label="Loading Spinner"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				<span className="text-sm font-semibold text-slate-500">
					Carregando sessão...
				</span>
			</div>
		);
	}

	const defaultTab = ROLE_DEFAULTS[user?.papel ?? ""] ?? "vitrine";
	const defaultPath = user
		? `/${roleToPath(user.papel)}/${defaultTab}`
		: "/login";

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/login"
					element={
						user ? (
							<Navigate to={defaultPath} replace />
						) : (
							<LoginPage onLoginSuccess={handleLoginSuccess} />
						)
					}
				/>
				<Route
					path="/:role/:tab?"
					element={
						user ? (
							<DashboardPage user={user} onLogout={handleLogout} />
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>
				<Route path="*" element={<Navigate to={defaultPath} replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
