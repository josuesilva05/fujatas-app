import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	getSupplierBalances,
	type SupplierBalance,
} from "@/services/supplierService";

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

function BalanceProgressBar({ percentage }: { percentage: number }) {
	const clamped = Math.min(100, Math.max(0, percentage));
	const color =
		clamped >= 90
			? "bg-red-500"
			: clamped >= 70
				? "bg-amber-500"
				: "bg-emerald-500";

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-500 ${color}`}
					style={{ width: `${clamped}%` }}
				/>
			</div>
			<span className="text-xs font-medium text-slate-500 tabular-nums w-10 text-right">
				{clamped}%
			</span>
		</div>
	);
}

export default function SupplierBalances() {
	const navigate = useNavigate();
	const [items, setItems] = useState<SupplierBalance[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

	console.log("RENDERIZANDO SUPPLIER BALANCES");

	useEffect(() => {
		console.log("SUPPLIER BALANCES MONTADO");

		const session = JSON.parse(localStorage.getItem("biap_user") || "{}");

		console.log("SESSION:", session);

		const fornecedorId = session.fornecedor_id;

		console.log("FORNECEDOR ID:", fornecedorId);

		if (!fornecedorId) {
			console.error("FORNECEDOR NÃO ENCONTRADO");

			setError("Fornecedor não identificado.");
			setLoading(false);
			return;
		}

		console.log("CHAMANDO API getSupplierBalances:", fornecedorId);

		getSupplierBalances(fornecedorId)
			.then((data) => {
				console.log("DADOS RECEBIDOS:", data);
				setItems(data);
			})
			.catch((err) => {
				console.error("ERRO AO CARREGAR SALDOS:", err);

				setError("Erro ao carregar saldos.");
			})
			.finally(() => {
				console.log("FINALIZOU REQUISIÇÃO");
				setLoading(false);
			});
	}, []);

	const filteredItems = useMemo(() => {
		if (!search.trim()) return items;
		const term = search.toLowerCase();
		return items.filter(
			(item) =>
				item.descricao_especificacao?.toLowerCase().includes(term) ||
				item.ata?.numero_ata?.toLowerCase().includes(term) ||
				item.marca_modelo?.toLowerCase().includes(term),
		);
	}, [items, search]);

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 3;
	const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);
	const goToPage = (page: number) =>
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);
	const hasNext = currentPage < totalPages;
	const hasPrev = currentPage > 1;

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block uppercase">
					MÓDULO FORNECEDOR • CONTABILIDADE PÚBLICA
				</span>

				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Saldos do Licitante
				</h2>
			</div>

			<div className="flex gap-4 border-b border-slate-200 pb-0">
				<button
					type="button"
					onClick={() => navigate("/fornecedor/saldos")}
					className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer -mb-[1px] border-slate-955 text-slate-955"
				>
					Central de Saldos
				</button>
				<button
					type="button"
					onClick={() => navigate("/fornecedor/vendas")}
					className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
				>
					Notificações de Vendas
				</button>
			</div>

			<div className="bg-[#F8FAFE] border border-slate-955/10 p-5">
				{loading && <p>Carregando...</p>}

				{error && <p className="text-red-500">{error}</p>}

				{!loading && !error && (
					<div className="space-y-4">
						{/* Busca */}
						<div className="relative max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								type="text"
								placeholder="Buscar por descrição, ata ou marca..."
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									goToPage(1);
								}}
								className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 bg-white rounded-md outline-none focus:border-slate-955/30 focus:ring-1 focus:ring-slate-955/10 transition"
							/>
						</div>

						{filteredItems.length === 0 ? (
							<p>
								{search
									? "Nenhum item encontrado para esta busca."
									: "Nenhum item encontrado."}
							</p>
						) : (
							<>
								{paginatedItems.map((item) => {
									const total = item.quantidade_total_ofertada ?? 0;
									const saldo = item.quantidade_saldo_disponivel ?? 0;
									const consumido =
										total > 0 ? Math.round(((total - saldo) / total) * 100) : 0;

									return (
										<div
											key={item.id}
											className="border border-slate-200 p-4 hover:bg-slate-50/50 transition-colors"
										>
											<div className="flex gap-4">
												<div className="relative shrink-0 w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
													<div className="absolute inset-0 flex items-center justify-center">
														<Package className="w-5 h-5 text-slate-300" />
													</div>
													{item.url_imagem && (
														<img
															src={item.url_imagem}
															alt={
																item.descricao_especificacao
																	? `Imagem do item ${item.descricao_especificacao}`
																	: "Imagem do item"
															}
															className="relative z-10 w-full h-full object-cover"
															onError={(e) => {
																e.currentTarget.style.display = "none";
															}}
														/>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-slate-900">
														Item {item.numero_item}
													</h3>
													<p className="text-sm text-slate-500 truncate">
														{item.descricao_especificacao}
													</p>
													{item.marca_modelo && (
														<p className="text-xs text-slate-400 mt-0.5">
															{item.marca_modelo}
														</p>
													)}
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
														<div>
															<span className="text-slate-400">
																Oferta Total:
															</span>{" "}
															<strong>{total}</strong>
														</div>
														<div>
															<span className="text-slate-400">
																Saldo Disponível:
															</span>{" "}
															<strong className="text-emerald-600">
																{saldo}
															</strong>
														</div>
														<div>
															<span className="text-slate-400">
																Valor Unitário:
															</span>{" "}
															<strong>R$ {item.valor_unitario}</strong>
														</div>
														<div>
															<span className="text-slate-400">Ata:</span>{" "}
															<strong>{item.ata?.numero_ata}</strong>
														</div>
													</div>
													{total > 0 && (
														<div className="mt-2">
															<BalanceProgressBar percentage={consumido} />
														</div>
													)}
												</div>
											</div>
										</div>
									);
								})}
								{filteredItems.length > 3 && (
									<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-955/10">
										<span className="text-xs text-slate-500 font-sans order-2 sm:order-1">
											{filteredItems.length} item
											{filteredItems.length !== 1 ? "ns" : ""} encontrado
											{filteredItems.length !== 1 ? "s" : ""}
										</span>
										<div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
											<button
												onClick={prevPage}
												disabled={!hasPrev}
												className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium font-sans border border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
											>
												<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
												<span>Anterior</span>
											</button>
											{(() => {
												const pages = getPageNumbers(currentPage, totalPages);
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
															onClick={() => goToPage(p)}
															className={`inline-flex items-center justify-center min-w-8 h-8 px-2.5 text-xs font-medium font-sans border transition cursor-pointer ${p === currentPage ? "bg-slate-955 text-white border-slate-955" : "border-slate-955/10 bg-white text-slate-600 hover:bg-slate-50"}`}
														>
															{p}
														</button>
													);
												});
											})()}
											<button
												onClick={nextPage}
												disabled={!hasNext}
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
					</div>
				)}
			</div>
		</div>
	);
}
