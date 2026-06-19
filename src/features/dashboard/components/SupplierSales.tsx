import {
	Banknote,
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
import { getSupplierOrders } from "@/services/supplierService";
import type { FornecedorResponse, SupplierOrder } from "@/types/supplier";

interface SupplierSalesProps {
	user: {
		id: string;
		email: string;
		papel: string;
		orgao_id: string | null;
		fornecedor_id: string | null;
	};
}

export default function SupplierSales({ user }: SupplierSalesProps) {
	const { role: rolePath } = useParams();
	const role = rolePath ?? "fornecedor";

	const isAdminViewing =
		user.papel === "ADMIN_GERENCIADOR" && !user.fornecedor_id;

	const [suppliers, setSuppliers] = useState<FornecedorResponse[]>([]);
	const [loadingSuppliers, setLoadingSuppliers] = useState(false);

	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);
	const [orders, setOrders] = useState<SupplierOrder[]>([]);
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
		getSupplierOrders(id)
			.then(setOrders)
			.catch(() => setError("Erro ao carregar pedidos."))
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
								MÓDULO FORNECEDOR • NOTIFICAÇÕES
							</span>
							<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
								{selectedSupplierId
									? `Pedidos — ${selectedSupplier?.razao_social ?? ""}`
									: "Central de Notificações"}
							</h2>
							<Breadcrumb className="mt-4">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink
											asChild
											className="text-[10px] font-semibold tracking-wider uppercase hover:text-slate-700"
										>
											<Link to={`/${role}/saldos`}>Itens Ativos</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
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
													Notificações
												</BreadcrumbPage>
											</BreadcrumbItem>
										</>
									)}
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<Link
								to={`/${role}/saldos`}
								className="border border-slate-950/8 px-3 py-1.5 text-xs font-sans font-medium text-slate-600 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer flex items-center gap-1.5 rounded-none"
							>
								<Banknote className="w-3.5 h-3.5" />
								<span>Itens Ativos</span>
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
						{renderOrders()}
					</div>
				)}

				{!isAdminViewing && user.fornecedor_id && renderOrders()}
			</div>
		</div>
	);

	function renderOrders() {
		if (loading) {
			return (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
				</div>
			);
		}

		if (orders.length === 0) {
			return (
				<div className="border border-dashed border-slate-955/10 bg-[#F8FAFE] p-10 text-center">
					<Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
					<p className="text-xs text-slate-500 font-sans">
						Nenhum pedido encontrado.
					</p>
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<div className="lg:col-span-8 space-y-4">
					{orders.map((order) => (
						<div
							key={order.id}
							className="border border-blue-950/8 bg-[#F8FAFE] p-5"
						>
							<div className="flex justify-between items-start border-b border-blue-950/8 pb-3 mb-3">
								<div>
									<h3 className="font-semibold text-slate-900">
										{order.orgao_comprador?.nome}
									</h3>
									<p className="text-xs text-slate-500">
										{order.orgao_comprador?.cnpj}
									</p>
								</div>
								<span className="text-xs font-bold px-3 py-1 border border-slate-300">
									{order.status}
								</span>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
								<div>
									<strong>Tipo:</strong> {order.tipo_adesao}
								</div>
								<div>
									<strong>Itens:</strong> {order.itens?.length ?? 0}
								</div>
								<div>
									<strong>Data:</strong>{" "}
									{new Date(order.data_pedido).toLocaleDateString("pt-BR")}
								</div>
								<div>
									<strong>ID:</strong> {order.id.slice(0, 8)}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="lg:col-span-4 bg-[#F8FAFE] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 block border-b border-slate-955/10 pb-2 uppercase">
						§ FATURAMENTO E LOGÍSTICA
					</span>
					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite logístico exige a associação da chave de acesso ou
							número da NF-e para liberação do pagamento financeiro pela
							administração pública.
						</p>
						<div className="border border-blue-950/8 p-4 bg-[#F4F7FA]/50">
							<div className="flex justify-between mb-2">
								<span>Total de Pedidos</span>
								<strong>{orders.length}</strong>
							</div>
							<div className="flex justify-between mb-2">
								<span>Pendentes</span>
								<strong>
									{orders.filter((o) => o.status === "PENDENTE").length}
								</strong>
							</div>
							<div className="flex justify-between">
								<span>Autorizados</span>
								<strong>
									{orders.filter((o) => o.status === "AUTORIZADO").length}
								</strong>
							</div>
						</div>
						<div className="border border-blue-950/8 p-4 bg-[#F4F7FA]/50">
							<p className="font-bold text-[10px] uppercase tracking-wide mb-2">
								Última atualização
							</p>
							<p>{new Date().toLocaleString("pt-BR")}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}