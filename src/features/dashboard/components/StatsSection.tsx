import Card from "@/components/ui/Card";

export default function StatsSection() {
	return (
		<Card variant="default">
			<h3 className="text-xl font-semibold text-white">Estatísticas</h3>
			<p className="mt-3 text-slate-500">
				Informações rápidas para validar o layout.
			</p>
			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				<div className="rounded-2xl bg-slate-950/80 p-4 text-center">
					<p className="text-2xl font-semibold text-white">120+</p>
					<p className="text-sm text-slate-500">Usuários ativos</p>
				</div>
				<div className="rounded-2xl bg-slate-950/80 p-4 text-center">
					<p className="text-2xl font-semibold text-white">45</p>
					<p className="text-sm text-slate-500">Componentes</p>
				</div>
			</div>
		</Card>
	);
}
