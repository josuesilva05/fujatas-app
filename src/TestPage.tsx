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
							<div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/20 sm:p-8">
								<h2 className="text-2xl font-semibold text-white">
									Componentes de Teste
								</h2>
								<p className="mt-3 text-slate-300">
									Use este layout para verificar se o Tailwind está funcionando
									corretamente no projeto. Ele inclui botões, cartões, grades
									responsivas e um formulário estilizado.
								</p>
								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									<button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
										Botão principal
									</button>
									<button className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
										Secundário
									</button>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
									<h3 className="text-xl font-semibold text-white">
										Estatísticas
									</h3>
									<p className="mt-3 text-slate-400">
										Informações rápidas para validar o layout.
									</p>
									<div className="mt-5 grid gap-3 sm:grid-cols-2">
										<div className="rounded-2xl bg-slate-950/80 p-4 text-center">
											<p className="text-2xl font-semibold text-white">120+</p>
											<p className="text-sm text-slate-400">Usuários ativos</p>
										</div>
										<div className="rounded-2xl bg-slate-950/80 p-4 text-center">
											<p className="text-2xl font-semibold text-white">45</p>
											<p className="text-sm text-slate-400">Componentes</p>
										</div>
									</div>
								</article>

								<article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
									<h3 className="text-xl font-semibold text-white">Dicas</h3>
									<ul className="mt-4 space-y-3 text-slate-300">
										<li className="flex items-start gap-3">
											<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
											Verifique a resposta do navegador e a aplicação dos
											estilos.
										</li>
										<li className="flex items-start gap-3">
											<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
											Experimente redimensionar a janela para ver a
											responsividade.
										</li>
										<li className="flex items-start gap-3">
											<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
											Atualize o projeto para testar novos estilos.
										</li>
									</ul>
								</article>
							</div>
						</div>

						<aside className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-slate-100 shadow-xl shadow-cyan-500/10 sm:p-8">
							<h2 className="text-2xl font-semibold text-white">
								Formulário de Validação
							</h2>
							<p className="mt-3 text-slate-300">
								Preencha os campos para testar estilos de formulários e foco.
							</p>
							<form className="mt-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-300">
										Nome
									</label>
									<input
										type="text"
										placeholder="Seu nome"
										className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-300">
										Email
									</label>
									<input
										type="email"
										placeholder="email@exemplo.com"
										className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-300">
										Mensagem
									</label>
									<textarea
										rows={4}
										placeholder="Escreva algo..."
										className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
									/>
								</div>
								<button className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
									Enviar mensagem
								</button>
							</form>
						</aside>
					</div>
				</div>
			</section>
		</main>
	);
}
