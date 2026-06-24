import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Calendar as CalendarIcon,
	Check,
	ClipboardList,
	Eye,
	ImagePlus,
	Info,
	Loader2,
	Package,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { createAta, uploadItemImage } from "@/services/atas";
import { listOrgans } from "@/services/organs";
import { listSuppliers } from "@/services/suppliers";
import type { Organ } from "@/types/organ";
import type { Supplier } from "@/types/supplier";
import ManagerTabs from "./ManagerTabs";

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

/* ── Tipos internos do formulário ───────────────────────── */

interface Participante {
	orgao_id: string;
	quantidade_planejada: number | "";
}

interface ItemForm {
	numero_item: string;
	grupo_numero: string;
	fornecedor_id: string;
	descricao_especificacao: string;
	unidade_medida: string;
	marca_modelo: string;
	url_imagem: string;
	valor_unitario: number;
	quantidade_manual: number | "";
	participantes: Participante[];
}

interface GrupoForm {
	numero_grupo: string;
	descricao: string;
}

interface RegraForm {
	percentual_maximo_do_saldo: number;
	descricao: string;
}

/* ── Constantes dos steps ───────────────────────────────── */

const STEPS = [
	{ num: 1, title: "Dados da ATA", icon: ClipboardList },
	{ num: 2, title: "Grupos / Lotes", icon: Package },
	{ num: 3, title: "Itens & Participantes", icon: Building2 },
	{ num: 4, title: "Revisão & Envio", icon: Eye },
];

/* ── Formatação ─────────────────────────────────────────── */

const fmtBRL = (v: number) =>
	new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
		v,
	);

const formatDate = (dateString: string) => {
	if (!dateString) return "";
	const [year, month, day] = dateString.split("-");
	return `${day}/${month}/${year}`;
};

/* ── Componente Principal ───────────────────────────────── */

