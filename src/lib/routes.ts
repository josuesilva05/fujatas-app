export const ROLE_ROUTES: Record<string, { path: string; label: string }> = {
  COMPRADOR: { path: "comprador", label: "Comprador" },
  ADMIN_GERENCIADOR: { path: "gerenciador", label: "Gerenciador" },
  FORNECEDOR: { path: "fornecedor", label: "Fornecedor" },
};

export const TAB_ROUTES: Record<
  string,
  Record<string, { path: string; label: string }>
> = {
  COMPRADOR: {
    vitrine: { path: "vitrine", label: "Catálogo" },
    carrinho: { path: "carrinho", label: "Carrinho" },
    pedidos: { path: "pedidos", label: "Meus Pedidos" },
  },
  ADMIN_GERENCIADOR: {
    autorizacoes: { path: "autorizacoes", label: "Autorizações" },
    cadastro: { path: "cadastro", label: "Upload ATA" },
    monitoramento: { path: "monitoramento", label: "Monitoramento" },
  },
  FORNECEDOR: {
    saldos: { path: "saldos", label: "Central de Saldos" },
    vendas: { path: "vendas", label: "Notificações" },
  },
};

export const ROLE_BY_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_ROUTES).map(([role, { path }]) => [path, role]),
);

export const TAB_BY_PATH: Record<string, Record<string, string>> = {};
for (const [role, tabs] of Object.entries(TAB_ROUTES)) {
  TAB_BY_PATH[role] = Object.fromEntries(
    Object.entries(tabs).map(([tab, { path }]) => [path, tab]),
  );
}

export const ROLE_DEFAULTS: Record<string, string> = {
  COMPRADOR: "vitrine",
  ADMIN_GERENCIADOR: "autorizacoes",
  FORNECEDOR: "saldos",
};

export function roleToPath(role: string): string {
  return ROLE_ROUTES[role]?.path ?? "comprador";
}

export function pathToRole(path: string): string {
  return ROLE_BY_PATH[path] ?? "COMPRADOR";
}

export function tabToPath(role: string, tab: string): string {
  return TAB_ROUTES[role]?.[tab]?.path ?? tab;
}

export function pathToTab(role: string, path: string): string {
  return TAB_BY_PATH[role]?.[path] ?? role;
}
