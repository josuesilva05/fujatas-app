import {
	Bell,
	Building2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Mail,
	Package,
	Phone,
	Search,
	User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import {
	getSupplierBalances,
	getSuppliers,
	type SupplierItemsResponse,
} from "@/services/supplierService";
import type { FornecedorResponse, SupplierBalance } from "@/types/supplier";

function getPageNumbers(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}
	const pages: (number | "ellipsis")[] = [];
	pages.push(1);
	if (current > 3) pages.push("ellipsis");
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i++) pages.push(i);
	if (current < total - 2) pages.push("ellipsis");
	pages.push(total);
	return pages;
}

function ItemImage({ url, alt }: { url?: string; alt: string }) {
	const [failed, setFailed] = useState(false);

	if (!url || failed) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<Package className="w-6 h-6 text-slate-300" />
			</div>
		);
	}

	return (
		<img
			src={url}
			alt={alt}
			className="w-full h-full object-cover"
			onError={() => setFailed(true)}
		/>
	);
}

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
	const [supplierQ, setSupplierQ] = useState("");
	const [debouncedSupplierQ, setDebouncedSupplierQ] = useState("");
	const [supplierPage, setSupplierPage] = useState(1);
	const [supplierTotalItems, setSupplierTotalItems] = useState(0);
	const supplierPageSize = 8;

	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);
	const [items, setItems] = useState<SupplierBalance[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [totalItems, setTotalItems] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(8);

	const [itemSearch, setItemSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(itemSearch);
			setPage(1);
		}, 350);
		return () => clearTimeout(timer);
	}, [itemSearch]);

	const supplierDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleSupplierSearchChange = useCallback((value: string) => {
		setSupplierQ(value);
		if (supplierDebounceRef.current !== null)
			clearTimeout(supplierDebounceRef.current);
		supplierDebounceRef.current = setTimeout(() => {
			setDebouncedSupplierQ(value);
			setSupplierPage(1);
		}, 350);
	}, []);

	useEffect(() => {
		if (isAdminViewing && !selectedSupplierId) {
			setLoadingSuppliers(true);
			getSuppliers({
				skip: (supplierPage - 1) * supplierPageSize,
				limit: supplierPageSize,
				q: debouncedSupplierQ || undefined,
			})
				.then((data) => {
					setSuppliers(data.content);
					setSupplierTotalItems(data.totalElements);
				})
				.catch(() => setError("Erro ao carregar fornecedores."))
				.finally(() => setLoadingSuppliers(false));
		}
	}, [isAdminViewing, selectedSupplierId, supplierPage, debouncedSupplierQ]);

	useEffect(() => {
		const id = selectedSupplierId || user.fornecedor_id;
		if (!id) return;

		setLoading(true);
		setError("");

		getSupplierBalances(id, {
			skip: (page - 1) * pageSize,
			limit: pageSize,
			q: debouncedSearch || undefined,
		})
			.then((data: SupplierItemsResponse) => {
				setItems(data.content);
				setTotalItems(data.totalElements);
			})
			.catch(() => setError("Erro ao carregar saldos."))
			.finally(() => setLoading(false));
	}, [selectedSupplierId, user.fornecedor_id, page, pageSize, debouncedSearch]);

	useEffect(() => {
		return () => {
			if (supplierDebounceRef.current !== null)
				clearTimeout(supplierDebounceRef.current);
		};
	}, []);

	const supplierTotalPages = Math.max(
		1,
		Math.ceil(supplierTotalItems / supplierPageSize),
	);

	const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	const filteredItems = debouncedSearch
		? items.filter((item) =>
				item.descricao_especificacao
					?.toLowerCase()
					.includes(debouncedSearch.toLowerCase()),
			)
		: items;

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
									{isAdminViewing ? (
										<>
											<BreadcrumbItem>
												{selectedSupplierId ? (
													<BreadcrumbLink
														asChild
														className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
													>
														<button
															type="button"
															onClick={() => {
																setSelectedSupplierId(null);
																setPage(1);
															}}
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
										</>
									) : (
										<BreadcrumbItem>
											<BreadcrumbPage className="text-[10px] font-semibold tracking-wider uppercase">
												Itens Ativos
											</BreadcrumbPage>
										</BreadcrumbItem>
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
						<div className="relative w-full max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
							<input
								type="text"
								value={supplierQ}
								onChange={(e) => handleSupplierSearchChange(e.target.value)}
								placeholder="Buscar fornecedor..."
								className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-10 pr-4 py-2.5 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
							/>
						</div>

						{loadingSuppliers ? (
							<div className="flex items-center justify-center py-16">
								<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
							</div>
						) : suppliers.length === 0 ? (
							<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
								<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
								<p className="text-xs text-slate-500 font-sans">
									Nenhum fornecedor encontrado.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{suppliers.map((s) => (
									<button
										type="button"
										key={s.id}
										onClick={() => setSelectedSupplierId(s.id)}
										className="border border-slate-955/10 bg-white p-4 text-left hover:border-blue-600 hover:shadow-sm transition cursor-pointer group"
									>
										<span className="text-sm font-bold font-sans text-slate-900 group-hover:text-blue-600 transition block truncate">
											{s.razao_social}
										</span>
										<span className="text-xs font-sans text-slate-500 block mt-0.5">
											{s.cnpj}
										</span>
										<div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-sans">
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
											<span className="flex items-center gap-1 text-[10px] text-slate-400 font-sans mt-1">
												<User className="w-3 h-3 shrink-0" />
												<span className="truncate">{s.nome_representante}</span>
											</span>
										)}
									</button>
								))}
							</div>
						)}

						{!loadingSuppliers && (
							<div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-955/10">
								<div className="flex items-center gap-1 flex-wrap justify-center">
									<button
										onClick={() => setSupplierPage((p) => Math.max(1, p - 1))}
										disabled={supplierPage <= 1}
										className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
										<span>Anterior</span>
									</button>
									{(() => {
										const pages = getPageNumbers(
											supplierPage,
											supplierTotalPages,
										);
										let ellipsisCount = 0;
										return pages.map((p) => {
											if (p === "ellipsis") {
												ellipsisCount++;
												return (
													<span
														key={`ellipsis-${ellipsisCount}`}
														className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none"
													>
														...
													</span>
												);
											}
											return (
												<button
													key={`page-${p}`}
													onClick={() => setSupplierPage(p)}
													className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${
														p === supplierPage
															? "bg-slate-955 text-white border-slate-955"
															: "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"
													}`}
												>
													{p}
												</button>
											);
										});
									})()}
									<button
										onClick={() => setSupplierPage((p) => p + 1)}
										disabled={supplierPage >= supplierTotalPages}
										className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
									>
										<span>Próximo</span>
										<ChevronRight className="w-3.5 h-3.5 shrink-0" />
									</button>
								</div>
							</div>
						)}
					</>
				)}

				{/* Selected supplier data or regular user data */}
				{selectedSupplierId && isAdminViewing && (
					<div>
						<button
							type="button"
							onClick={() => {
								setSelectedSupplierId(null);
								setPage(1);
							}}
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
		const showItems = filteredItems.length > 0;
		const showEmptySearch =
			filteredItems.length === 0 && items.length > 0 && debouncedSearch !== "";
		const showApiEmpty = items.length === 0 || filteredItems.length === 0;

		return (
			<>
				<div className="relative w-full max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
					<input
						type="text"
						value={itemSearch}
						onChange={(e) => setItemSearch(e.target.value)}
						placeholder="Buscar item por descrição..."
						className="w-full bg-[#F4F7FA]/50 border border-slate-955/10 pl-10 pr-4 py-2.5 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
					/>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
					</div>
				) : showItems ? (
					<div className="space-y-3">
						{filteredItems.map((item) => {
							const total = Number(item.quantidade_total_ofertada ?? 0);
							const saldo = Number(item.quantidade_saldo_disponivel ?? 0);
							const pct = total > 0 ? Math.round((saldo / total) * 100) : 0;
							const saldoColor = pct > 50 ? "text-emerald-600" : pct > 20 ? "text-amber-600" : "text-red-600";
							const barColor = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-400" : "bg-red-400";
							return (
							<div
								key={item.id}
								className="border border-slate-955/10 bg-white p-4 hover:border-blue-600 hover:shadow-sm transition cursor-pointer"
							>
								<div className="flex gap-4">
									<div className="relative shrink-0 w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
										<ItemImage
											url={item.url_imagem}
											alt={item.descricao_especificacao}
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-4">
											<div>
												<span className="text-xs font-bold text-slate-500 font-sans uppercase tracking-wider">
													Item {item.numero_item}
												</span>
												<p className="text-sm text-slate-900 font-sans mt-0.5">
													{item.descricao_especificacao}
												</p>
											</div>
											<span className="text-sm font-bold font-sans text-slate-900 shrink-0 whitespace-nowrap">
												R${" "}
												{Number(item.valor_unitario).toLocaleString("pt-BR", {
													minimumFractionDigits: 2,
												})}
											</span>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs font-sans text-slate-500">
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
													Oferta Total
												</span>
												<span className="text-slate-900 font-medium">
													{total.toLocaleString("pt-BR")}
												</span>
											</div>
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
													Saldo Disponível
												</span>
												<span className={`font-medium ${saldoColor}`}>
													{saldo.toLocaleString("pt-BR")}
												</span>
											</div>
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
													Unidade
												</span>
												<span className="text-slate-900 font-medium">
													{item.unidade_medida || "—"}
												</span>
											</div>
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
													ATA
												</span>
												<span className="text-slate-900 font-medium">
													{item.ata?.numero_ata || "—"}
												</span>
											</div>
										</div>
										<div className="mt-3">
											<div className="flex justify-between items-center mb-1">
												<span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
													Saldo
												</span>
												<span className={`text-[9px] font-bold ${saldoColor}`}>
													{pct}%
												</span>
											</div>
											<div className="h-1.5 bg-slate-100 w-full">
												<div
													className={`h-full transition-all duration-700 ${barColor}`}
													style={{ width: `${Math.min(pct, 100)}%` }}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
							);
						})}
					</div>
				) : showEmptySearch ? (
					<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
						<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
						<p className="text-xs text-slate-500 font-sans">
							Nenhum item encontrado para essa busca.
						</p>
					</div>
				) : showApiEmpty ? (
					<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
						<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
						<p className="text-xs text-slate-500 font-sans">
							Nenhum item encontrado.
						</p>
					</div>
				) : null}

				{items.length > 0 && (
					<div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-955/10">
						<div className="flex items-center gap-1 flex-wrap justify-center">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							>
								<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
								<span>Anterior</span>
							</button>
							{(() => {
								const pages = getPageNumbers(page, totalPages);
								let ellipsisCount = 0;
								return pages.map((p) => {
									if (p === "ellipsis") {
										ellipsisCount++;
										return (
											<span
												key={`ellipsis-${ellipsisCount}`}
												className="inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 font-sans select-none"
											>
												...
											</span>
										);
									}
									return (
										<button
											key={`page-${p}`}
											onClick={() => setPage(p)}
											className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${
												p === page
													? "bg-slate-955 text-white border-slate-955"
													: "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"
											}`}
										>
											{p}
										</button>
									);
								});
							})()}
							<button
								onClick={() => setPage((p) => p + 1)}
								disabled={page >= totalPages}
								className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
							>
								<span>Próximo</span>
								<ChevronRight className="w-3.5 h-3.5 shrink-0" />
							</button>
						</div>
					</div>
				)}
			</>
		);
	}
}
