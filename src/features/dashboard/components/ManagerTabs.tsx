import { Link, useParams } from "react-router-dom";

interface TabItem {
	key: string;
	path: string;
	label: string;
}

const TABS: TabItem[] = [
	{ key: "autorizacoes", path: "autorizacoes", label: "Autorizações" },
	{ key: "cadastro", path: "cadastro", label: "Upload ATA" },
	{ key: "monitoramento", path: "monitoramento", label: "Monitoramento" },
	{ key: "cadastros", path: "cadastros", label: "Cadastros" },
];

export default function ManagerTabs({ activeTab }: { activeTab: string }) {
	const { role: rolePath } = useParams();
	const role = rolePath ?? "gerenciador";

	return (
		<div className="flex border-b border-slate-955/10">
			{TABS.map((tab) => {
				const isActive = tab.key === activeTab;
				return (
					<Link
						key={tab.key}
						to={`/${role}/${tab.path}`}
						className={`relative px-5 py-2.5 text-[10px] font-bold font-sans uppercase tracking-wider transition select-none ${
							isActive
								? "bg-white text-slate-950 border border-b-0 border-slate-955/10 -mb-px z-10"
								: "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 border border-transparent border-b-0"
						}`}
					>
						{tab.label}
					</Link>
				);
			})}
		</div>
	);
}
