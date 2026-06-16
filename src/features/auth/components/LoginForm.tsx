import {
	AlertTriangle,
	ArrowRight,
	Eye,
	EyeOff,
	Lock,
	Mail,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { loginWithJson } from "@/services/auth";

interface LoginFormProps {
	onLoginSuccess: (user: {
		access_token: string;
		id: string;
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	}) => void;
	variant?:
		| "concreto"
		| "monolito"
		| "editorial"
		| "planalto"
		| "terminal"
		| "solidez"
		| "palacio";
}

const styles = {
	concreto: {
		textHeader: "text-slate-900 font-bold font-display text-2xl tracking-tight",
		textSub: "text-slate-500 text-xs mt-1.5 leading-relaxed font-light",
		label: "text-xs font-semibold text-slate-700 mb-1.5 block",
		input:
			"w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-sans",
		button:
			"w-full h-11 bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-md active:scale-[0.99] transition-all rounded-xl mt-2 flex items-center justify-center gap-2",
		checkboxLabel:
			"ml-2.5 text-xs text-slate-500 font-medium cursor-pointer select-none",
		checkbox:
			"w-4.5 h-4.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 bg-slate-50 transition-all cursor-pointer",
		error:
			"mb-5 p-3.5 text-xs bg-red-50/50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-2.5 font-medium leading-normal animate-slide-down",
		border: "w-full max-w-md mx-auto",
		headerBorder: "mb-6 pb-4",
		eyeIcon: "text-slate-500 hover:text-slate-600",
		forgotButton:
			"text-[11px] text-blue-600 hover:text-blue-700 font-bold transition hover:underline underline-offset-4",
	},
	monolito: {
		textHeader:
			"text-white font-black font-display text-2xl tracking-wide uppercase",
		textSub: "text-slate-500 text-xs mt-1.5 leading-relaxed font-light",
		label: "text-xs font-semibold text-slate-300 mb-1.5 block",
		input:
			"w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-sans",
		button:
			"w-full h-11 bg-blue-600 text-white hover:bg-blue-550 font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all rounded-xl mt-2 flex items-center justify-center gap-2",
		checkboxLabel:
			"ml-2.5 text-xs text-slate-500 font-medium cursor-pointer select-none",
		checkbox:
			"w-4.5 h-4.5 rounded-md border-white/10 text-blue-500 focus:ring-blue-500/10 bg-slate-900 transition-all cursor-pointer",
		error:
			"mb-5 p-3.5 text-xs bg-red-950/20 border border-red-900/30 text-red-200 rounded-2xl flex items-start gap-2.5 font-medium leading-normal animate-slide-down",
		border:
			"rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-2xl p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-[380px] mx-auto relative overflow-hidden",
		headerBorder: "mb-6 border-b border-white/5 pb-4",
		eyeIcon: "text-slate-500 hover:text-white",
		forgotButton:
			"text-[11px] text-blue-400 hover:text-blue-300 font-bold transition hover:underline underline-offset-4",
	},
	editorial: {
		textHeader:
			"text-slate-950 uppercase tracking-widest font-extralight font-display text-xl lg:text-2xl",
		textSub: "text-slate-500 text-xs mt-1.5 leading-relaxed font-light",
		label:
			"text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans block",
		input:
			"w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-955/15 rounded-none text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-slate-950 focus:bg-white font-sans",
		button:
			"w-full h-11 bg-slate-950 text-white hover:bg-slate-900 cursor-pointer font-bold uppercase tracking-wider text-xs font-sans transition-all duration-100 rounded-none mt-3 flex items-center justify-center gap-2 border border-slate-955 active:translate-y-px",
		checkboxLabel:
			"ml-2.5 text-xs text-slate-500 font-bold uppercase tracking-wider font-sans cursor-pointer select-none",
		checkbox:
			"w-4 h-4 rounded-none border-slate-350 text-slate-955 focus:ring-0 bg-transparent transition-all cursor-pointer accent-slate-950",
		error:
			"mb-5 p-3.5 text-xs bg-[#F8FAFE] border border-red-900/25 text-red-950 rounded-none flex items-start gap-3 font-medium leading-relaxed animate-slide-down",
		border: "w-full max-w-[300px] mx-auto",
		headerBorder: "mb-5 border-b border-slate-900/10 pb-3.5",
		eyeIcon: "text-slate-500 hover:text-slate-950",
		forgotButton:
			"text-xs text-slate-500 hover:text-slate-955 font-bold uppercase tracking-wider font-sans transition underline underline-offset-4",
	},
	planalto: {
		textHeader: "text-slate-900 font-bold font-sans text-xl tracking-tight",
		textSub: "text-slate-500 text-xs mt-1 leading-relaxed font-normal",
		label:
			"text-[11px] font-bold text-slate-700 mb-1.5 block uppercase tracking-wider",
		input:
			"w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/5 font-sans",
		button:
			"w-full h-10 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all duration-150 rounded-lg mt-2 flex items-center justify-center gap-2 border border-slate-900 active:scale-[0.98]",
		checkboxLabel:
			"ml-2 text-xs text-slate-650 font-medium cursor-pointer select-none",
		checkbox:
			"w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 bg-slate-50 transition-all cursor-pointer",
		error:
			"mb-4 p-3 text-xs bg-red-50 border border-red-100/80 text-red-800 rounded-lg flex items-start gap-2 font-medium leading-normal animate-slide-down",
		border: "w-full max-w-sm mx-auto",
		headerBorder: "mb-5 border-b border-slate-100 pb-3",
		eyeIcon: "text-slate-450 hover:text-slate-800",
		forgotButton:
			"text-[11px] text-slate-600 hover:text-slate-900 font-bold transition hover:underline underline-offset-4",
	},
	terminal: {
		textHeader:
			"text-emerald-400 font-mono text-base tracking-wider uppercase font-bold",
		textSub: "text-slate-500 font-mono text-[10px] mt-1 leading-normal",
		label:
			"text-[10px] font-mono text-emerald-600/80 mb-1 block uppercase tracking-widest",
		input:
			"w-full pl-10 pr-4 py-2 bg-slate-950 border border-emerald-900/40 rounded-none text-sm text-emerald-300 placeholder-emerald-800/40 outline-none font-mono transition-all duration-150 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20",
		button:
			"w-full h-10 bg-emerald-950/40 text-emerald-450 hover:bg-emerald-900/20 font-mono font-bold text-xs uppercase tracking-widest border border-emerald-500/30 active:translate-y-px transition-all duration-150 rounded-none mt-2 flex items-center justify-center gap-2",
		checkboxLabel:
			"ml-2 text-[10px] font-mono text-slate-450 cursor-pointer select-none uppercase tracking-wider",
		checkbox:
			"w-3.5 h-3.5 rounded-none border-emerald-900/60 text-emerald-500 focus:ring-0 bg-slate-950 transition-all cursor-pointer accent-emerald-500",
		error:
			"mb-4 p-3 text-xs bg-red-950/20 border border-red-900/30 text-red-400 rounded-none flex items-start gap-2 font-mono leading-normal animate-slide-down",
		border:
			"w-full max-w-sm mx-auto border border-emerald-900/20 p-6 bg-slate-950/40 backdrop-blur-md",
		headerBorder: "mb-5 border-b border-emerald-900/20 pb-3",
		eyeIcon: "text-emerald-700 hover:text-emerald-400",
		forgotButton:
			"text-[10px] text-emerald-550 hover:text-emerald-300 font-mono transition hover:underline underline-offset-4",
	},
	solidez: {
		textHeader: "text-slate-900 font-serif font-bold text-2xl tracking-tight",
		textSub: "text-slate-500 text-xs mt-1.5 leading-relaxed font-light",
		label:
			"text-[11px] font-bold text-slate-850 mb-1.5 block uppercase tracking-wider",
		input:
			"w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-md text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/10 font-sans",
		button:
			"w-full h-11 bg-[#0f1e36] text-white hover:bg-[#1a3154] font-semibold tracking-wide transition-all duration-150 rounded-md mt-2 flex items-center justify-center gap-2 border border-slate-900 shadow-sm active:scale-[0.99]",
		checkboxLabel:
			"ml-2.5 text-xs text-slate-650 font-medium cursor-pointer select-none",
		checkbox:
			"w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 bg-white transition-all cursor-pointer",
		error:
			"mb-5 p-3.5 text-xs bg-red-50 border border-red-200 text-red-850 rounded-md flex items-start gap-2.5 font-medium leading-normal animate-slide-down",
		border: "w-full max-w-md mx-auto",
		headerBorder: "mb-6 border-b border-slate-200 pb-4",
		eyeIcon: "text-slate-500 hover:text-slate-700",
		forgotButton:
			"text-[11px] text-blue-900 hover:text-blue-800 font-bold transition hover:underline underline-offset-4",
	},
	palacio: {
		textHeader:
			"text-slate-900 font-sans font-black text-2xl uppercase tracking-wider",
		textSub: "text-slate-500 text-xs mt-1 leading-relaxed font-mono",
		label:
			"text-[10px] font-bold text-slate-800 mb-1.5 block uppercase tracking-widest",
		input:
			"w-full pl-10 pr-4 py-3 bg-[#f8fafc] border-2 border-slate-900 rounded-none text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-150 focus:bg-white focus:ring-4 focus:ring-slate-900/5 font-sans",
		button:
			"w-full h-12 bg-slate-950 text-white hover:bg-slate-900 font-bold uppercase tracking-widest text-xs transition-all duration-100 rounded-none mt-2 flex items-center justify-center gap-2 border-2 border-slate-955 active:translate-y-px",
		checkboxLabel:
			"ml-2.5 text-[10px] text-slate-700 font-bold uppercase tracking-wider font-mono cursor-pointer select-none",
		checkbox:
			"w-4 h-4 rounded-none border-2 border-slate-900 text-slate-950 focus:ring-0 bg-transparent transition-all cursor-pointer accent-slate-950",
		error:
			"mb-4 p-3.5 text-xs bg-red-50 border-2 border-red-900 text-red-900 rounded-none flex items-start gap-2.5 font-bold leading-normal animate-slide-down",
		border: "w-full max-w-sm mx-auto border-2 border-slate-900 p-8 bg-white",
		headerBorder: "mb-6 border-b-2 border-slate-900 pb-4",
		eyeIcon: "text-slate-450 hover:text-slate-900",
		forgotButton:
			"text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider font-mono transition underline underline-offset-4",
	},
};

export default function LoginForm({
	onLoginSuccess,
	variant = "concreto",
}: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const style = styles[variant];

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email || !password) {
			setErrorMessage("Por favor, preencha todos os campos requeridos.");
			return;
		}

		setErrorMessage("");
		setIsLoading(true);

		try {
			const data = await loginWithJson(email, password);

			// Save token and user details to localStorage
			localStorage.setItem("biap_access_token", data.access_token);
			localStorage.setItem(
				"biap_user",
				JSON.stringify({
					id: data.id,
					email: data.email,
					papel: data.papel,
					orgao_id: data.orgao_id,
					fornecedor_id: data.fornecedor_id,
				}),
			);

			setIsLoading(false);
			onLoginSuccess(data);
		} catch (err: unknown) {
			const error = err as Error;
			setIsLoading(false);
			setErrorMessage(
				error.message || "Não foi possível conectar ao servidor BIAP.",
			);
		}
	};

	const iconColorClass =
		variant === "editorial"
			? "text-slate-500 group-focus-within:text-slate-950"
			: variant === "terminal"
				? "text-emerald-800 group-focus-within:text-emerald-500"
				: variant === "planalto"
					? "text-slate-500 group-focus-within:text-slate-700"
					: variant === "solidez"
						? "text-slate-500 group-focus-within:text-blue-900"
						: variant === "palacio"
							? "text-slate-450 group-focus-within:text-slate-900"
							: variant === "monolito"
								? "text-slate-500 group-focus-within:text-blue-400"
								: "text-slate-500 group-focus-within:text-blue-500";

	return (
		<div className={style.border}>
			{/* Border Beam element for Monolito only */}
			{variant === "monolito" && (
				<div className="absolute inset-0 border border-blue-500/10 pointer-events-none rounded-2xl">
					{/* Border beam CSS animation will outline this container */}
					<div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-conic animate-border-beam pointer-events-none opacity-40 mix-blend-screen" />
				</div>
			)}

			<div className="relative z-10">
				{/* Header */}
				<div className={style.headerBorder}>
					<span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block font-sans">
						Credenciamento Geral
					</span>
					<h3 className={style.textHeader}>Entrar no Sistema</h3>
					<p className={style.textSub}>
						Insira suas credenciais homologadas no Portal PNCP ou e-commerces.
					</p>
				</div>

				{/* Error Alert */}
				{errorMessage && (
					<div className={style.error}>
						<AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-800 dark:text-red-500 mt-0.5" />
						<span className="font-sans text-xs">{errorMessage}</span>
					</div>
				)}

				{/* Form Fields */}
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label htmlFor="email" className={style.label}>
							Identificador / E-mail corporativo
						</label>
						<div className="relative group">
							<span
								className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors ${iconColorClass}`}
							>
								<Mail className="w-4 h-4" />
							</span>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="usuario@orgao.gov.br"
								required
								className={style.input}
							/>
						</div>
					</div>

					<div>
						<div className="flex justify-between items-center mb-1.5">
							<label htmlFor="password" className={style.label}>
								Senha de acesso
							</label>
							<button type="button" className={style.forgotButton}>
								Esqueceu?
							</button>
						</div>
						<div className="relative group">
							<span
								className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors ${iconColorClass}`}
							>
								<Lock className="w-4 h-4" />
							</span>
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								className={style.input}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer ${style.eyeIcon}`}
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					{/* Remember Me Toggle */}
					<div className="flex items-center">
						<input id="remember" type="checkbox" className={style.checkbox} />
						<label htmlFor="remember" className={style.checkboxLabel}>
							Lembrar neste terminal
						</label>
					</div>

					{/* Submit button */}
					<Button type="submit" disabled={isLoading} className={style.button}>
						{isLoading ? (
							<>
								<svg
									className="animate-spin h-4 w-4 text-[#F4F7FA]"
									fill="none"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Processando"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span>Verificando...</span>
							</>
						) : (
							<>
								<span>Assinar e Entrar</span>
								<ArrowRight className="w-4 h-4" />
							</>
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
