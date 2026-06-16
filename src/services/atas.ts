import { api } from "./api";

/* ─── Response types from OpenAPI ─── */

export interface OrgaoResponse {
  id: string;
  cnpj: string;
  nome: string;
  tipo: "FEDERAL" | "ESTADUAL" | "MUNICIPAL";
  endereco?: string;
}

export interface AtaResponse {
  id: string;
  numero_ata: string;
  processo_administrativo?: string;
  numero_pregao?: string;
  orgao_gerenciador_id: string;
  data_assinatura?: string;
  data_publicacao?: string;
  vigencia_meses: number;
  valor_total_global?: number;
}

export interface GrupoLoteResponse {
  id: string;
  numero_grupo?: string;
  descricao?: string;
}

export interface ItemAtaParticipanteResponse {
  id: string;
  item_ata_id: string;
  orgao_id: string;
  quantidade_planejada: string;
  orgao?: OrgaoResponse;
}

export interface ItemAtaResponse {
  id: string;
  ata_id: string;
  grupo_id?: string;
  fornecedor_id: string;
  numero_item?: string;
  descricao_especificacao: string;
  unidade_medida?: string;
  marca_modelo?: string;
  url_imagem?: string;
  valor_unitario: string;
  quantidade_total_ofertada: string;
  participantes?: ItemAtaParticipanteResponse[];
}

export interface RegraLimiteCaronaResponse {
  id: string;
  percentual_maximo_do_saldo: string;
  descricao?: string;
}

export interface AtaDetailResponse {
  id: string;
  numero_ata: string;
  processo_administrativo?: string;
  numero_pregao?: string;
  orgao_gerenciador_id: string;
  data_assinatura?: string;
  data_publicacao?: string;
  vigencia_meses: number;
  valor_total_global?: number;
  orgao_gerenciador: OrgaoResponse;
  grupos: GrupoLoteResponse[];
  items: ItemAtaResponse[];
  regras_carona: RegraLimiteCaronaResponse[];
}

export interface VwSaldoItemAtaResponse {
  id: string;
  ata_id: string;
  fornecedor_id: string;
  quantidade_total_ofertada: string;
  quantidade_consumida_participantes: string;
  quantidade_consumida_caronas: string;
  quantidade_consumida: string;
  quantidade_saldo_disponivel: string;
}

export interface FornecedorResponse {
  id: string;
  cnpj: string;
  razao_social: string;
  endereco?: string;
  nome_representante?: string;
  cpf_representante?: string;
  telefone?: string;
  email?: string;
}

export interface ItemSearchResponse {
  id: string;
  numero_item?: string;
  descricao_especificacao: string;
  unidade_medida?: string;
  marca_modelo?: string;
  url_imagem?: string;
  valor_unitario: string;
  quantidade_total_ofertada: string;
  quantidade_saldo_disponivel: string;
  fornecedor: FornecedorResponse;
  ata: AtaResponse;
  grupo?: GrupoLoteResponse;
}

/* ─── ATA CRUD ─── */

export async function listAtas(skip = 0, limit = 100): Promise<AtaResponse[]> {
  const response = await api.get<AtaResponse[]>("/atas", {
    params: { skip, limit },
  });
  return response.data;
}

export async function getAta(id: string): Promise<AtaDetailResponse> {
  const response = await api.get<AtaDetailResponse>(`/atas/${id}`);
  return response.data;
}

export async function getAtaBalances(
  id: string,
): Promise<VwSaldoItemAtaResponse[]> {
  const response = await api.get<VwSaldoItemAtaResponse[]>(
    `/atas/${id}/balances`,
  );
  return response.data;
}

export async function getItemBalance(
  itemAtaId: string,
): Promise<VwSaldoItemAtaResponse> {
  const response = await api.get<VwSaldoItemAtaResponse>(
    `/atas/balances/item/${itemAtaId}`,
  );
  return response.data;
}

/* ─── CATALOG SEARCH (Marketplace Vitrine) ─── */

export interface SearchItemsParams {
  q?: string;
  min_price?: number;
  max_price?: number;
  marca?: string;
  fornecedor_id?: string;
  numero_ata?: string;
  sort?: "price_asc" | "price_desc";
  skip?: number;
  limit?: number;
}

export async function searchItems(
  params: SearchItemsParams = {},
): Promise<ItemSearchResponse[]> {
  const response = await api.get<ItemSearchResponse[]>("/items/search", {
    params,
  });
  return response.data;
}

/* ─── SUPPLIERS ─── */

export async function listSuppliers(
  skip = 0,
  limit = 100,
): Promise<FornecedorResponse[]> {
  const response = await api.get<FornecedorResponse[]>("/suppliers", {
    params: { skip, limit },
  });
  return response.data;
}

/* ─── Create payload types ─── */

export interface ItemParticipantePayload {
  orgao_id: string;
  quantidade_planejada: number;
}

export interface AtaCreatePayload {
  numero_ata: string;
  processo_administrativo?: string;
  numero_pregao?: string;
  orgao_gerenciador_id: string;
  data_assinatura?: string;
  data_publicacao?: string;
  vigencia_meses: number;
  valor_total_global?: number;
  grupos: {
    numero_grupo: string;
    descricao?: string;
  }[];
  regras_carona: {
    percentual_maximo_do_saldo: number;
    descricao?: string;
  }[];
  items: {
    grupo_numero?: string;
    fornecedor_id: string;
    numero_item?: string;
    descricao_especificacao: string;
    unidade_medida?: string;
    marca_modelo?: string;
    valor_unitario: number;
    quantidade_total_ofertada?: number;
    participantes: ItemParticipantePayload[];
  }[];
}

export async function createAta(payload: AtaCreatePayload) {
  const response = await api.post("/atas", payload);
  return response.data;
}
