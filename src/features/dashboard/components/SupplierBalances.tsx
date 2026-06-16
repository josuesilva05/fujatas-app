import { useEffect, useState } from "react";
import {
	getSupplierBalances,
	type SupplierBalance,
} from "@/services/supplierService";

export default function SupplierBalances() {
	const [items, setItems] = useState<SupplierBalance[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

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

			<div className="bg-[#F8FAFE] border border-slate-955/10 p-5">
				{loading && <p>Carregando...</p>}

				{error && <p className="text-red-500">{error}</p>}

				{!loading && !error && (
					<div className="space-y-4">
						{items.length === 0 ? (
							<p>Nenhum item encontrado.</p>
						) : (
							items.map((item) => (
								<div key={item.id} className="border border-slate-200 p-4">
									<h3 className="font-semibold">Item {item.numero_item}</h3>

									<p className="text-sm text-slate-500">
										{item.descricao_especificacao}
									</p>

									<div className="grid grid-cols-2 gap-4 mt-3 text-sm">
										<div>Oferta Total: {item.quantidade_total_ofertada}</div>

										<div>
											Saldo Disponível: {item.quantidade_saldo_disponivel}
										</div>

										<div>Valor Unitário: R$ {item.valor_unitario}</div>

										<div>Ata: {item.ata?.numero_ata}</div>
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
}
