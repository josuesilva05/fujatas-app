import { useEffect, useState } from "react";
import {
	getSupplierOrders,
	type SupplierOrder,
} from "@/services/supplierService";

export default function SupplierSales() {
	const [orders, setOrders] = useState<SupplierOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const session = JSON.parse(
			localStorage.getItem("biap_user") || "{}",
		);

		const fornecedorId = session.fornecedor_id;

		if (!fornecedorId) {
			setError("Fornecedor não identificado.");
			setLoading(false);
			return;
		}

		getSupplierOrders(fornecedorId)
			.then(setOrders)
			.catch((err) => {
				console.error(err);
				setError("Erro ao carregar pedidos.");
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Editorial Section Title */}
			<div className="border-b border-slate-955/10 pb-4">
				<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block uppercase">
					MÓDULO FORNECEDOR • FLUXO DE VENDAS
				</span>

				<h2 className="text-2xl font-light font-display text-slate-955 uppercase tracking-wide">
					Central de Notificações de Vendas
				</h2>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* COLUNA PRINCIPAL */}
				<div className="lg:col-span-8 space-y-4">
					{loading && (
						<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center">
							Carregando pedidos...
						</div>
					)}

					{error && (
						<div className="border border-red-200 bg-red-50 p-4 text-red-600">
							{error}
						</div>
					)}

					{!loading && !error && orders.length === 0 && (
						<div className="border border-dashed border-slate-950/20 bg-[#FAF9F5] p-12 text-center">
							Nenhum pedido encontrado.
						</div>
					)}

					{!loading &&
						!error &&
						orders.map((order) => (
							<div
								key={order.id}
								className="border border-slate-950/10 bg-[#FAF9F5] p-5"
							>
								<div className="flex justify-between items-start border-b border-slate-950/10 pb-3 mb-3">
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
										<strong>Tipo:</strong>{" "}
										{order.tipo_adesao}
									</div>

									<div>
										<strong>Itens:</strong>{" "}
										{order.itens?.length ?? 0}
									</div>

									<div>
										<strong>Data:</strong>{" "}
										{new Date(
											order.data_pedido,
										).toLocaleDateString("pt-BR")}
									</div>

									<div>
										<strong>ID:</strong>{" "}
										{order.id.slice(0, 8)}
									</div>
								</div>
							</div>
						))}
				</div>

				{/* COLUNA LATERAL */}
				<div className="lg:col-span-4 bg-[#FAF9F5] border border-slate-955/10 p-5 space-y-5">
					<span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 block border-b border-slate-955/10 pb-2">
						§ FATURAMENTO E LOGÍSTICA
					</span>

					<div className="space-y-4 font-sans text-xs text-slate-500">
						<p className="leading-relaxed text-xs">
							O trâmite logístico exige a associação da chave de
							acesso ou número da NF-e para liberação do pagamento
							financeiro pela administração pública.
						</p>

						<div className="border border-slate-950/10 p-4 bg-[#F7F6F2]/50">
							<div className="flex justify-between mb-2">
								<span>Total de Pedidos</span>
								<strong>{orders.length}</strong>
							</div>

							<div className="flex justify-between mb-2">
								<span>Pendentes</span>
								<strong>
									{
										orders.filter(
											(o) =>
												o.status === "PENDENTE",
										).length
									}
								</strong>
							</div>

							<div className="flex justify-between">
								<span>Autorizados</span>
								<strong>
									{
										orders.filter(
											(o) =>
												o.status ===
												"AUTORIZADO",
										).length
									}
								</strong>
							</div>
						</div>

						<div className="border border-slate-950/10 p-4 bg-[#F7F6F2]/50">
							<p className="font-bold text-[10px] uppercase tracking-wide mb-2">
								Última atualização
							</p>

							<p>
								{new Date().toLocaleString("pt-BR")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}