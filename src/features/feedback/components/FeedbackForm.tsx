import type React from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FeedbackForm() {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		alert("Mensagem enviada com sucesso!");
	};

	return (
		<Card variant="accent">
			<h2 className="text-2xl font-semibold text-white">
				Formulário de Validação
			</h2>
			<p className="mt-3 text-slate-300">
				Preencha os campos para testar estilos de formulários e foco.
			</p>
			<form onSubmit={handleSubmit} className="mt-6 space-y-4">
				<div>
					<label
						htmlFor="feedback-name"
						className="block text-sm font-medium text-slate-300"
					>
						Nome
					</label>
					<input
						id="feedback-name"
						type="text"
						placeholder="Seu nome"
						required
						className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
					/>
				</div>
				<div>
					<label
						htmlFor="feedback-email"
						className="block text-sm font-medium text-slate-300"
					>
						Email
					</label>
					<input
						id="feedback-email"
						type="email"
						placeholder="email@exemplo.com"
						required
						className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
					/>
				</div>
				<div>
					<label
						htmlFor="feedback-message"
						className="block text-sm font-medium text-slate-300"
					>
						Mensagem
					</label>
					<textarea
						id="feedback-message"
						rows={4}
						placeholder="Escreva algo..."
						required
						className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
					/>
				</div>
				<Button type="submit" variant="default" className="w-full">
					Enviar mensagem
				</Button>
			</form>
		</Card>
	);
}
