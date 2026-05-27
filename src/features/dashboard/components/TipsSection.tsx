import Card from "@/components/ui/Card";

export default function TipsSection() {
	return (
		<Card variant="default">
			<h3 className="text-xl font-semibold text-white">Dicas</h3>
			<ul className="mt-4 space-y-3 text-slate-300">
				<li className="flex items-start gap-3">
					<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
					Verifique a resposta do navegador e a aplicação dos estilos.
				</li>
				<li className="flex items-start gap-3">
					<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
					Experimente redimensionar a janela para ver a responsividade.
				</li>
				<li className="flex items-start gap-3">
					<span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
					Atualize o projeto para testar novos estilos.
				</li>
			</ul>
		</Card>
	);
}