export default function ManagerAtaUpload({ user }: ManagerAtaUploadProps) {
	const [currentStep, setCurrentStep] = useState(1);

	// Step 1 — Dados da ATA
	const [numeroAta, setNumeroAta] = useState("");
	const [processoAdm, setProcessoAdm] = useState("");
	const [numeroPregao, setNumeroPregao] = useState("");
	const [dataAssinatura, setDataAssinatura] = useState("");
	const [dataPublicacao, setDataPublicacao] = useState("");
	const [vigenciaMeses, setVigenciaMeses] = useState(12);

	// Step 2 — Grupos
	const [grupos, setGrupos] = useState<GrupoForm[]>([
		{ numero_grupo: "G-01", descricao: "" },
	]);

	// Step 3 — Itens
	const [itens, setItens] = useState<ItemForm[]>([
		{
			numero_item: "01",
			grupo_numero: "G-01",
			fornecedor_id: "",
			descricao_especificacao: "",
			unidade_medida: "UN",
			marca_modelo: "",
			url_imagem: "",
			valor_unitario: 0,
			quantidade_manual: "",
			participantes: [],
		},
	]);

	// Controle de qual item está fazendo upload de imagem (por índice)
	const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);
	const [uploadImageError, setUploadImageError] = useState<string>("");

	// Step 4 — Regras de Carona
	const [regras, setRegras] = useState<RegraForm[]>([
		{ percentual_maximo_do_saldo: 50, descricao: "Limite padrão de carona" },
	]);

	// Auxiliares
	const [organs, setOrgans] = useState<Organ[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loadingData, setLoadingData] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [successData, setSuccessData] = useState<{
		id: string;
		numero_ata: string;
		valor_total_global?: number;
	} | null>(null);

	useEffect(() => {
		Promise.all([listOrgans(), listSuppliers()])
			.then(([organsList, suppliersList]) => {
				setOrgans(organsList);
				setSuppliers(suppliersList);
				setLoadingData(false);
			})
			.catch((err) => {
				console.error("Erro ao carregar dados auxiliares:", err);
				setErrorMsg(
					"Não foi possível carregar os órgãos e fornecedores do banco de dados.",
				);
				setLoadingData(false);
			});
	}, []);

	const userOrgan = organs.find((o) => o.id === user.orgao_id);

	/* ── Helpers de cálculo ──────────────────────────────── */

	const getItemQty = useCallback((item: ItemForm): number => {
		if (item.participantes.length > 0) {
			return item.participantes.reduce(
				(s, p) => s + (Number(p.quantidade_planejada) || 0),
				0,
			);
		}
		return Number(item.quantidade_manual) || 0;
	}, []);

	const valorTotalGlobal = useMemo(
		() =>
			itens.reduce((sum, item) => {
				return sum + Number(item.valor_unitario || 0) * getItemQty(item);
			}, 0),
		[itens, getItemQty],
	);

	/* ── Handlers de Grupo ───────────────────────────────── */

	const handleAddGrupo = () => {
		const n = grupos.length + 1;
		setGrupos([
			...grupos,
			{ numero_grupo: `G-${n < 10 ? "0" : ""}${n}`, descricao: "" },
		]);
	};

	const handleRemoveGrupo = (idx: number) => {
		if (grupos.length === 1) return;
		setGrupos(grupos.filter((_, i) => i !== idx));
	};

	const handleGrupoChange = (
		idx: number,
		field: keyof GrupoForm,
		value: string,
	) => {
		const u = [...grupos];
		u[idx] = { ...u[idx], [field]: value };
		setGrupos(u);

		const errKey = `grupo_${idx}_${field}`;
		if (fieldErrors[errKey]) {
			setFieldErrors((p) => ({ ...p, [errKey]: "" }));
		}
	};

	/* ── Handlers de Item ────────────────────────────────── */

	const handleAddItem = () => {
		const n = itens.length + 1;
		setItens([
			...itens,
			{
				numero_item: `${n < 10 ? "0" : ""}${n}`,
				grupo_numero: grupos[0]?.numero_grupo || "",
				fornecedor_id: "",
				descricao_especificacao: "",
				unidade_medida: "UN",
				marca_modelo: "",
				url_imagem: "",
				valor_unitario: 0,
				quantidade_manual: "",
				participantes: [],
			},
		]);
	};

	const handleRemoveItem = (idx: number) => {
		if (itens.length === 1) return;
		setItens(itens.filter((_, i) => i !== idx));
	};

	const handleItemChange = (
		idx: number,
		field: string,
		value: string | number,
	) => {
		const u = [...itens] as ItemForm[];
		const item = u[idx] as unknown as Record<string, string | number | "">;
		if (field === "valor_unitario" || field === "quantidade_manual") {
			item[field] = value === "" ? "" : Number(value);
		} else {
			item[field] = value;
		}
		setItens(u);

		const errKey = `item_${idx}_${field}`;
		if (fieldErrors[errKey]) {
			setFieldErrors((p) => ({ ...p, [errKey]: "" }));
		}
		if (field === "quantidade_manual" && fieldErrors[`item_${idx}_quantidade`]) {
			setFieldErrors((p) => ({ ...p, [`item_${idx}_quantidade`]: "" }));
		}
	};

	/* ── Handlers de Participante (sub-tabela dentro do item) */

	const handleAddParticipante = (itemIdx: number) => {
		const u = [...itens];
		u[itemIdx] = {
			...u[itemIdx],
			participantes: [
				...u[itemIdx].participantes,
				{ orgao_id: "", quantidade_planejada: "" },
			],
		};
		setItens(u);
	};

	const handleRemoveParticipante = (itemIdx: number, partIdx: number) => {
		const u = [...itens];
		u[itemIdx] = {
			...u[itemIdx],
			participantes: u[itemIdx].participantes.filter((_, i) => i !== partIdx),
		};
		setItens(u);
	};

	const handleParticipanteChange = (
		itemIdx: number,
		partIdx: number,
		field: keyof Participante,
		value: string | number | "",
	) => {
		const u = [...itens];
		const parts = [...u[itemIdx].participantes];
		parts[partIdx] = {
			...parts[partIdx],
			[field]:
				field === "quantidade_planejada"
					? value === ""
						? ""
						: Number(value)
					: value,
		} as unknown as Participante;
		u[itemIdx] = { ...u[itemIdx], participantes: parts };
		setItens(u);

		if (fieldErrors[`item_${itemIdx}_quantidade`]) {
			setFieldErrors((p) => ({ ...p, [`item_${itemIdx}_quantidade`]: "" }));
		}
	};

	/* ── Handlers de Regras ──────────────────────────────── */

	const handleAddRegra = () => {
		setRegras([...regras, { percentual_maximo_do_saldo: 50, descricao: "" }]);
	};

	const handleRemoveRegra = (idx: number) => {
		if (regras.length === 1) return;
		setRegras(regras.filter((_, i) => i !== idx));
	};

	const handleRegraChange = (
		idx: number,
		field: keyof RegraForm,
		value: string | number,
	) => {
		const u = [...regras];
		u[idx] = {
			...u[idx],
			[field]: field === "percentual_maximo_do_saldo" ? Number(value) : value,
		} as unknown as RegraForm;
		setRegras(u);
	};

	/* ── Handler de Upload de Imagem ────────────────────── */

	const handleImageUpload = async (idx: number, file: File) => {
		setUploadImageError("");
		setUploadingImageIdx(idx);
		try {
			const url = await uploadItemImage(file);
			const u = [...itens];
			u[idx] = { ...u[idx], url_imagem: url };
			setItens(u);
		} catch (err: unknown) {
			const axiosErr = err as { response?: { data?: { detail?: string } } };
			const detail = axiosErr.response?.data?.detail || "Erro ao fazer upload da imagem.";
			setUploadImageError(typeof detail === "string" ? detail : JSON.stringify(detail));
		} finally {
			setUploadingImageIdx(null);
		}
	};

	/* ── Navegação de Steps com Validação ───────────────── */

	const validateStep = (step: number): boolean => {
		setErrorMsg("");
		if (step === 1) {
			const newFieldErrors: Record<string, string> = {};
			if (!numeroAta.trim()) newFieldErrors.numeroAta = "Campo obrigatório";

			if (Object.keys(newFieldErrors).length > 0) {
				setFieldErrors(newFieldErrors);
				setErrorMsg("Preencha todos os campos obrigatórios marcados na Etapa 1: Dados da ATA.");
				return false;
			}
			setFieldErrors({});
			return true;
		}

		if (step === 2) {
			const newFieldErrors: Record<string, string> = {};
			if (grupos.length === 0) {
				setErrorMsg("Adicione pelo menos um Lote/Grupo na Etapa 2.");
				return false;
			}
			for (let i = 0; i < grupos.length; i++) {
				if (!grupos[i].numero_grupo.trim()) {
					newFieldErrors[`grupo_${i}_numero_grupo`] = "Código do Lote é obrigatório";
				}
			}
			if (Object.keys(newFieldErrors).length > 0) {
				setFieldErrors(newFieldErrors);
				setErrorMsg("Preencha todos os códigos de lote em destaque na Etapa 2.");
				return false;
			}
			setFieldErrors({});
			return true;
		}

		if (step === 3) {
			const newFieldErrors: Record<string, string> = {};
			if (itens.length === 0) {
				setErrorMsg("Adicione pelo menos um Item na Etapa 3.");
				return false;
			}
			for (let i = 0; i < itens.length; i++) {
				const item = itens[i];
				if (!item.fornecedor_id) {
					newFieldErrors[`item_${i}_fornecedor_id`] = "Selecione o fornecedor";
				}
				if (!item.descricao_especificacao.trim()) {
					newFieldErrors[`item_${i}_descricao_especificacao`] = "A descrição é obrigatória";
				}
				if (item.valor_unitario <= 0) {
					newFieldErrors[`item_${i}_valor_unitario`] = "Deve ser maior que 0";
				}
				const qty = getItemQty(item);
				if (qty <= 0) {
					newFieldErrors[`item_${i}_quantidade`] = "Quantidade deve ser maior que 0";
				}
			}
			if (Object.keys(newFieldErrors).length > 0) {
				setFieldErrors(newFieldErrors);
				setErrorMsg("Preencha todos os campos obrigatórios em destaque nos itens na Etapa 3.");
				return false;
			}
			setFieldErrors({});
			return true;
		}

		return true;
	};

	const goNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((s) => Math.min(s + 1, 4));
			setErrorMsg("");
		}
	};

	const goPrev = () => {
		setCurrentStep((s) => Math.max(s - 1, 1));
		setErrorMsg("");
	};

	const handleStepClick = (targetStep: number) => {
		if (targetStep < currentStep) {
			setCurrentStep(targetStep);
			setErrorMsg("");
			return;
		}
		// Validar steps intermediários
		for (let s = currentStep; s < targetStep; s++) {
			if (!validateStep(s)) {
				setCurrentStep(s);
				return;
			}
		}
		setCurrentStep(targetStep);
		setErrorMsg("");
	};

	/* ── Submit ──────────────────────────────────────────── */

	const handleSubmit = async () => {
		setErrorMsg("");

		// Validar sequencialmente todas as etapas antes do envio
		for (let s = 1; s <= 3; s++) {
			if (!validateStep(s)) {
				setCurrentStep(s);
				return;
			}
		}

		if (!user.orgao_id) {
			setErrorMsg(
				"O seu usuário não possui um Órgão Público associado. Não é possível cadastrar a ATA.",
			);
			return;
		}

		const payload = {
			numero_ata: numeroAta.trim(),
			processo_administrativo: processoAdm.trim() || undefined,
			numero_pregao: numeroPregao.trim() || undefined,
			orgao_gerenciador_id: user.orgao_id,
			data_assinatura: dataAssinatura || undefined,
			data_publicacao: dataPublicacao || undefined,
			vigencia_meses: Number(vigenciaMeses),
			valor_total_global: valorTotalGlobal,
			grupos: grupos.map((g) => ({
				numero_grupo: g.numero_grupo.trim(),
				descricao: g.descricao.trim() || undefined,
			})),
			regras_carona: regras.map((r) => ({
				percentual_maximo_do_saldo: Number(r.percentual_maximo_do_saldo),
				descricao: r.descricao.trim() || undefined,
			})),
			items: itens.map((item) => {
				const qty = getItemQty(item);
				const hasParticipantes =
					item.participantes.length > 0 &&
					item.participantes.some(
						(p) => p.orgao_id && Number(p.quantidade_planejada) > 0,
					);
				return {
					numero_item: item.numero_item.trim(),
					grupo_numero: item.grupo_numero
						? item.grupo_numero.trim()
						: undefined,
					fornecedor_id: item.fornecedor_id,
					descricao_especificacao: item.descricao_especificacao.trim(),
					unidade_medida: item.unidade_medida.trim() || undefined,
					marca_modelo: item.marca_modelo.trim() || undefined,
					url_imagem: item.url_imagem.trim() || undefined,
					valor_unitario: Number(item.valor_unitario),
					quantidade_total_ofertada: hasParticipantes ? undefined : qty,
					participantes: hasParticipantes
						? item.participantes
								.filter((p) => p.orgao_id && Number(p.quantidade_planejada) > 0)
								.map((p) => ({
									orgao_id: p.orgao_id,
									quantidade_planejada: Number(p.quantidade_planejada),
								}))
						: [],
				};
			}),
		};

		setSubmitting(true);
		try {
			const res = await createAta(payload);
			setSuccessData(res);
			setSubmitting(false);
		} catch (err: unknown) {
			console.error(err);
			const axiosErr = err as {
				response?: { data?: { detail?: string } };
			};
			const detail =
				axiosErr.response?.data?.detail ||
				"Erro interno do servidor ao cadastrar ATA.";
			setErrorMsg(typeof detail === "string" ? detail : JSON.stringify(detail));
			setSubmitting(false);
		}
	};

	const resetForm = () => {
		setCurrentStep(1);
		setNumeroAta("");
		setProcessoAdm("");
		setNumeroPregao("");
		setDataAssinatura("");
		setDataPublicacao("");
		setVigenciaMeses(12);
		setFieldErrors({});
		setGrupos([{ numero_grupo: "G-01", descricao: "" }]);
		setItens([
			{
				numero_item: "01",
				grupo_numero: "G-01",
				fornecedor_id: "",
				descricao_especificacao: "",
				unidade_medida: "UN",
				marca_modelo: "",
				url_imagem: "",
				valor_unitario: 0,
				quantidade_manual: "",
				participantes: [],
			},
		]);
		setRegras([
			{ percentual_maximo_do_saldo: 50, descricao: "Limite padrão de carona" },
		]);
		setSuccessData(null);
		setErrorMsg("");
	};

	/* ─────────────────────────────────────────────────────── */
	/*  RENDER                                                 */
	/* ─────────────────────────────────────────────────────── */

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
					<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
						PROTOCOLO DE AUTUAÇÃO DE ATA
					</span>
					<h3 className="text-2xl font-light font-display text-slate-950 uppercase tracking-wide">
						Ata Cadastrada com Sucesso!
					</h3>
					<p className="text-xs text-slate-500 font-light leading-relaxed max-w-md mx-auto">
						A Ata de Registro de Preços{" "}
						<strong>{successData.numero_ata}</strong> foi registrada no banco de
						dados e está ativa para o consumo de cotas.
					</p>
				</div>

				<div className="border border-slate-100 bg-[#F8FAFE] p-5 text-left text-xs max-w-md mx-auto space-y-3">
					<div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
						<span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">
							Identificador (ID)
						</span>
						<span className="font-mono text-slate-900 font-semibold">
							{successData.id}
						</span>
					</div>
					<div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
						<span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">
							Órgão Gerenciador
						</span>
						<span className="font-semibold text-slate-900">
							{userOrgan?.nome || "Órgão do Usuário"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">
							Valor Global Autuado
						</span>
						<span className="font-bold text-slate-900">
							{fmtBRL(successData.valor_total_global || valorTotalGlobal)}
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

	/* ── Input class helper ──────────────────────────────── */
	const inputCls =
		"w-full bg-[#F8FAFE]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 focus:bg-white outline-none transition-colors";
	const inputErrCls = (field: string) =>
		fieldErrors[field]
			? "w-full bg-red-50 border border-red-500 px-3 py-2 text-xs font-sans text-slate-900 focus:border-red-700 focus:bg-red-50/50 outline-none transition-colors"
			: inputCls;
	const selectCls =
		"w-full bg-white border border-slate-955/15 px-2 py-2 text-xs font-sans text-slate-900 focus:border-slate-950 outline-none transition-colors";
	const selectErrCls = (field: string) =>
		fieldErrors[field]
			? "w-full bg-red-50 border border-red-500 px-2 py-2 text-xs font-sans text-slate-900 focus:border-red-700 focus:bg-red-50/50 outline-none transition-colors"
			: selectCls;
	const textareaErrCls = (field: string) =>
		fieldErrors[field]
			? "w-full bg-red-50 border border-red-500 px-3 py-2 text-xs font-sans text-slate-900 focus:border-red-700 focus:bg-red-50/50 outline-none transition-colors resize-none"
			: `${inputCls} resize-none`;
	const labelCls =
		"text-[9px] font-bold text-slate-500 uppercase tracking-wider block";

	/* ── Step Indicator ──────────────────────────────────── */
	const renderStepIndicator = () => (
		<div className="flex items-center justify-between mb-8 px-2">
			{STEPS.map((step, i) => {
				const Icon = step.icon;
				const isActive = currentStep === step.num;
				const isDone = currentStep > step.num;
				return (
					<div
						key={step.num}
						className="flex items-center flex-1 last:flex-none"
					>
						<button
							type="button"
							onClick={() => handleStepClick(step.num)}
							className={`flex items-center gap-2 group cursor-pointer transition-all ${
								isActive
									? "opacity-100"
									: isDone
										? "opacity-70 hover:opacity-100"
										: "opacity-35 hover:opacity-60"
							}`}
						>
							<div
								className={`w-9 h-9 flex items-center justify-center border-2 shrink-0 transition-all ${
									isActive
										? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
										: isDone
											? "bg-slate-800 border-slate-800 text-white"
											: "bg-white border-slate-300 text-slate-500"
								}`}
							>
								{isDone ? (
									<Check className="w-4 h-4" />
								) : (
									<Icon className="w-4 h-4" />
								)}
							</div>
							<div className="hidden sm:block text-left">
								<span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
									Etapa {step.num}
								</span>
								<span
									className={`text-[11px] font-semibold block ${
										isActive ? "text-slate-950" : "text-slate-500"
									}`}
								>
									{step.title}
								</span>
							</div>
						</button>
						{i < STEPS.length - 1 && (
							<div className="flex-1 mx-3">
								<div
									className={`h-[2px] transition-colors ${
										currentStep > step.num ? "bg-slate-800" : "bg-slate-200"
									}`}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);

	/* ── Step 1: Dados da ATA ────────────────────────────── */
	const renderStep1 = () => (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
			{/* Campos */}
			<div className="lg:col-span-8 bg-white border border-slate-955/10 p-6 space-y-6">
				<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">
					§ DADOS DE AUTUAÇÃO DA ATA
				</span>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					<div className="space-y-1.5">
						<label htmlFor="numeroAta" className={labelCls}>
							Número da ATA *
						</label>
						<input
							id="numeroAta"
							type="text"
							value={numeroAta}
							onChange={(e) => { setNumeroAta(e.target.value); if (fieldErrors.numeroAta) setFieldErrors((p) => ({ ...p, numeroAta: "" })); }}
							placeholder="Ex: ATA-001/2026"
							className={inputErrCls("numeroAta")}
						/>
						{fieldErrors.numeroAta && <p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">{fieldErrors.numeroAta}</p>}
					</div>

					<div className="space-y-1.5">
						<label htmlFor="processoAdm" className={labelCls}>
							Processo Administrativo (Opcional)
						</label>
						<input
							id="processoAdm"
							type="text"
							value={processoAdm}
							onChange={(e) => setProcessoAdm(e.target.value)}
							placeholder="Ex: PA-2025-0043"
							className={inputCls}
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="numeroPregao" className={labelCls}>
							Número do Pregão (Opcional)
						</label>
						<input
							id="numeroPregao"
							type="text"
							value={numeroPregao}
							onChange={(e) => setNumeroPregao(e.target.value)}
							placeholder="Ex: PREGAO-002/2026"
							className={inputCls}
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="vigenciaMeses" className={labelCls}>
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
							className={inputCls}
						/>
					</div>

					<div className="space-y-1.5">
						<label className={labelCls}>
							Data de Assinatura (Opcional)
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									className={`w-full flex items-center justify-between bg-[#F8FAFE]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 outline-none text-left cursor-pointer transition-colors hover:bg-white focus:border-slate-950 ${
										!dataAssinatura ? "text-slate-400" : ""
									}`}
								>
									<span>{dataAssinatura ? formatDate(dataAssinatura) : "Selecione uma data"}</span>
									<CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 bg-white" align="start">
								<Calendar
									mode="single"
									locale={ptBR}
									selected={dataAssinatura ? new Date(dataAssinatura + "T12:00:00") : undefined}
									onSelect={(date) => {
										if (date) {
											const y = date.getFullYear();
											const m = String(date.getMonth() + 1).padStart(2, "0");
											const d = String(date.getDate()).padStart(2, "0");
											setDataAssinatura(`${y}-${m}-${d}`);
										} else {
											setDataAssinatura("");
										}
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-1.5">
						<label className={labelCls}>
							Data de Publicação (Opcional)
						</label>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									className={`w-full flex items-center justify-between bg-[#F8FAFE]/30 border border-slate-955/15 px-3 py-2 text-xs font-sans text-slate-900 outline-none text-left cursor-pointer transition-colors hover:bg-white focus:border-slate-950 ${
										!dataPublicacao ? "text-slate-400" : ""
									}`}
								>
									<span>{dataPublicacao ? formatDate(dataPublicacao) : "Selecione uma data"}</span>
									<CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 bg-white" align="start">
								<Calendar
									mode="single"
									locale={ptBR}
									selected={dataPublicacao ? new Date(dataPublicacao + "T12:00:00") : undefined}
									onSelect={(date) => {
										if (date) {
											const y = date.getFullYear();
											const m = String(date.getMonth() + 1).padStart(2, "0");
											const d = String(date.getDate()).padStart(2, "0");
											setDataPublicacao(`${y}-${m}-${d}`);
										} else {
											setDataPublicacao("");
										}
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>

			{/* Card do Órgão */}
			<div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-6 space-y-6">
				<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-900/10 pb-2">
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
							Regra de Gestão: Por conformidade jurídica, a ATA será autuada sob
							a autoria exclusiva deste órgão público.
						</div>
					</div>
				) : (
					<div className="text-xs text-red-700 italic">
						Carregando dados institucionais do órgão...
					</div>
				)}
			</div>
		</div>
	);

	/* ── Step 2: Grupos/Lotes ────────────────────────────── */
	const renderStep2 = () => (
		<div className="bg-white border border-slate-955/10 p-6 space-y-4 animate-fade-in">
			<div className="flex justify-between items-center border-b border-slate-100 pb-2">
				<div className="space-y-0.5">
					<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
						§ LOTES / GRUPOS ESTRUTURAIS
					</span>
					<p className="text-[10px] text-slate-500 font-light">
						Defina os lotes ou grupos para organizar os itens da licitação. Os
						órgãos participantes serão vinculados diretamente aos itens na
						próxima etapa.
					</p>
				</div>
				<button
					type="button"
					onClick={handleAddGrupo}
					className="text-[10px] text-slate-955 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline shrink-0"
				>
					<Plus className="w-3.5 h-3.5" /> Adicionar Lote
				</button>
			</div>

			<div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
				{grupos.map((grupo, idx) => (
					<div
						key={idx}
						className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-dashed border-slate-100 pb-4"
					>
						<div className="md:col-span-3 space-y-1">
							<label className={labelCls}>Código do Lote *</label>
							<input
								type="text"
								value={grupo.numero_grupo}
								onChange={(e) =>
									handleGrupoChange(idx, "numero_grupo", e.target.value)
								}
								placeholder="Ex: G-01"
								required
								className={`${inputErrCls(`grupo_${idx}_numero_grupo`)} text-center font-bold`}
							/>
							{fieldErrors[`grupo_${idx}_numero_grupo`] && (
								<p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">
									{fieldErrors[`grupo_${idx}_numero_grupo`]}
								</p>
							)}
						</div>
						<div className="md:col-span-8 space-y-1">
							<label className={labelCls}>
								Descrição do Lote / Objeto do Grupo (Opcional)
							</label>
							<input
								type="text"
								value={grupo.descricao}
								onChange={(e) =>
									handleGrupoChange(idx, "descricao", e.target.value)
								}
								placeholder="Ex: Equipamentos de TI e Hardwares"
								className={inputCls}
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
	);

	/* ── Step 3: Itens + Participantes ───────────────────── */
	const renderStep3 = () => (
		<div className="bg-white border border-slate-955/10 p-6 space-y-4 animate-fade-in">
			<div className="flex justify-between items-center border-b border-slate-100 pb-2">
				<div className="space-y-0.5">
					<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
						§ CADASTRAMENTO DOS ITENS DE LICITAÇÃO
					</span>
					<p className="text-[10px] text-slate-500 font-light">
						Para cada item, vincule os órgãos participantes e suas quantidades.
						A quantidade total será calculada automaticamente.
					</p>
				</div>
				<button
					type="button"
					onClick={handleAddItem}
					className="text-[10px] text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline shrink-0"
				>
					<Plus className="w-3.5 h-3.5" /> Adicionar Item
				</button>
			</div>

			<div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
				{itens.map((item, idx) => {
					const itemQty = getItemQty(item);
					const hasParticipantes = item.participantes.length > 0;
					const itemTotal = Number(item.valor_unitario || 0) * itemQty;

					return (
						<div
							key={idx}
							className="border border-slate-200 bg-[#F8FAFE]/10 p-5 relative space-y-4"
						>
							{/* Header do Item */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-[9px] font-sans font-bold text-slate-500 bg-slate-100 px-2.5 py-1 border">
										ITEM Nº {item.numero_item}
									</span>
									{itemQty > 0 && (
										<span className="text-[9px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
											{itemQty} un × {fmtBRL(Number(item.valor_unitario || 0))}{" "}
											= {fmtBRL(itemTotal)}
										</span>
									)}
								</div>
								{itens.length > 1 && (
									<button
										type="button"
										onClick={() => handleRemoveItem(idx)}
										className="text-red-700 hover:bg-red-50 p-1.5 cursor-pointer border border-transparent hover:border-red-200 transition"
										title="Remover este item"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								)}
							</div>

							{/* Linha 1: Código, Grupo, Fornecedor */}
							<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
								<div className="md:col-span-2 space-y-1">
									<label className={labelCls}>Item Código (Opcional)</label>
									<input
										type="text"
										value={item.numero_item}
										onChange={(e) =>
											handleItemChange(idx, "numero_item", e.target.value)
										}
										className={`${inputCls} text-center font-semibold`}
									/>
								</div>
								<div className="md:col-span-4 space-y-1">
									<label className={labelCls}>Vincular ao Grupo/Lote *</label>
									<select
										value={item.grupo_numero}
										onChange={(e) =>
											handleItemChange(idx, "grupo_numero", e.target.value)
										}
										required
										className={selectCls}
									>
										{grupos.map((g) => (
											<option key={g.numero_grupo} value={g.numero_grupo}>
												{g.numero_grupo} {g.descricao ? `(${g.descricao})` : ""}
											</option>
										))}
									</select>
								</div>
								<div className="md:col-span-6 space-y-1">
									<label className={labelCls}>
										Fornecedor Detentor (Homologado) *
									</label>
									<select
										value={item.fornecedor_id}
										onChange={(e) =>
											handleItemChange(idx, "fornecedor_id", e.target.value)
										}
										required
										className={selectErrCls(`item_${idx}_fornecedor_id`)}
									>
										<option value="">-- Selecione o Fornecedor --</option>
										{suppliers.map((s) => (
											<option key={s.id} value={s.id}>
												{s.razao_social} ({s.cnpj})
											</option>
										))}
									</select>
									{fieldErrors[`item_${idx}_fornecedor_id`] && (
										<p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">
											{fieldErrors[`item_${idx}_fornecedor_id`]}
										</p>
									)}
								</div>
							</div>

							{/* Linha 2: Descrição */}
							<div className="space-y-1">
								<label className={labelCls}>
									Descrição e Especificação Detalhada do Objeto *
								</label>
								<textarea
									rows={2}
									value={item.descricao_especificacao}
									onChange={(e) =>
										handleItemChange(
											idx,
											"descricao_especificacao",
											e.target.value,
										)
									}
									placeholder="Descreva o produto, modelo mínimo, requisitos técnicos legais..."
									required
									className={textareaErrCls(`item_${idx}_descricao_especificacao`)}
								/>
								{fieldErrors[`item_${idx}_descricao_especificacao`] && (
									<p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">
										{fieldErrors[`item_${idx}_descricao_especificacao`]}
									</p>
								)}
							</div>

							{/* Linha 3: Unidade, Marca, Valor */}
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
								<div className="md:col-span-3 space-y-1">
									<label className={labelCls}>Unidade Medida (Opcional)</label>
									<input
										type="text"
										value={item.unidade_medida}
										onChange={(e) =>
											handleItemChange(idx, "unidade_medida", e.target.value)
										}
										placeholder="Ex: UN, PCT, GL, CX"
										className={inputCls}
									/>
								</div>
								<div className="md:col-span-4 space-y-1">
									<label className={labelCls}>Marca e Modelo (Opcional)</label>
									<input
										type="text"
										value={item.marca_modelo}
										onChange={(e) =>
											handleItemChange(idx, "marca_modelo", e.target.value)
										}
										placeholder="Ex: Lenovo ThinkPad L15"
										className={inputCls}
									/>
								</div>
								<div className="md:col-span-3 space-y-1">
									<label className={labelCls}>Valor Unitário *</label>
									<div className="relative">
										<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 font-sans">
											R$
										</span>
										<input
											type="number"
											step="0.01"
											min="0.01"
											value={item.valor_unitario || ""}
											onChange={(e) =>
												handleItemChange(idx, "valor_unitario", e.target.value)
											}
											placeholder="Ex: 120,50"
											required
											className={`${inputErrCls(`item_${idx}_valor_unitario`)} pl-8`}
										/>
									</div>
									{fieldErrors[`item_${idx}_valor_unitario`] && (
										<p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">
											{fieldErrors[`item_${idx}_valor_unitario`]}
										</p>
									)}
								</div>
								{!hasParticipantes && (
									<div className="md:col-span-2 space-y-1">
										<label className={labelCls}>Qtd Manual</label>
										<input
											type="number"
											min="1"
											value={item.quantidade_manual}
											onChange={(e) =>
												handleItemChange(
													idx,
													"quantidade_manual",
													e.target.value,
												)
											}
											placeholder="Ex: 100"
											className={`${inputErrCls(`item_${idx}_quantidade`)} text-center font-semibold`}
										/>
										{fieldErrors[`item_${idx}_quantidade`] && (
											<p className="text-[9px] text-red-600 font-semibold font-sans mt-0.5">
												{fieldErrors[`item_${idx}_quantidade`]}
											</p>
										)}
									</div>
								)}
							</div>
							{hasParticipantes && fieldErrors[`item_${idx}_quantidade`] && (
								<p className="text-[10px] text-red-600 font-bold font-sans mt-1 bg-red-50 p-2 border border-red-200">
									Erro de Quantidade: {fieldErrors[`item_${idx}_quantidade`]} (A soma das quantidades dos órgãos participantes deve ser maior que zero)
								</p>
							)}

						{/* ── Upload de Imagem do Produto ──────────── */}
						<div className="border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-3">
							<div className="flex items-center justify-between">
								<label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
									<ImagePlus className="w-3.5 h-3.5" />
									Imagem do Produto (Opcional)
								</label>
								{item.url_imagem && (
									<button
										type="button"
										onClick={() => {
											const u = [...itens];
											u[idx] = { ...u[idx], url_imagem: "" };
											setItens(u);
										}}
										className="flex items-center gap-1 text-[9px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider cursor-pointer transition"
									>
										<X className="w-3 h-3" />
										Remover
									</button>
								)}
							</div>

							<div className="flex items-start gap-4">
								{/* Preview */}
								<div className="shrink-0 w-24 h-24 border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
									{item.url_imagem ? (
										<img
											src={item.url_imagem}
											alt="Preview do produto"
											className="w-full h-full object-cover"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = "none";
											}}
										/>
									) : (
										<Package className="w-8 h-8 text-slate-300" />
									)}
								</div>

								{/* Input de arquivo e URL */}
								<div className="flex-1 space-y-3">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
										<div>
											<label
												htmlFor={`img-upload-${idx}`}
												className={`flex items-center justify-center gap-2 w-full py-2.5 border text-[10px] font-bold font-sans uppercase tracking-wider transition cursor-pointer ${
													uploadingImageIdx === idx
														? "bg-slate-100 text-slate-400 cursor-wait border-slate-200"
														: "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-500"
												}`}
											>
												{uploadingImageIdx === idx ? (
													<>
														<Loader2 className="w-3.5 h-3.5 animate-spin" />
														Enviando...
													</>
												) : (
													<>
														<ImagePlus className="w-3.5 h-3.5" />
														{item.url_imagem ? "Trocar de Arquivo" : "Enviar Imagem"}
													</>
												)}
											</label>
											<input
												id={`img-upload-${idx}`}
												type="file"
												accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
												disabled={uploadingImageIdx !== null}
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) handleImageUpload(idx, file);
													e.target.value = "";
												}}
												className="hidden"
											/>
											<p className="text-[9px] text-slate-400 font-sans mt-1">
												PNG, JPG, WEBP ou GIF (máx 5MB)
											</p>
										</div>

										<div className="space-y-1">
											<input
												type="url"
												placeholder="https://exemplo.com/imagem.png"
												value={item.url_imagem}
												onChange={(e) => handleItemChange(idx, "url_imagem", e.target.value)}
												className={inputCls}
											/>
											<p className="text-[9px] text-slate-400 font-sans">
												Ou cole a URL direta de uma imagem da internet
											</p>
										</div>
									</div>

									{uploadImageError && uploadingImageIdx === null && (
										<p className="text-[9px] text-red-600 font-sans font-semibold">
											{uploadImageError}
										</p>
									)}
								</div>
							</div>
						</div>

							{/* ── Sub-tabela: Órgãos Participantes ────── */}
							<div className="mt-2 border border-slate-200 bg-white">
								<div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
									<div className="flex items-center gap-2">
										<Building2 className="w-3.5 h-3.5 text-slate-500" />
										<span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
											Órgãos Participantes da Licitação
										</span>
										{hasParticipantes && (
											<span className="text-[9px] font-bold text-slate-950 bg-slate-200 px-1.5 py-0.5 ml-1">
												{item.participantes.length}
											</span>
										)}
									</div>
									<button
										type="button"
										onClick={() => handleAddParticipante(idx)}
										className="text-[9px] text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
									>
										<Plus className="w-3 h-3" /> Vincular Órgão
									</button>
								</div>

								{item.participantes.length === 0 ? (
									<div className="px-4 py-4 text-center">
										<p className="text-[10px] text-slate-500 font-light italic">
											Nenhum órgão vinculado. Clique em "Vincular Órgão" para
											adicionar participantes, ou preencha a quantidade manual
											acima.
										</p>
									</div>
								) : (
									<div className="divide-y divide-slate-100">
										{/* Header da tabela */}
										<div className="grid grid-cols-12 gap-3 px-4 py-2 bg-slate-50/50">
											<div className="col-span-7">
												<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
													Órgão Participante
												</span>
											</div>
											<div className="col-span-3">
												<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
													Qtd Planejada
												</span>
											</div>
											<div className="col-span-2" />
										</div>

										{item.participantes.map((part, pIdx) => (
											<div
												key={pIdx}
												className="grid grid-cols-12 gap-3 px-4 py-2 items-center hover:bg-slate-50/50 transition-colors"
											>
												<div className="col-span-7">
													<select
														value={part.orgao_id}
														onChange={(e) =>
															handleParticipanteChange(
																idx,
																pIdx,
																"orgao_id",
																e.target.value,
															)
														}
														className={`${selectCls} text-[11px]`}
													>
														<option value="">-- Selecione o Órgão --</option>
														{organs.map((o) => (
															<option key={o.id} value={o.id}>
																{o.nome} ({o.cnpj})
															</option>
														))}
													</select>
												</div>
												<div className="col-span-3">
													<input
														type="number"
														min="1"
														value={part.quantidade_planejada}
														onChange={(e) =>
															handleParticipanteChange(
																idx,
																pIdx,
																"quantidade_planejada",
																e.target.value,
															)
														}
														placeholder="Ex: 50"
														className={`${inputCls} text-center font-semibold text-[11px]`}
													/>
												</div>
												<div className="col-span-2 flex justify-center">
													<button
														type="button"
														onClick={() => handleRemoveParticipante(idx, pIdx)}
														className="p-1.5 text-red-600 hover:bg-red-50 cursor-pointer transition border border-transparent hover:border-red-100"
														title="Remover participante"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
											</div>
										))}

										{/* Rodapé com total */}
										<div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-900/[0.03]">
											<div className="col-span-7">
												<span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
													Quantidade Total Ofertada (Soma)
												</span>
											</div>
											<div className="col-span-3">
												<span className="text-xs font-bold text-slate-950 text-center block">
													{itemQty}
												</span>
											</div>
											<div className="col-span-2" />
										</div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);

	/* ── Step 4: Revisão & Envio ─────────────────────────── */
	const renderStep4 = () => (
		<div className="space-y-6 animate-fade-in">
			{/* Resumo dos Dados */}
			<div className="bg-white border border-slate-955/10 p-6 space-y-4">
				<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">
					§ RESUMO DA ATA
				</span>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Número da ATA
						</span>
						<span className="font-semibold text-slate-900">
							{numeroAta || "—"}
						</span>
					</div>
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Processo Adm.
						</span>
						<span className="font-semibold text-slate-900">
							{processoAdm || "—"}
						</span>
					</div>
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Nº Pregão
						</span>
						<span className="font-semibold text-slate-900">
							{numeroPregao || "—"}
						</span>
					</div>
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Órgão Gerenciador
						</span>
						<span className="font-semibold text-slate-900">
							{userOrgan?.nome || "—"}
						</span>
					</div>
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Assinatura
						</span>
						<span className="font-semibold text-slate-900">
							{dataAssinatura || "—"}
						</span>
					</div>
					<div>
						<span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
							Vigência
						</span>
						<span className="font-semibold text-slate-900">
							{vigenciaMeses} meses
						</span>
					</div>
				</div>
			</div>

			{/* Tabela resumo dos itens */}
			<div className="bg-white border border-slate-955/10 p-6 space-y-4">
				<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">
					§ ITENS CADASTRADOS ({itens.length})
				</span>
				<div className="overflow-x-auto">
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
								<th className="text-left py-2 pr-3">Item</th>
								<th className="text-left py-2 pr-3">Descrição</th>
								<th className="text-left py-2 pr-3">Grupo</th>
								<th className="text-right py-2 pr-3">Qtd</th>
								<th className="text-right py-2 pr-3">Participantes</th>
								<th className="text-right py-2 pr-3">Valor Unit.</th>
								<th className="text-right py-2">Total</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{itens.map((item, idx) => {
								const qty = getItemQty(item);
								const total = Number(item.valor_unitario || 0) * qty;
								return (
									<tr
										key={idx}
										className="hover:bg-slate-50/50 transition-colors"
									>
										<td className="py-2 pr-3 font-semibold">
											{item.numero_item}
										</td>
										<td
											className="py-2 pr-3 max-w-[200px] truncate"
											title={item.descricao_especificacao}
										>
											{item.descricao_especificacao || "—"}
										</td>
										<td className="py-2 pr-3">{item.grupo_numero}</td>
										<td className="py-2 pr-3 text-right font-semibold">
											{qty}
										</td>
										<td className="py-2 pr-3 text-right">
											{item.participantes.length > 0 ? (
												<span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
													{item.participantes.length} órgão(s)
												</span>
											) : (
												<span className="text-[9px] text-slate-500 italic">
													manual
												</span>
											)}
										</td>
										<td className="py-2 pr-3 text-right font-mono">
											{fmtBRL(Number(item.valor_unitario || 0))}
										</td>
										<td className="py-2 text-right font-semibold font-mono">
											{fmtBRL(total)}
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr className="border-t-2 border-slate-300">
								<td
									colSpan={6}
									className="py-2 pr-3 text-right font-bold uppercase text-[9px] tracking-wider text-slate-500"
								>
									Valor Total Global
								</td>
								<td className="py-2 text-right font-bold text-sm font-mono text-slate-950">
									{fmtBRL(valorTotalGlobal)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>

			{/* Regras de Carona */}
			<div className="bg-white border border-slate-955/10 p-6 space-y-4">
				<div className="flex justify-between items-center border-b border-slate-100 pb-2">
					<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
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
						<div
							key={idx}
							className="flex gap-3 items-start border-b border-dashed border-slate-100 pb-3"
						>
							<div className="w-24 space-y-1.5 shrink-0">
								<label className={labelCls}>Limite Máximo (%) *</label>
								<input
									type="number"
									min="0"
									max="100"
									value={regra.percentual_maximo_do_saldo}
									onChange={(e) =>
										handleRegraChange(
											idx,
											"percentual_maximo_do_saldo",
											e.target.value,
										)
									}
									required
									className={`${inputCls} text-center font-semibold`}
								/>
							</div>
							<div className="flex-grow space-y-1.5">
								<label className={labelCls}>Descrição Legal da Regra</label>
								<input
									type="text"
									value={regra.descricao}
									onChange={(e) =>
										handleRegraChange(idx, "descricao", e.target.value)
									}
									placeholder="Ex: Permitido caronas externas até 50% do saldo"
									className={inputCls}
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

			{/* Barra de envio */}
			<div className="bg-[#F8FAFE] border border-slate-955/10 p-6 space-y-4">
				{/* Erro inline perto do botão — aparece quando há erro de validação no step 4 */}
				{errorMsg && (
					<div className="flex items-start gap-3 p-3 border border-red-300 bg-red-50 text-red-800 animate-fade-in">
						<Info className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-red-700 mb-0.5">Erro ao Finalizar</p>
							<p className="text-[11px] font-sans leading-snug">{errorMsg}</p>
						</div>
					</div>
				)}

				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="text-center md:text-left space-y-1">
						<span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider block">
							VALOR TOTAL GLOBAL ESTIMADO
						</span>
						<h3 className="text-3xl font-light font-display text-slate-955 leading-none">
							{fmtBRL(valorTotalGlobal)}
						</h3>
					</div>

					<div>
						<Button
							type="button"
							onClick={handleSubmit}
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
			</div>
		</div>
	);

	/* ── Render Principal ────────────────────────────────── */
	return (
		<div className="animate-fade-in font-sans">
			<div className="p-6 md:p-8 space-y-6">
				{/* Header */}
				<div>
					<div className="flex items-start justify-between pb-4">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO ÓRGÃO GERENCIADOR • CADASTRO DE ATA
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Cadastro de ATA de Registro de Preços
							</h2>
						</div>
					</div>
					<ManagerTabs activeTab="cadastro" />
				</div>

				{/* Error */}
				{errorMsg && (
					<div className="p-4 border border-red-900/20 bg-red-50/50 text-red-950 text-xs flex gap-3 rounded-none items-start">
						<Info className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
						<div className="space-y-1">
							<span className="font-bold uppercase text-[9px] tracking-wider block">
								Erro na Autuação
							</span>
							<p className="font-light">{errorMsg}</p>
						</div>
					</div>
				)}

				{/* Step Indicator */}
				{renderStepIndicator()}

				{/* Step Content */}
				{currentStep === 1 && renderStep1()}
				{currentStep === 2 && renderStep2()}
				{currentStep === 3 && renderStep3()}
				{currentStep === 4 && renderStep4()}

				{/* Navigation */}
				<div className="flex justify-between items-center pt-2">
					<div>
						{currentStep > 1 && (
							<Button
								type="button"
								onClick={goPrev}
								className="h-10 px-5 bg-white hover:bg-slate-50 text-slate-800 cursor-pointer uppercase tracking-wider text-xs font-bold font-sans rounded-none inline-flex items-center gap-2 border border-slate-300 transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								<span>Anterior</span>
							</Button>
						)}
					</div>
					<div>
						{currentStep < 4 && (
							<Button
								type="button"
								onClick={goNext}
								className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer uppercase tracking-wider text-xs font-bold font-sans rounded-none inline-flex items-center gap-2 border border-blue-600 shadow-sm transition-all"
							>
								<span>Próximo</span>
								<ArrowRight className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
