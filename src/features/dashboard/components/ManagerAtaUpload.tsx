import { useEffect, useState } from "react";
import { Plus, Trash2, Check, Loader2, ArrowRight, Info } from "lucide-react";
import { createAta } from "@/services/atas";
import { listOrgans, type Organ } from "@/services/organs";
import { listSuppliers, type Supplier } from "@/services/suppliers";
import Button from "@/components/ui/Button";

interface UserSession {
	id: string;
	email: string;
	papel: string;
	orgao_id: string | null;
	fornecedor_id: string | null;
}

interface ManagerAtaUploadProps {
	user: UserSession;
}

export default function ManagerAtaUpload({ user }: ManagerAtaUploadProps) {
	// Form state
	const [numeroAta, setNumeroAta] = useState("");
	const [processoAdm, setProcessoAdm] = useState("");
	const [numeroPregao, setNumeroPregao] = useState("");
	const [dataAssinatura, setDataAssinatura] = useState("");
	const [dataPublicacao, setDataPublicacao] = useState("");
	const [vigenciaMeses, setVigenciaMeses] = useState(12);

	const [grupos, setGrupos] = useState<{
		numero_grupo: string;
		descricao: string;
		orgao_id: string;
		quantidade_planejada: number | "";
	}[]>([
		{ numero_grupo: "G-01", descricao: "", orgao_id: "", quantidade_planejada: "" }
	]);

	const [regras, setRegras] = useState<{ percentual_maximo_do_saldo: number; descricao: string }[]>([
		{ percentual_maximo_do_saldo: 50, descricao: "Limite padrão de carona" }
	]);

	const [itens, setItens] = useState<{
		numero_item: string;
		grupo_numero: string;
		fornecedor_id: string;
		descricao_especificacao: string;
		unidade_medida: string;
		marca_modelo: string;
		valor_unitario: number;
		quantidade_total_ofertada: number;
	}[]>([
		{
			numero_item: "01",
			grupo_numero: "G-01",
			fornecedor_id: "",
			descricao_especificacao: "",
			unidade_medida: "UN",
			marca_modelo: "",
			valor_unitario: 0,
			quantidade_total_ofertada: 0
		}
	]);

	// Auxiliary state
	const [organs, setOrgans] = useState<Organ[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loadingData, setLoadingData] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [successData, setSuccessData] = useState<any>(null);

	// Load organs & suppliers
	useEffect(() => {
		Promise.all([listOrgans(), listSuppliers()])
			.then(([organsList, suppliersList]) => {
				setOrgans(organsList);
				setSuppliers(suppliersList);
				setLoadingData(false);
			})
			.catch((err) => {
				console.error("Erro ao carregar dados auxiliares:", err);
				setErrorMsg("Não foi possível carregar os órgãos e fornecedores do banco de dados.");
				setLoadingData(false);
			});
	}, []);

	const userOrgan = organs.find((o) => o.id === user.orgao_id);

	// Calculated total value
	const valorTotalGlobal = itens.reduce((sum, item) => {
		const linkedGrupo = grupos.find((g) => g.numero_grupo === item.grupo_numero);
		const isQtyInherited = !!(linkedGrupo?.quantidade_planejada && Number(linkedGrupo.quantidade_planejada) > 0);
		const qty = isQtyInherited ? Number(linkedGrupo.quantidade_planejada) : Number(item.quantidade_total_ofertada || 0);
		return sum + (Number(item.valor_unitario || 0) * qty);
	}, 0);

	// Dynamically modify Groups
	const handleAddGrupo = () => {
		const nextNum = grupos.length + 1;
		const nextStr = `G-${nextNum < 10 ? "0" : ""}${nextNum}`;
		setGrupos([...grupos, { numero_grupo: nextStr, descricao: "", orgao_id: "", quantidade_planejada: "" }]);
	};

	const handleRemoveGrupo = (index: number) => {
		if (grupos.length === 1) return;
		const updated = grupos.filter((_, i) => i !== index);
		setGrupos(updated);
	};

	const handleGrupoChange = (
		index: number,
		field: "numero_grupo" | "descricao" | "orgao_id" | "quantidade_planejada",
		value: any
	) => {
		const updated = [...grupos] as any;
		if (field === "quantidade_planejada") {
			updated[index][field] = value === "" ? "" : Number(value);
		} else {
			updated[index][field] = value;
		}
		setGrupos(updated);
	};

	// Dynamically modify Carona Rules
	const handleAddRegra = () => {
		setRegras([...regras, { percentual_maximo_do_saldo: 50, descricao: "" }]);
	};

	const handleRemoveRegra = (index: number) => {
		if (regras.length === 1) return;
		const updated = regras.filter((_, i) => i !== index);
		setRegras(updated);
	};

	const handleRegraChange = (index: number, field: "percentual_maximo_do_saldo" | "descricao", value: any) => {
		const updated = [...regras];
		if (field === "percentual_maximo_do_saldo") {
			updated[index].percentual_maximo_do_saldo = Number(value);
		} else {
			updated[index].descricao = value;
		}
		setRegras(updated);
	};

	// Dynamically modify Items
	const handleAddItem = () => {
		const nextNum = itens.length + 1;
		const nextStr = `${nextNum < 10 ? "0" : ""}${nextNum}`;
		setItens([
			...itens,
			{
				numero_item: nextStr,
				grupo_numero: grupos[0]?.numero_grupo || "",
				fornecedor_id: "",
				descricao_especificacao: "",
				unidade_medida: "UN",
				marca_modelo: "",
				valor_unitario: 0,
				quantidade_total_ofertada: 0
			}
		]);
	};

	const handleRemoveItem = (index: number) => {
		if (itens.length === 1) return;
		const updated = itens.filter((_, i) => i !== index);
		setItens(updated);
	};

	const handleItemChange = (index: number, field: string, value: any) => {
		const updated = [...itens] as any;
		if (field === "valor_unitario" || field === "quantidade_total_ofertada") {
			updated[index][field] = Number(value);
		} else {
			updated[index][field] = value;
		}
		setItens(updated);
	};

	// Validation and submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");

		if (!numeroAta || !processoAdm || !numeroPregao || !dataAssinatura || !dataPublicacao) {
			setErrorMsg("Por favor, preencha todos os campos obrigatórios da autuação da ATA.");
			return;
		}

		if (!user.orgao_id) {
			setErrorMsg("O seu usuário não possui um Órgão Público associado. Não é possível cadastrar a ATA.");
			return;
		}

		// Validate items
		for (let i = 0; i < itens.length; i++) {
			const item = itens[i];
			if (!item.descricao_especificacao.trim()) {
				setErrorMsg(`O item ${item.numero_item} está com a descrição em branco.`);
				return;
			}
			if (!item.fornecedor_id) {
				setErrorMsg(`O item ${item.numero_item} exige a seleção de um fornecedor homologado.`);
				return;
			}
			const linkedGrupo = grupos.find((g) => g.numero_grupo === item.grupo_numero);
			const isQtyInherited = !!(linkedGrupo?.quantidade_planejada && Number(linkedGrupo.quantidade_planejada) > 0);
			const itemQty = isQtyInherited ? Number(linkedGrupo.quantidade_planejada) : item.quantidade_total_ofertada;

			if (item.valor_unitario <= 0 || itemQty <= 0) {
				setErrorMsg(`O item ${item.numero_item} deve possuir valor unitário e quantidade maiores que zero.`);
				return;
			}
		}

		// Format dates
		const payload = {
			numero_ata: numeroAta.trim(),
			processo_administrativo: processoAdm.trim(),
			numero_pregao: numeroPregao.trim(),
			orgao_gerenciador_id: user.orgao_id,
			data_assinatura: dataAssinatura,
			data_publicacao: dataPublicacao,
			vigencia_meses: Number(vigenciaMeses),
			valor_total_global: valorTotalGlobal,
			grupos: grupos.map((g) => ({
				numero_grupo: g.numero_grupo.trim(),
				descricao: g.descricao.trim() || undefined,
				orgao_id: g.orgao_id || undefined,
				quantidade_planejada: g.quantidade_planejada !== "" ? Number(g.quantidade_planejada) : undefined
			})),
			regras_carona: regras.map((r) => ({
				percentual_maximo_do_saldo: Number(r.percentual_maximo_do_saldo),
				descricao: r.descricao.trim() || undefined
			})),
			items: itens.map((item) => {
				const linkedGrupo = grupos.find((g) => g.numero_grupo === item.grupo_numero);
				const isQtyInherited = !!(linkedGrupo?.quantidade_planejada && Number(linkedGrupo.quantidade_planejada) > 0);
				const qty = isQtyInherited ? Number(linkedGrupo.quantidade_planejada) : Number(item.quantidade_total_ofertada);
				return {
					numero_item: item.numero_item.trim(),
					grupo_numero: item.grupo_numero ? item.grupo_numero.trim() : undefined,
					fornecedor_id: item.fornecedor_id,
					descricao_especificacao: item.descricao_especificacao.trim(),
					unidade_medida: item.unidade_medida.trim() || undefined,
					marca_modelo: item.marca_modelo.trim() || undefined,
					valor_unitario: Number(item.valor_unitario),
					quantidade_total_ofertada: qty
				};
			})
		};

		setSubmitting(true);
		try {
			const res = await createAta(payload);
			setSuccessData(res);
			setSubmitting(false);
		} catch (err: any) {
			console.error(err);
			const detail = err.response?.data?.detail || "Erro interno do servidor ao cadastrar ATA.";
			setErrorMsg(typeof detail === "string" ? detail : JSON.stringify(detail));
			setSubmitting(false);
		}
	};

	const resetForm = () => {
		setNumeroAta("");
		setProcessoAdm("");
		setNumeroPregao("");
		setDataAssinatura("");
		setDataPublicacao("");
		setVigenciaMeses(12);
		setGrupos([{ numero_grupo: "G-01", descricao: "", orgao_id: "", quantidade_planejada: "" }]);
		setRegras([{ percentual_maximo_do_saldo: 50, descricao: "Limite padrão de carona" }]);
		setItens([
			{
				numero_item: "01",
				grupo_numero: "G-01",
				fornecedor_id: "",
				descricao_especificacao: "",
				unidade_medida: "UN",
				marca_modelo: "",
				valor_unitario: 0,
				quantidade_total_ofertada: 0
			}
		]);
		setSuccessData(null);
		setErrorMsg("");
	};

	if (loadingData) {
		return (
			<div className="flex flex-col items-center justify-center py-20 font-sans space-y-3">
				<Loader2 className="w-8 h-8 animate-spin text-slate-900" />
				<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
					Sincronizando Órgãos e Fornecedores...
				</span>
			</div>
		);
	}

	if (successData) {
		return (
			<div className="max-w-2xl mx-auto py-10 px-8 border border-slate-950/15 bg-white text-center font-sans space-y-6 animate-fade-in">
				<div className="w-16 h-16 bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
					<Check className="w-8 h-8" />
				</div>
				<div className="space-y-2">
					<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
						PROTOCOLO DE AUTUAÇÃO DE ATA
					</span>
					<h3 className="text-2xl font-light font-display text-slate-950 uppercase tracking-wide">
						Ata Cadastrada com Sucesso!
					</h3>
					<p className="text-xs text-slate-500 font-light leading-relaxed max-w-md mx-auto">
						A Ata de Registro de Preços <strong>{successData.numero_ata}</strong> foi registrada no banco de dados e está ativa para o consumo de cotas.
					</p>
				</div>

				<div className="border border-slate-100 bg-[#FAF9F5] p-5 text-left text-xs max-w-md mx-auto space-y-3">
					<div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
						<span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Identificador (ID)</span>
						<span className="font-mono text-slate-900 font-semibold">{successData.id}</span>
					</div>
					<div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
						<span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Órgão Gerenciador</span>
						<span className="font-semibold text-slate-900">{userOrgan?.nome || "Órgão do Usuário"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Valor Global Autuado</span>
						<span className="font-bold text-slate-900">
							{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(successData.valor_total_global || valorTotalGlobal)}
						</span>
					</div>
				</div>

				<div className="pt-4">
					<Button
						type="button"
						onClick={resetForm}
						className="h-10 px-6 bg-slate-950 hover:bg-slate-900 text-white cursor-pointer uppercase tracking-wider text-xs font-bold font-sans rounded-none inline-flex items-center gap-2"
					>
						<span>Cadastrar Nova ATA</span>
						<Plus className="w-4 h-4" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in font-sans">
			{/* Header Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO ÓRGÃO GERENCIADOR • AUTUAÇÃO PÚBLICA
				</span>
				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Cadastro de ATA de Registro de Preços
				</h2>
			</div>

			{errorMsg && (
				<div className="p-4 border border-red-900/20 bg-red-50/50 text-red-950 text-xs flex gap-3 rounded-none items-start">
					<Info className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
					<div className="space-y-1">
						<span className="font-bold uppercase text-[9px] tracking-wider block">Erro na Autuação</span>
						<p className="font-light">{errorMsg}</p>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Seção 1: Dados Básicos e Órgão */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Coluna 1: Campos do Cabeçalho */}
					<div className="lg:col-span-8 bg-white border border-slate-955/10 p-6 space-y-6">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
							§ DADOS DE AUTUAÇÃO DA ATA
						</span>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div className="space-y-1.5">
								<label htmlFor="numeroAta" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Número da ATA *
								</label>
								<input
									id="numeroAta"
									type="text"
									value={numeroAta}
									onChange={(e) => setNumeroAta(e.target.value)}
									placeholder="Ex: ATA-001/2026"
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="processoAdm" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Processo Administrativo *
								</label>
								<input
									id="processoAdm"
									type="text"
									value={processoAdm}
									onChange={(e) => setProcessoAdm(e.target.value)}
									placeholder="Ex: PA-2025-0043"
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="numeroPregao" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Número do Pregão *
								</label>
								<input
									id="numeroPregao"
									type="text"
									value={numeroPregao}
									onChange={(e) => setNumeroPregao(e.target.value)}
									placeholder="Ex: PREGAO-002/2026"
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="vigenciaMeses" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Vigência (Meses) *
								</label>
								<input
									id="vigenciaMeses"
									type="number"
									min="1"
									max="60"
									value={vigenciaMeses}
									onChange={(e) => setVigenciaMeses(Number(e.target.value))}
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="dataAssinatura" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Data de Assinatura *
								</label>
								<input
									id="dataAssinatura"
									type="date"
									value={dataAssinatura}
									onChange={(e) => setDataAssinatura(e.target.value)}
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="dataPublicacao" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
									Data de Publicação *
								</label>
								<input
									id="dataPublicacao"
									type="date"
									value={dataPublicacao}
									onChange={(e) => setDataPublicacao(e.target.value)}
									required
									className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none"
								/>
							</div>
						</div>
					</div>

					{/* Coluna 2: Informações do Órgão Gerenciador */}
					<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-6 space-y-6">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-900/10 pb-2">
							§ ÓRGÃO GERENCIADOR RESPONSÁVEL
						</span>

						{userOrgan ? (
							<div className="space-y-4 text-xs font-sans">
								<div>
									<span className="text-slate-450 uppercase block font-bold text-[8px] tracking-wider mb-0.5">
										Nome do Ente Público:
									</span>
									<span className="font-semibold text-slate-900 block leading-tight">
										{userOrgan.nome}
									</span>
								</div>
								<div>
									<span className="text-slate-450 uppercase block font-bold text-[8px] tracking-wider mb-0.5">
										CNPJ do Órgão:
									</span>
									<span className="font-semibold text-slate-900 font-mono">
										{userOrgan.cnpj}
									</span>
								</div>
								<div>
									<span className="text-slate-450 uppercase block font-bold text-[8px] tracking-wider mb-0.5">
										Esfera / Tipo:
									</span>
									<span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border text-slate-800 bg-slate-100 border-slate-300">
										{userOrgan.tipo}
									</span>
								</div>
								<div className="p-3 bg-amber-50/50 border border-amber-900/10 text-[11px] text-amber-900 leading-relaxed font-light">
									Regra de Gestão: Por conformidade jurídica, a ATA será autuada sob a autoria exclusiva deste órgão público.
								</div>
							</div>
						) : (
							<div className="text-xs text-red-700 italic">
								Carregando dados institucionais do órgão...
							</div>
						)}
					</div>
				</div>

				{/* Seção 2: Lotes/Grupos Estruturais (Participantes) */}
				<div className="bg-white border border-slate-955/10 p-6 space-y-4">
					<div className="flex justify-between items-center border-b border-slate-100 pb-2">
						<div className="space-y-0.5">
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
								§ LOTES / GRUPOS ESTRUTURAIS (ÓRGÃOS PARTICIPANTES)
							</span>
							<p className="text-[10px] text-slate-400 font-light">
								Defina os lotes, associe os órgãos participantes principais que fazem a licitação e suas respectivas cotas planejadas.
							</p>
						</div>
						<button
							type="button"
							onClick={handleAddGrupo}
							className="text-[10px] text-slate-955 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
						>
							<Plus className="w-3.5 h-3.5" /> Adicionar Lote
						</button>
					</div>

					<div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
						{grupos.map((grupo, idx) => (
							<div key={grupo.numero_grupo || idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-dashed border-slate-100 pb-4">
								<div className="md:col-span-2 space-y-1">
									<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
										Código *
									</label>
									<input
										type="text"
										value={grupo.numero_grupo}
										onChange={(e) => handleGrupoChange(idx, "numero_grupo", e.target.value)}
										placeholder="Ex: G-01"
										required
										className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none text-center font-bold"
									/>
								</div>
								<div className="md:col-span-3 space-y-1">
									<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
										Descrição do Lote / Objeto do Grupo
									</label>
									<input
										type="text"
										value={grupo.descricao}
										onChange={(e) => handleGrupoChange(idx, "descricao", e.target.value)}
										placeholder="Ex: Equipamentos de TI e Hardwares"
										className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
									/>
								</div>
								<div className="md:col-span-4 space-y-1">
									<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
										Órgão Participante (Opcional)
									</label>
									<select
										value={grupo.orgao_id}
										onChange={(e) => handleGrupoChange(idx, "orgao_id", e.target.value)}
										className="w-full bg-white border border-slate-955/15 px-2 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
									>
										<option value="">-- Selecione o Órgão --</option>
										{organs.map((o) => (
											<option key={o.id} value={o.id}>
												{o.nome} ({o.cnpj})
											</option>
										))}
									</select>
								</div>
								<div className="md:col-span-2 space-y-1">
									<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
										Qtd Planejada (Cota)
									</label>
									<input
										type="number"
										min="1"
										value={grupo.quantidade_planejada}
										onChange={(e) => handleGrupoChange(idx, "quantidade_planejada", e.target.value)}
										placeholder="Ex: 100"
										className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none text-center font-semibold"
									/>
								</div>
								<div className="md:col-span-1 flex justify-center pb-0.5">
									{grupos.length > 1 && (
										<button
											type="button"
											onClick={() => handleRemoveGrupo(idx)}
											className="p-2 text-red-700 hover:bg-red-50 hover:text-red-800 transition cursor-pointer border border-transparent hover:border-red-100"
											title="Excluir Lote"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Seção 3: Diretrizes e Limites de Carona */}
				<div className="bg-white border border-slate-955/10 p-6 space-y-4">
					<div className="flex justify-between items-center border-b border-slate-100 pb-2">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
							§ DIRETRIZES E LIMITES DE CARONA
						</span>
						<button
							type="button"
							onClick={handleAddRegra}
							className="text-[10px] text-slate-955 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
						>
							<Plus className="w-3.5 h-3.5" /> Adicionar
						</button>
					</div>

					<div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
						{regras.map((regra, idx) => (
							<div key={idx} className="flex gap-3 items-start border-b border-dashed border-slate-100 pb-3">
								<div className="w-24 space-y-1.5 shrink-0">
									<label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
										Limite Máximo (%) *
									</label>
									<input
										type="number"
										min="0"
										max="100"
										value={regra.percentual_maximo_do_saldo}
										onChange={(e) => handleRegraChange(idx, "percentual_maximo_do_saldo", e.target.value)}
										required
										className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none text-center font-semibold"
									/>
								</div>
								<div className="flex-grow space-y-1.5">
									<label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
										Descrição Legal da Regra
									</label>
									<input
										type="text"
										value={regra.descricao}
										onChange={(e) => handleRegraChange(idx, "descricao", e.target.value)}
										placeholder="Ex: Permitido caronas externas até 50% do saldo"
										className="w-full bg-[#FAF9F5]/30 border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
									/>
								</div>
								{regras.length > 1 && (
									<button
										type="button"
										onClick={() => handleRemoveRegra(idx)}
										className="mt-6 p-2 text-red-700 hover:bg-red-50 hover:text-red-800 transition cursor-pointer"
										title="Excluir Diretriz"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Seção 3: Itens da ATA (Tabela Corporativa) */}
				<div className="bg-white border border-slate-955/10 p-6 space-y-4">
					<div className="flex justify-between items-center border-b border-slate-100 pb-2">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
							§ CADASTRAMENTO DOS ITENS DE LICITAÇÃO
						</span>
						<button
							type="button"
							onClick={handleAddItem}
							className="text-[10px] text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
						>
							<Plus className="w-3.5 h-3.5" /> Adicionar Item
						</button>
					</div>

					<div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
						{itens.map((item, idx) => (
							<div key={idx} className="border border-slate-200 bg-[#FAF9F5]/10 p-4 relative space-y-4">
								<div className="absolute top-2 right-2 flex items-center gap-2">
									<span className="text-[9px] font-sans font-bold text-slate-400 bg-slate-100 px-2 py-0.5 border">
										ITEM Nº {item.numero_item}
									</span>
									{itens.length > 1 && (
										<button
											type="button"
											onClick={() => handleRemoveItem(idx)}
											className="text-red-700 hover:bg-red-50 p-1 cursor-pointer border border-transparent hover:border-red-200"
											title="Remover este item"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									)}
								</div>

								{/* Linha 1: Lote, Fornecedor e Info Básica */}
								<div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
									<div className="md:col-span-3 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Item Código *
										</label>
										<input
											type="text"
											value={item.numero_item}
											onChange={(e) => handleItemChange(idx, "numero_item", e.target.value)}
											required
											className="w-full bg-white border border-slate-955/15 px-2 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none text-center font-semibold"
										/>
									</div>

									<div className="md:col-span-4 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Vincular ao Grupo/Lote *
										</label>
										<select
											value={item.grupo_numero}
											onChange={(e) => handleItemChange(idx, "grupo_numero", e.target.value)}
											required
											className="w-full bg-white border border-slate-955/15 px-2 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
										>
											{grupos.map((g) => (
												<option key={g.numero_grupo} value={g.numero_grupo}>
													{g.numero_grupo} {g.descricao ? `(${g.descricao})` : ""}
												</option>
											))}
										</select>
									</div>

									<div className="md:col-span-5 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Fornecedor Detentor (Homologado) *
										</label>
										<select
											value={item.fornecedor_id}
											onChange={(e) => handleItemChange(idx, "fornecedor_id", e.target.value)}
											required
											className="w-full bg-white border border-slate-955/15 px-2 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
										>
											<option value="">-- Selecione o Fornecedor --</option>
											{suppliers.map((s) => (
												<option key={s.id} value={s.id}>
													{s.razao_social} ({s.cnpj})
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Linha 2: Descrição e Especificação Técnica */}
								<div className="space-y-1">
									<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
										Descrição e Especificação Detalhada do Objeto *
									</label>
									<textarea
										rows={2}
										value={item.descricao_especificacao}
										onChange={(e) => handleItemChange(idx, "descricao_especificacao", e.target.value)}
										placeholder="Descreva o produto, modelo mínimo, requisitos técnicos legais..."
										required
										className="w-full bg-white border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none resize-none"
									/>
								</div>

								{/* Linha 3: Unidade, Marca, Qtd e Preço */}
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
									<div className="md:col-span-3 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Unidade Medida *
										</label>
										<input
											type="text"
											value={item.unidade_medida}
											onChange={(e) => handleItemChange(idx, "unidade_medida", e.target.value)}
											placeholder="Ex: UN, PCT, GL, CX"
											required
											className="w-full bg-white border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
										/>
									</div>

									<div className="md:col-span-3 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Marca e Modelo
										</label>
										<input
											type="text"
											value={item.marca_modelo}
											onChange={(e) => handleItemChange(idx, "marca_modelo", e.target.value)}
											placeholder="Ex: Lenovo ThinkPad L15"
											className="w-full bg-white border border-slate-955/15 px-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
										/>
									</div>

									<div className="md:col-span-3 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Quantidade Total *
										</label>
										{(() => {
											const linkedGrupo = grupos.find((g) => g.numero_grupo === item.grupo_numero);
											const isQtyInherited = !!(linkedGrupo?.quantidade_planejada && Number(linkedGrupo.quantidade_planejada) > 0);
											const displayedQty = isQtyInherited ? linkedGrupo.quantidade_planejada : item.quantidade_total_ofertada;

											return (
												<>
													<input
														type="number"
														min="1"
														value={displayedQty || ""}
														onChange={(e) => handleItemChange(idx, "quantidade_total_ofertada", e.target.value)}
														placeholder="Ex: 500"
														disabled={isQtyInherited}
														required
														className={`w-full border px-2.5 py-1.5 text-xs font-sans text-slate-900 outline-none transition-colors ${
															isQtyInherited
																? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
																: "bg-white border-slate-955/15 focus:border-slate-950"
														}`}
													/>
													{isQtyInherited && (
														<span className="text-[8px] text-amber-700 block font-semibold leading-tight mt-0.5">
															Herdado de {item.grupo_numero}
														</span>
													)}
												</>
											);
										})()}
									</div>

									<div className="md:col-span-3 space-y-1">
										<label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
											Valor Unitário *
										</label>
										<div className="relative">
											<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-sans">
												R$
											</span>
											<input
												type="number"
												step="0.01"
												min="0.01"
												value={item.valor_unitario || ""}
												onChange={(e) => handleItemChange(idx, "valor_unitario", e.target.value)}
												placeholder="Ex: 120,50"
												required
												className="w-full bg-white border border-slate-955/15 pl-8 pr-2.5 py-1.5 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none"
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Seção Final: Resumo Financeiro e Envio */}
				<div className="bg-[#FAF9F5] border border-slate-955/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="text-center md:text-left space-y-1">
						<span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
							VALOR TOTAL GLOBAL ESTIMADO
						</span>
						<h3 className="text-3xl font-light font-display text-slate-955 leading-none">
							{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotalGlobal)}
						</h3>
					</div>

					<div>
						<Button
							type="submit"
							disabled={submitting}
							className="h-12 px-8 bg-slate-950 hover:bg-slate-900 text-white cursor-pointer uppercase tracking-wider text-xs font-bold font-sans rounded-none inline-flex items-center gap-2.5 border border-slate-955 shadow-md transition-all active:translate-y-px disabled:opacity-50"
						>
							{submitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin text-white" />
									<span>Autuando ATA na API...</span>
								</>
							) : (
								<>
									<span>Finalizar Autuação da ATA</span>
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
