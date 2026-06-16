const keywordMap: Record<string, { icon: string; bg: string; label: string }> =
	{
		computador: {
			icon: "🖥️",
			bg: "from-blue-50 to-blue-100",
			label: "Informática",
		},
		notebook: {
			icon: "💻",
			bg: "from-blue-50 to-indigo-100",
			label: "Informática",
		},
		chromebook: {
			icon: "💻",
			bg: "from-blue-50 to-indigo-100",
			label: "Informática",
		},
		impressora: {
			icon: "🖨️",
			bg: "from-sky-50 to-sky-100",
			label: "Periféricos",
		},
		monitor: {
			icon: "🖥️",
			bg: "from-indigo-50 to-indigo-100",
			label: "Monitor",
		},
		teclado: {
			icon: "⌨️",
			bg: "from-gray-50 to-gray-100",
			label: "Periféricos",
		},
		mouse: { icon: "🖱️", bg: "from-gray-50 to-gray-100", label: "Periféricos" },
		tablet: { icon: "📱", bg: "from-blue-50 to-cyan-100", label: "Tablet" },
		mobiliario: {
			icon: "🪑",
			bg: "from-amber-50 to-amber-100",
			label: "Mobiliário",
		},
		mesa: { icon: "🪑", bg: "from-amber-50 to-amber-100", label: "Mobiliário" },
		cadeira: {
			icon: "🪑",
			bg: "from-amber-50 to-amber-100",
			label: "Mobiliário",
		},
		armario: {
			icon: "🗄️",
			bg: "from-amber-50 to-amber-100",
			label: "Mobiliário",
		},
		veiculo: { icon: "🚗", bg: "from-green-50 to-green-100", label: "Veículo" },
		papel: {
			icon: "📄",
			bg: "from-purple-50 to-purple-100",
			label: "Papelaria",
		},
		caneta: {
			icon: "🖊️",
			bg: "from-purple-50 to-purple-100",
			label: "Papelaria",
		},
		alimento: {
			icon: "🍎",
			bg: "from-orange-50 to-orange-100",
			label: "Alimentação",
		},
		medicamento: { icon: "💊", bg: "from-red-50 to-red-100", label: "Saúde" },
		hospitalar: { icon: "🏥", bg: "from-red-50 to-red-100", label: "Saúde" },
		limpeza: { icon: "🧹", bg: "from-teal-50 to-teal-100", label: "Limpeza" },
		ferramenta: {
			icon: "🔧",
			bg: "from-stone-50 to-stone-100",
			label: "Ferramentas",
		},
		eletrico: {
			icon: "⚡",
			bg: "from-yellow-50 to-yellow-100",
			label: "Elétrica",
		},
		software: {
			icon: "💿",
			bg: "from-violet-50 to-violet-100",
			label: "Software",
		},
		construcao: {
			icon: "🧱",
			bg: "from-rose-50 to-rose-100",
			label: "Construção",
		},
		uniforme: {
			icon: "👕",
			bg: "from-emerald-50 to-emerald-100",
			label: "Vestuário",
		},
		combustivel: {
			icon: "⛽",
			bg: "from-orange-50 to-orange-100",
			label: "Combustível",
		},
	};

const defaultImage = {
	icon: "📦",
	bg: "from-slate-50 to-slate-100",
	label: "Item",
};

export function getItemImage(description: string) {
	const lower = description.toLowerCase();
	for (const [keyword, mapping] of Object.entries(keywordMap)) {
		if (lower.includes(keyword)) return mapping;
	}
	return defaultImage;
}
