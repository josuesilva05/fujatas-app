import {
	Bell,
	Building2,
	ChevronLeft,
	Loader2,
	Mail,
	Phone,
	Search,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { listSuppliers } from "@/services/atas";
import { getSupplierBalances } from "@/services/supplierService";
import type { FornecedorResponse, SupplierBalance } from "@/types/supplier";

interface SupplierBalancesProps {
	user: {
		id: string;
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	};
}

export default function SupplierBalances({ user }: SupplierBalancesProps) {
	const { role: rolePath } = useParams();
	const role = rolePath ?? "fornecedor";

	const isAdminViewing =
		user.papel === "ADMIN_GERENCIADOR" && !user.fornecedor_id;

	const [suppliers, setSuppliers] = useState<FornecedorResponse[]>([]);
	const [loadingSuppliers, setLoadingSuppliers] = useState(false);

	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);
	const [items, setItems] = useState<SupplierBalance[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [searchQ, setSearchQ] = useState("");

	useEffect(() => {
		if (isAdminViewing && !selectedSupplierId) {
			setLoadingSuppliers(true);
			listSuppliers()
				.then(setSuppliers)
				.catch(() => setError("Erro ao carregar fornecedores."))
				.finally(() => setLoadingSuppliers(false));
		}
	}, [isAdminViewing, selectedSupplierId]);

	useEffect(() => {
		const id = selectedSupplierId || user.fornecedor_id;
		if (!id) return;

		setLoading(true);
		setError("");
		getSupplierBalances(id)
			.then(setItems)
			.catch(() => setError("Erro ao carregar saldos."))
			.finally(() => setLoading(false));
	}, [selectedSupplierId, user.fornecedor_id]);

	const q = searchQ.toLowerCase();
	const filteredSuppliers = suppliers.filter(
		(s) => s.razao_social.toLowerCase().includes(q) || s.cnpj.includes(q),
	);

	const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

	return (
		<div className="animate-fade-in">
			<div className="p-6 md:p-8 space-y-6">
				<div className="border-b border-slate-955/10 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
								MÓDULO FORNECEDOR • ITENS ATIVOS
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								{selectedSupplierId
									? `Itens — ${selectedSupplier?.razao_social ?? ""}`
									: "Gerenciamento de Itens Ativos"}
							</h2>
							<Breadcrumb className="mt-4">
								<BreadcrumbList>
									<BreadcrumbItem>
										{selectedSupplierId ? (
											<BreadcrumbLink
												asChild
												className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
											>
												<button
													type="button"
													onClick={() => setSelectedSupplierId(null)}
													className="cursor-pointer"
												>
													Fornecedores
												</button>
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
												Fornecedores
											</BreadcrumbPage>
										)}
									</BreadcrumbItem>
									{selectedSupplierId && (
										<>
											<BreadcrumbSeparator />
											<BreadcrumbItem>
												<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
													Itens Ativos
												</BreadcrumbPage>
											</BreadcrumbItem>
										</>
									)}
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbLink
											asChild
											className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
										>
											<Link to={`/${role}/vendas`}>Notificações</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<Link
								to={`/${role}/vendas`}
								className="border border-slate-950/8 px-3 py-1.5 text-xs font-sans font-medium text-slate-600 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer flex items-center gap-1.5 rounded-none"
							>
								<Bell className="w-3.5 h-3.5" />
								<span>Notificações</span>
							</Link>
						</div>
					</div>
				</div>

				{error && (
					<div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
						{error}
					</div>
				)}

				{/* Admin: supplier list */}
				{isAdminViewing && !selectedSupplierId && (
					<>
						<div className="relative max-w-xs">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
							<input
								type="text"
								value={searchQ}
								onChange={(e) => setSearchQ(e.target.value)}
								placeholder="Buscar fornecedor..."
								className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-9 pr-3 py-1.5 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
							/>
						</div>

						{loadingSuppliers ? (
							<div className="flex items-center justify-center py-16">
								<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
							</div>
						) : filteredSuppliers.length === 0 ? (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
								<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">
									Nenhum fornecedor encontrado.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{filteredSuppliers.map((s) => (
									<button
										type="button"
										key={s.id}
										onClick={() => setSelectedSupplierId(s.id)}
										className="border border-slate-955/10 bg-white p-4 text-left hover:border-blue-600 hover:shadow-sm transition cursor-pointer group"
									>
										<span className="text-xs font-bold font-sans text-slate-900 group-hover:text-blue-600 transition block truncate">
											{s.razao_social}
										</span>
										<span className="text-[10px] font-sans text-slate-500 block mt-0.5">
											{s.cnpj}
										</span>
										<div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400 font-sans">
											{s.email && (
												<span className="flex items-center gap-1 truncate">
													<Mail className="w-3 h-3 shrink-0" />
													<span className="truncate">{s.email}</span>
												</span>
											)}
											{s.telefone && (
												<span className="flex items-center gap-1 shrink-0">
													<Phone className="w-3 h-3" />
													{s.telefone}
												</span>
											)}
										</div>
										{s.nome_representante && (
											<span className="flex items-center gap-1 text-[9px] text-slate-400 font-sans mt-1">
												<User className="w-3 h-3 shrink-0" />
												<span className="truncate">{s.nome_representante}</span>
											</span>
										)}
									</button>
								))}
							</div>
						)}
					</>
				)}

				{/* Selected supplier data or regular user data */}
				{selectedSupplierId && isAdminViewing && (
					<div>
						<button
							type="button"
							onClick={() => setSelectedSupplierId(null)}
							className="flex items-center gap-1 text-[10px] font-bold font-sans uppercase tracking-wider text-slate-500 hover:text-blue-600 transition cursor-pointer mb-4"
						>
							<ChevronLeft className="w-3.5 h-3.5" />
							Voltar para fornecedores
						</button>

						{renderBalances()}
					</div>
				)}

				{!isAdminViewing && user.fornecedor_id && renderBalances()}
			</div>
		</div>
	);

	function renderBalances() {
		if (loading) {
			return (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
				</div>
			);
		}

		if (items.length === 0) {
			return (
				<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
					<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
					<p className="text-xs text-slate-500 font-sans">
						Nenhum item encontrado.
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-3">
				{items.map((item) => (
					<div
						key={item.id}
						className="border border-slate-955/10 bg-white p-4"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 flex-1">
								<span className="text-[10px] font-bold text-slate-500 font-sans">
									Item {item.numero_item}
								</span>
								<p className="text-xs text-slate-900 font-sans mt-0.5">
									{item.descricao_especificacao}
								</p>
							</div>
							<span className="text-xs font-bold font-sans text-slate-900 shrink-0">
								R${" "}
								{Number(item.valor_unitario).toLocaleString("pt-BR", {
									minimumFractionDigits: 2,
								})}
							</span>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[10px] font-sans text-slate-500">
							<div>
								<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
									Oferta Total
								</span>
								<span className="text-slate-900">
									{Number(item.quantidade_total_ofertada ?? 0).toLocaleString(
										"pt-BR",
									)}
								</span>
							</div>
							<div>
								<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
									Saldo Disponível
								</span>
								<span className="text-slate-900">
									{Number(item.quantidade_saldo_disponivel ?? 0).toLocaleString(
										"pt-BR",
									)}
								</span>
							</div>
							<div>
								<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
									Unidade
								</span>
								<span className="text-slate-900">
									{item.unidade_medida || "—"}
								</span>
							</div>
							<div>
								<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
									ATA
								</span>
								<span className="text-slate-900">
									{item.ata?.numero_ata || "—"}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}
}