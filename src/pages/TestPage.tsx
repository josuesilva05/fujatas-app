import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { StatsSection, TipsSection } from "@/features/dashboard";
import { FeedbackForm } from "@/features/feedback";

export default function TestPage() {
	return (
		<main className="min-h-screen bg-slate-950 text-slate-100">
			<section className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
				<div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
					<div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
								Página de Teste
							</p>
							<h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
								Tailwind CSS no Vite + React
							</h1>
							<p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
								Esta página demonstra estilos responsivos e componentes simples
								usando apenas classes do Tailwind CSS.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							<span className="inline-flex items-center justify-center rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 ring-1 ring-cyan-500/30">
								Tailwind
							</span>
							<span className="inline-flex items-center justify-center rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200 ring-1 ring-violet-500/30">
								React
							</span>
							<span className="inline-flex items-center justify-center rounded-full bg-slate-700/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-100 ring-1 ring-white/10">
								Vite
							</span>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
						<div className="space-y-6">
							<Card variant="dark">
								<h2 className="text-2xl font-semibold text-white">
									Componentes de Teste
								</h2>
								<p className="mt-3 text-slate-300">
									Use este layout para verificar se o Tailwind está funcionando
									corretamente no projeto. Ele inclui botões, cartões, grades
									responsivas e um formulário estilizado.
								</p>
								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									<Button variant="primary">Botão principal</Button>
									<Button variant="secondary">Secundário</Button>
								</div>
							</Card>

							<div className="grid gap-4 sm:grid-cols-2">
								<StatsSection />
								<TipsSection />
							</div>
						</div>

						<FeedbackForm />
					</div>
				</div>
			</section>
		</main>
	);
}
