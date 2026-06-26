import {
	AlertTriangle,
	Building2,
	CheckCircle,
	Edit3,
	Loader2,
	Plus,
	Search,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
	createOrgan,
	deleteOrgan,
	listOrgans,
	updateOrgan,
} from "@/services/organs";
import {
	createSupplier,
	deleteSupplier,
	listSuppliers,
	updateSupplier,
} from "@/services/suppliers";
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

interface ManagerEntitiesProps {
	user: UserSession;
}

/* ── HELPERS DE MÁSCARA/FORMATO ─────────────────────────── */
function formatCNPJ(val: string) {
	const cleaned = val.replace(/\D/g, "");
	if (cleaned.length <= 2) return cleaned;
	if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
	if (cleaned.length <= 8)
		return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
	if (cleaned.length <= 12)
		return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
	return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
}

function formatCPF(val: string) {
	const cleaned = val.replace(/\D/g, "");
	if (cleaned.length <= 3) return cleaned;
	if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
	if (cleaned.length <= 9)
		return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
	return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}

function formatPhone(val: string) {
	const cleaned = val.replace(/\D/g, "");
	if (cleaned.length <= 2) return cleaned;
	if (cleaned.length <= 7)
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
	return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

export default function ManagerEntities({ user: _user }: ManagerEntitiesProps) {
	const [activeSubTab, setActiveSubTab] = useState<"suppliers" | "organs">(
		"suppliers",
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Data States
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [organs, setOrgans] = useState<Organ[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Form Modal States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState<"supplier" | "organ">("supplier");
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [modalError, setModalError] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	// Delete Modal States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deletingEntity, setDeletingEntity] = useState<{
		id: string;
		name: string;
		type: "supplier" | "organ";
	} | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	// Supplier Form States
	const [sCnpj, setSCnpj] = useState("");
	const [sRazaoSocial, setSRazaoSocial] = useState("");
	const [sEndereco, setSEndereco] = useState("");
	const [sNomeRepresentante, setSNomeRepresentante] = useState("");
	const [sCpfRepresentante, setSCpfRepresentante] = useState("");
	const [sTelefone, setSTelefone] = useState("");
	const [sEmail, setSEmail] = useState("");

	// Organ Form States
	const [oCnpj, setOCnpj] = useState("");
	const [oNome, setONome] = useState("");
	const [oTipo, setOTipo] = useState<"FEDERAL" | "ESTADUAL" | "MUNICIPAL">(
		"ESTADUAL",
	);
	const [oEndereco, setOEndereco] = useState("");

	// Fetch Data
	const loadData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const [suppliersData, organsData] = await Promise.all([
				listSuppliers(),
				listOrgans(),
			]);
			setSuppliers(suppliersData);
			setOrgans(organsData);
		} catch (err) {
			console.error(err);
			setError("Erro ao carregar os dados das entidades.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Filtered Results
	const filteredSuppliers = suppliers.filter((s) => {
		const q = searchQuery.toLowerCase();
		const cnpjRaw = s.cnpj.replace(/\D/g, "");
		return (
			s.razao_social.toLowerCase().includes(q) ||
			s.cnpj.includes(q) ||
			cnpjRaw.includes(q) ||
			s.nome_representante?.toLowerCase().includes(q)
		);
	});

	const filteredOrgans = organs.filter((o) => {
		const q = searchQuery.toLowerCase();
		const cnpjRaw = o.cnpj.replace(/\D/g, "");
		return (
			o.nome.toLowerCase().includes(q) ||
			o.cnpj.includes(q) ||
			cnpjRaw.includes(q) ||
			o.tipo.toLowerCase().includes(q)
		);
	});

	// Reset Form Data
	const resetForms = () => {
		setSCnpj("");
		setSRazaoSocial("");
		setSEndereco("");
		setSNomeRepresentante("");
		setSCpfRepresentante("");
		setSTelefone("");
		setSEmail("");

		setOCnpj("");
		setONome("");
		setOTipo("ESTADUAL");
		setOEndereco("");

		setEditingId(null);
		setIsEditMode(false);
		setModalError("");
		setSuccessMsg("");
	};

	// Open registration modal (Create mode)
	const handleOpenCreateModal = (type: "supplier" | "organ") => {
		setModalType(type);
		setIsEditMode(false);
		resetForms();
		setIsModalOpen(true);
	};

	// Open edit modal (Edit mode)
	const handleOpenEditModal = (
		entity: Supplier | Organ,
		type: "supplier" | "organ",
	) => {
		setModalType(type);
		setIsEditMode(true);
		setEditingId(entity.id);
		setModalError("");
		setSuccessMsg("");

		if (type === "supplier") {
			const s = entity as Supplier;
			setSCnpj(formatCNPJ(s.cnpj));
			setSRazaoSocial(s.razao_social);
			setSEndereco(s.endereco || "");
			setSNomeRepresentante(s.nome_representante || "");
			setSCpfRepresentante(
				s.cpf_representante ? formatCPF(s.cpf_representante) : "",
			);
			setSTelefone(s.telefone ? formatPhone(s.telefone) : "");
			setSEmail(s.email || "");
		} else {
			const o = entity as Organ;
			setOCnpj(formatCNPJ(o.cnpj));
			setONome(o.nome);
			setOTipo(o.tipo);
			setOEndereco(o.endereco || "");
		}
		setIsModalOpen(true);
	};

	// Open delete confirmation modal
	const handleOpenDeleteModal = (
		id: string,
		name: string,
		type: "supplier" | "organ",
	) => {
		setDeletingEntity({ id, name, type });
		setDeleteError("");
		setIsDeleteModalOpen(true);
	};

	// Handle Submit (Create or Update)
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setModalError("");
		setSuccessMsg("");

		try {
			if (modalType === "supplier") {
				const cleanedCnpj = sCnpj.replace(/\D/g, "");
				const cleanedCpf = sCpfRepresentante.replace(/\D/g, "");

				if (cleanedCnpj.length !== 14) {
					throw new Error("CNPJ deve conter 14 dígitos.");
				}
				if (!sRazaoSocial.trim()) {
					throw new Error("Razão Social é obrigatória.");
				}

				const supplierPayload = {
					cnpj: cleanedCnpj,
					razao_social: sRazaoSocial.trim(),
					endereco: sEndereco.trim() || undefined,
					nome_representante: sNomeRepresentante.trim() || undefined,
					cpf_representante: cleanedCpf || undefined,
					telefone: sTelefone.trim() || undefined,
					email: sEmail.trim() || undefined,
				};

				if (isEditMode && editingId) {
					const updated = await updateSupplier(editingId, supplierPayload);
					setSuppliers((prev) =>
						prev.map((item) => (item.id === editingId ? updated : item)),
					);
					setSuccessMsg("Fornecedor atualizado com sucesso!");
				} else {
					const created = await createSupplier(supplierPayload);
					setSuppliers((prev) => [...prev, created]);
					setSuccessMsg("Fornecedor cadastrado com sucesso!");
				}

				setTimeout(() => {
					setIsModalOpen(false);
					resetForms();
				}, 1500);
			} else {
				const cleanedCnpj = oCnpj.replace(/\D/g, "");

				if (cleanedCnpj.length !== 14) {
					throw new Error("CNPJ deve conter 14 dígitos.");
				}
				if (!oNome.trim()) {
					throw new Error("Nome do Órgão é obrigatório.");
				}

				const organPayload = {
					cnpj: cleanedCnpj,
					nome: oNome.trim(),
					tipo: oTipo,
					endereco: oEndereco.trim() || undefined,
				};

				if (isEditMode && editingId) {
					const updated = await updateOrgan(editingId, organPayload);
					setOrgans((prev) =>
						prev.map((item) => (item.id === editingId ? updated : item)),
					);
					setSuccessMsg("Órgão Público atualizado com sucesso!");
				} else {
					const created = await createOrgan(organPayload);
					setOrgans((prev) => [...prev, created]);
					setSuccessMsg("Órgão Público cadastrado com sucesso!");
				}

				setTimeout(() => {
					setIsModalOpen(false);
					resetForms();
				}, 1500);
			}
		} catch (err) {
			console.error(err);
			const apiError =
				(err as { response?: { data?: { detail?: string } }; message?: string })
					.response?.data?.detail ||
				(err as { response?: { data?: { detail?: string } }; message?: string })
					.message ||
				"Erro desconhecido ao processar.";
			setModalError(apiError);
		} finally {
			setSubmitting(false);
		}
	};

	// Handle Delete execution
	const handleDelete = async () => {
		if (!deletingEntity) return;
		setDeleting(true);
		setDeleteError("");

		try {
			if (deletingEntity.type === "supplier") {
				await deleteSupplier(deletingEntity.id);
				setSuppliers((prev) =>
					prev.filter((item) => item.id !== deletingEntity.id),
				);
			} else {
				await deleteOrgan(deletingEntity.id);
				setOrgans((prev) =>
					prev.filter((item) => item.id !== deletingEntity.id),
				);
			}
			setIsDeleteModalOpen(false);
			setDeletingEntity(null);
		} catch (err) {
			console.error(err);
			const apiError =
				(err as { response?: { data?: { detail?: string } } }).response?.data
					?.detail ||
				"Erro ao excluir entidade. Ela pode ter atas, itens ou usuários vinculados.";
			setDeleteError(apiError);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="animate-fade-in font-sans">
			<div className="p-6 md:p-8 space-y-6">
				{/* ── Header ── */}
				<div>
					<div className="flex items-start justify-between pb-4">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								Módulo Órgão Gerenciador • Cadastros
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								Gerenciamento de Entidades
							</h2>
						</div>
					</div>
					<ManagerTabs activeTab="cadastros" />
				</div>

				{/* ── Error Notification ── */}
				{error && (
					<div className="p-4 border border-red-900/20 bg-red-50/50 text-red-950 text-xs flex gap-3 rounded-none items-start">
						<AlertTriangle className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
						<div className="space-y-1">
							<span className="font-bold uppercase text-[9px] tracking-wider block">
								Falha no Carregamento
							</span>
							<p className="font-light">{error}</p>
							<button
								onClick={loadData}
								className="text-[10px] font-bold uppercase underline hover:text-red-700 block pt-1"
							>
								Tentar Novamente
							</button>
						</div>
					</div>
				)}

				{/* ── Top Toolbar ── */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-955/10">
					{/* Sub-tabs toggles */}
					<div className="flex bg-slate-100 p-0.5 rounded-none border border-slate-200 w-fit self-start md:self-auto">
						<button
							onClick={() => {
								setActiveSubTab("suppliers");
								setSearchQuery("");
							}}
							className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider transition ${
								activeSubTab === "suppliers"
									? "bg-white text-slate-950 shadow-sm"
									: "text-slate-500 hover:text-slate-800"
							}`}
						>
							<Users className="w-3.5 h-3.5" />
							<span>Fornecedores ({suppliers.length})</span>
						</button>
						<button
							onClick={() => {
								setActiveSubTab("organs");
								setSearchQuery("");
							}}
							className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider transition ${
								activeSubTab === "organs"
									? "bg-white text-slate-950 shadow-sm"
									: "text-slate-500 hover:text-slate-800"
							}`}
						>
							<Building2 className="w-3.5 h-3.5" />
							<span>Órgãos Públicos ({organs.length})</span>
						</button>
					</div>

					{/* Search & Actions */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 grow max-w-2xl md:justify-end">
						<div className="relative grow sm:max-w-xs">
							<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder={
									activeSubTab === "suppliers"
										? "Buscar fornecedor..."
										: "Buscar órgão público..."
								}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-light"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							)}
						</div>

						<Button
							onClick={() =>
								handleOpenCreateModal(
									activeSubTab === "suppliers" ? "supplier" : "organ",
								)
							}
							className="h-9 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-none uppercase tracking-wider text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm border border-slate-955/15"
						>
							<Plus className="w-4 h-4" />
							<span>
								{activeSubTab === "suppliers"
									? "Novo Fornecedor"
									: "Novo Órgão"}
							</span>
						</Button>
					</div>
				</div>

				{/* ── Table Grid Content ── */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-955/10 gap-3">
						<Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
						<span className="text-xs font-light text-slate-500 uppercase tracking-wider">
							Carregando registros...
						</span>
					</div>
				) : (
					<div className="bg-white border border-slate-955/10 overflow-hidden">
						{activeSubTab === "suppliers" ? (
							filteredSuppliers.length === 0 ? (
								<div className="text-center py-16 text-slate-400 font-light text-sm">
									Nenhum fornecedor cadastrado ou encontrado.
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse">
										<thead>
											<tr className="bg-slate-50 border-b border-slate-200">
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
													CNPJ
												</th>
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
													Razão Social
												</th>
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
													Representante / CPF
												</th>
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
													Contatos
												</th>
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
													Endereço
												</th>
												<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500 text-right">
													Ações
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{filteredSuppliers.map((s) => (
												<tr
													key={s.id}
													className="hover:bg-slate-50/50 transition-colors"
												>
													<td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
														{formatCNPJ(s.cnpj)}
													</td>
													<td className="px-5 py-3.5 text-xs font-semibold text-slate-900">
														{s.razao_social}
													</td>
													<td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
														<div className="font-medium text-slate-800">
															{s.nome_representante || "—"}
														</div>
														<div className="text-[10px] text-slate-400 font-mono">
															{s.cpf_representante
																? formatCPF(s.cpf_representante)
																: "—"}
														</div>
													</td>
													<td className="px-5 py-3.5 text-xs text-slate-600">
														<div className="font-light">{s.email || "—"}</div>
														<div className="text-[10px] font-mono text-slate-400">
															{s.telefone ? formatPhone(s.telefone) : "—"}
														</div>
													</td>
													<td
														className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate"
														title={s.endereco}
													>
														{s.endereco || "—"}
													</td>
													<td className="px-5 py-3.5 text-xs text-right whitespace-nowrap">
														<div className="inline-flex items-center gap-1.5">
															<button
																onClick={() =>
																	handleOpenEditModal(s, "supplier")
																}
																className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
																title="Editar Fornecedor"
															>
																<Edit3 className="w-3.5 h-3.5" />
															</button>
															<button
																onClick={() =>
																	handleOpenDeleteModal(
																		s.id,
																		s.razao_social,
																		"supplier",
																	)
																}
																className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 transition cursor-pointer"
																title="Excluir Fornecedor"
															>
																<Trash2 className="w-3.5 h-3.5" />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)
						) : filteredOrgans.length === 0 ? (
							<div className="text-center py-16 text-slate-400 font-light text-sm">
								Nenhum órgão público cadastrado ou encontrado.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-slate-50 border-b border-slate-200">
											<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
												CNPJ
											</th>
											<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
												Nome
											</th>
											<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
												Esfera
											</th>
											<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500">
												Endereço
											</th>
											<th className="px-5 py-3 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500 text-right">
												Ações
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{filteredOrgans.map((o) => (
											<tr
												key={o.id}
												className="hover:bg-slate-50/50 transition-colors"
											>
												<td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
													{formatCNPJ(o.cnpj)}
												</td>
												<td className="px-5 py-3.5 text-xs font-semibold text-slate-900">
													{o.nome}
												</td>
												<td className="px-5 py-3.5 text-xs whitespace-nowrap">
													<span
														className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
															o.tipo === "FEDERAL"
																? "bg-blue-50 text-blue-700 border border-blue-200"
																: o.tipo === "ESTADUAL"
																	? "bg-purple-50 text-purple-700 border border-purple-200"
																	: "bg-teal-50 text-teal-700 border border-teal-200"
														}`}
													>
														{o.tipo}
													</span>
												</td>
												<td
													className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate"
													title={o.endereco}
												>
													{o.endereco || "—"}
												</td>
												<td className="px-5 py-3.5 text-xs text-right whitespace-nowrap">
													<div className="inline-flex items-center gap-1.5">
														<button
															onClick={() => handleOpenEditModal(o, "organ")}
															className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
															title="Editar Órgão"
														>
															<Edit3 className="w-3.5 h-3.5" />
														</button>
														<button
															onClick={() =>
																handleOpenDeleteModal(o.id, o.nome, "organ")
															}
															className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 transition cursor-pointer"
															title="Excluir Órgão"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</div>

			{/* ── Modal Cadastro / Edição ── */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
					<div className="bg-white border border-slate-955/15 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
						{/* Modal Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
							<h3 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-900">
								{isEditMode
									? modalType === "supplier"
										? "Editar Fornecedor"
										: "Editar Órgão"
									: modalType === "supplier"
										? "Cadastrar Novo Fornecedor"
										: "Cadastrar Novo Órgão"}
							</h3>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Modal Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							{/* Success Message */}
							{successMsg && (
								<div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex gap-2 rounded-none items-center">
									<CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
									<span className="font-light">{successMsg}</span>
								</div>
							)}

							{/* Error Message */}
							{modalError && (
								<div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs flex gap-2 rounded-none items-center">
									<AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
									<span className="font-light">{modalError}</span>
								</div>
							)}

							{modalType === "supplier" ? (
								/* Supplier Fields */
								<div className="space-y-3.5">
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											CNPJ *
										</label>
										<input
											type="text"
											required
											placeholder="00.000.000/0000-00"
											maxLength={18}
											value={sCnpj}
											onChange={(e) => setSCnpj(formatCNPJ(e.target.value))}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Razão Social *
										</label>
										<input
											type="text"
											required
											placeholder="Ex: ATM SOLUÇÕES EM SERVIÇOS LTDA"
											value={sRazaoSocial}
											onChange={(e) => setSRazaoSocial(e.target.value)}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Endereço Completo
										</label>
										<input
											type="text"
											placeholder="Logradouro, Bairro, Município, UF, CEP"
											value={sEndereco}
											onChange={(e) => setSEndereco(e.target.value)}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
												Representante Legal
											</label>
											<input
												type="text"
												placeholder="Nome do representante"
												value={sNomeRepresentante}
												onChange={(e) => setSNomeRepresentante(e.target.value)}
												className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
											/>
										</div>
										<div>
											<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
												CPF do Representante
											</label>
											<input
												type="text"
												placeholder="000.000.000-00"
												maxLength={14}
												value={sCpfRepresentante}
												onChange={(e) =>
													setSCpfRepresentante(formatCPF(e.target.value))
												}
												className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
												Telefone
											</label>
											<input
												type="text"
												placeholder="(00) 00000-0000"
												maxLength={15}
												value={sTelefone}
												onChange={(e) =>
													setSTelefone(formatPhone(e.target.value))
												}
												className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
											/>
										</div>
										<div>
											<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
												E-mail
											</label>
											<input
												type="email"
												placeholder="contato@empresa.com"
												value={sEmail}
												onChange={(e) => setSEmail(e.target.value)}
												className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
											/>
										</div>
									</div>
								</div>
							) : (
								/* Organ Fields */
								<div className="space-y-3.5">
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											CNPJ *
										</label>
										<input
											type="text"
											required
											placeholder="00.000.000/0000-00"
											maxLength={18}
											value={oCnpj}
											onChange={(e) => setOCnpj(formatCNPJ(e.target.value))}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Nome do Órgão *
										</label>
										<input
											type="text"
											required
											placeholder="Ex: DETRAN, SESP, CASA CIVIL"
											value={oNome}
											onChange={(e) => setONome(e.target.value)}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Esfera / Tipo de Órgão *
										</label>
										<select
											required
											value={oTipo}
											onChange={(e) =>
												setOTipo(
													e.target.value as
														| "FEDERAL"
														| "ESTADUAL"
														| "MUNICIPAL",
												)
											}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white focus:outline-none focus:border-slate-800 font-light"
										>
											<option value="FEDERAL">FEDERAL</option>
											<option value="ESTADUAL">ESTADUAL</option>
											<option value="MUNICIPAL">MUNICIPAL</option>
										</select>
									</div>
									<div>
										<label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Endereço
										</label>
										<input
											type="text"
											placeholder="Endereço da sede administrativa"
											value={oEndereco}
											onChange={(e) => setOEndereco(e.target.value)}
											className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-slate-800 font-light"
										/>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									disabled={submitting}
									className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 disabled:opacity-50"
								>
									Cancelar
								</button>
								<Button
									type="submit"
									disabled={submitting}
									className="h-9 px-5 bg-slate-950 hover:bg-slate-800 text-white rounded-none uppercase tracking-wider text-xs font-bold font-sans flex items-center gap-1.5 disabled:opacity-50"
								>
									{submitting && (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									)}
									<span>Salvar</span>
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ── Modal Confirmação de Exclusão ── */}
			{isDeleteModalOpen && deletingEntity && (
				<div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
					<div className="bg-white border border-slate-955/15 shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
						{/* Header */}
						<div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
							<h3 className="text-xs font-bold font-sans uppercase tracking-wider text-red-700 flex items-center gap-1.5">
								<AlertTriangle className="w-4 h-4" />
								<span>Confirmar Exclusão</span>
							</h3>
							<button
								onClick={() => {
									setIsDeleteModalOpen(false);
									setDeletingEntity(null);
								}}
								className="text-slate-400 hover:text-slate-600 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Body */}
						<div className="p-6 space-y-4">
							{deleteError && (
								<div className="p-3 bg-red-50 border border-red-200 text-red-950 text-xs flex gap-2 rounded-none items-start">
									<AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
									<div className="space-y-0.5">
										<p className="font-bold uppercase text-[9px] tracking-wider text-red-800">
											Não é possível excluir
										</p>
										<p className="font-light">{deleteError}</p>
									</div>
								</div>
							)}

							<p className="text-xs font-light text-slate-600 leading-relaxed">
								Deseja realmente excluir a entidade{" "}
								<strong className="font-bold text-slate-900">
									{deletingEntity.name}
								</strong>
								?
							</p>
							<p className="text-[10px] text-slate-400 leading-normal bg-slate-50 p-2 border border-slate-200 font-light">
								Esta ação não poderá ser desfeita. Se esta entidade possuir
								atas, itens de ata ou usuários vinculados, a exclusão será
								bloqueada por razões de integridade de dados.
							</p>
						</div>

						{/* Actions */}
						<div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setIsDeleteModalOpen(false);
									setDeletingEntity(null);
								}}
								disabled={deleting}
								className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 disabled:opacity-50"
							>
								Cancelar
							</button>
							<Button
								onClick={handleDelete}
								disabled={deleting}
								className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider text-xs font-bold font-sans flex items-center gap-1.5 disabled:opacity-50 border border-red-600"
							>
								{deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
								<span>Excluir</span>
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
