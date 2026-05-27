# Fujatas App - React + TypeScript + Vite

Este projeto é uma aplicação moderna desenvolvida com **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4** e **Biome** para linting e formatação rápida.

A base de código foi reestruturada para seguir a arquitetura **Feature-Based (Baseada em Funcionalidades/Domínios)**, tornando-a altamente escalável, robusta e modular.

---

## 📁 Arquitetura de Pastas

O projeto utiliza uma divisão clara entre componentes de infraestrutura global e módulos verticais de negócios (**features**). A estrutura principal do diretório `src/` está organizada da seguinte forma:

```text
src/
├── assets/            # Imagens, fontes, ícones e SVGs estáticos
├── components/        # Componentes genéricos globais e altamente reutilizáveis
│   └── ui/            # Componentes visuais atômicos básicos (e.g., Button, Card)
├── context/           # React Contexts globais (e.g., Auth, Theme)
├── features/          # Funcionalidades / Domínios verticais de negócio
│   ├── dashboard/     # Exemplo: Módulo de Dashboard
│   │   ├── components/# Componentes exclusivos do Dashboard (StatsSection, TipsSection)
│   │   └── index.ts   # Public API: Exporta apenas o que o restante do app precisa ver
│   └── feedback/      # Exemplo: Módulo de Feedback/Contato
│       ├── components/# Formulário e subcomponentes exclusivos
│       └── index.ts   # Public API: Exporta apenas o componente de formulário
├── hooks/             # Custom hooks globais e reutilizáveis (e.g., useLocalStorage)
├── layouts/           # Componentes estruturais de layout de página (e.g., DashboardLayout)
├── pages/             # Páginas da aplicação que apenas compõem as features e layouts
│   └── TestPage.tsx   # Página de teste que monta o dashboard e formulário
├── router/            # Configuração do roteador da aplicação
├── services/          # Clientes HTTP, chamadas de API globais (Axios, Fetch, etc.)
├── styles/            # Estilos centralizados e arquivos CSS globais
│   ├── App.css        # Estilos específicos da estrutura inicial do App
│   └── global.css     # Estilos globais e importação do Tailwind CSS v4
├── types/             # Definições de tipo globais do TypeScript
├── utils/             # Funções utilitárias puras (e.g., formatadores de data ou moedas)
├── App.tsx            # Componente raiz da aplicação
└── main.tsx           # Ponto de entrada que inicializa a renderização do React
```

### 🧩 Pilares da Arquitetura

1. **Alta Coesão e Isolamento (Módulos)**: Cada funcionalidade no diretório `src/features/` agrupa todo o código necessário para o seu funcionamento (componentes exclusivos, tipos, chamadas de API, hooks).
2. **Public API (`index.ts`)**: Cada feature possui um ponto de entrada `index.ts` que exporta explicitamente quais componentes podem ser consumidos por fora. Isso impede o acoplamento excessivo de arquivos internos.
3. **Aliases de Importação (`@/*`)**: Configurado para facilitar a legibilidade e evitar caminhos relativos longos (como `../../../../`). O alias `@` aponta diretamente para o diretório `/src`.

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para rodar e testar a aplicação localmente.

### Pré-requisitos
* **Node.js** (versão 18 ou superior recomendada)
* **npm** (ou yarn/pnpm se preferir)

### 1. Instalar as Dependências
Abra o terminal no diretório do projeto e execute:
```bash
npm install
```

### 2. Executar o Servidor de Desenvolvimento
Inicie o servidor local com o comando:
```bash
npm run dev
```
O Vite iniciará o servidor de desenvolvimento, geralmente acessível em `http://localhost:5173`. O suporte a HMR (Hot Module Replacement) garante atualizações instantâneas no navegador.

### 3. Gerar Build de Produção
Para buildar o projeto compilando os tipos TypeScript e minificando os arquivos finais:
```bash
npm run build
```
Os arquivos gerados serão salvos no diretório `/dist`.

### 4. Visualizar o Build de Produção Localmente
Após buildar o projeto, você pode rodar um servidor de preview local para simular o ambiente de produção:
```bash
npm run preview
```

---

## 🧼 Padronização de Código com Biome

Este projeto utiliza o **Biome** como ferramenta única e ultra-rápida para linting e formatação.

* **Validar formatação e linting**:
  ```bash
  npm run lint
  ```
* **Auto-formatar e corrigir erros de lint automaticamente**:
  ```bash
  npx biome check --write .
  ```

---

## 💡 Melhores Práticas para Novos Componentes

Ao expandir o projeto, siga o fluxo abaixo:

1. Se você estiver criando um componente genérico (ex: um Input personalizado, um Dropdown genérico), adicione-o em `src/components/ui/`.
2. Se você estiver adicionando uma funcionalidade específica (ex: um Perfil de Usuário), crie uma nova pasta em `src/features/user-profile/`:
   * Adicione subcomponentes em `components/`.
   * Crie uma Public API exportando o componente principal em `index.ts`.
   * Crie a página correspondente em `src/pages/` consumindo `@/features/user-profile`.

---

## 🌳 Fluxo de Trabalho e Padronização (Git)

Para manter o repositório organizado, o histórico de commits limpo e inteligível, adotamos boas práticas de desenvolvimento baseadas em branches bem estruturadas e **Conventional Commits**.

### 🌿 Desenvolvimento com Branches

Toda e qualquer nova funcionalidade, correção ou melhoria deve ser desenvolvida em uma branch separada criada a partir da branch principal (`main`).

#### Nomenclatura das Branches
Utilizamos prefixos claros que indicam a intenção da alteração no código:

* **`feat/` ou `feature/`**: Desenvolvimento de novas funcionalidades.
  * *Exemplo:* `feature/login-social`
* **`fix/` ou `bugfix/`**: Correção de bugs.
  * *Exemplo:* `fix/erro-validacao-senha`
* **`hotfix/`**: Correção urgente e imediata para produção.
  * *Exemplo:* `hotfix/crash-ao-salvar-dados`
* **`docs/`**: Alterações exclusivas na documentação.
  * *Exemplo:* `docs/guia-de-commits`
* **`refactor/`**: Melhoria ou reestruturação interna de código sem alterar o comportamento externo.
  * *Exemplo:* `refactor/otimizacao-dashboard`
* **`chore/`**: Tarefas de manutenção do projeto (como atualizar dependências, scripts de build, configurações de ferramentas).
  * *Exemplo:* `chore/atualiza-dependencias`

---

### ✍️ Commits Bem Estruturados (Conventional Commits)

Adotamos a convenção de commits para garantir um histórico padronizado, de fácil leitura e que viabilize a automação de releases.

#### Estrutura da Mensagem
```text
<tipo>[escopo opcional]: <descrição curta em letras minúsculas>

[corpo opcional com mais detalhes das alterações feitas]

[rodapé opcional com referências a tarefas/issues, e.g., Closes #142]
```

#### Tipos Principais de Commit
* **`feat`**: Adiciona uma nova funcionalidade (feature) ao sistema.
  * *Exemplo:* `feat(auth): adiciona login com conta do google`
* **`fix`**: Corrige um bug ou problema operacional.
  * *Exemplo:* `fix(checkout): corrige cálculo de frete com desconto`
* **`docs`**: Mudanças exclusivas na documentação (como este README).
  * *Exemplo:* `docs: atualiza guia de desenvolvimento do projeto`
* **`style`**: Alterações de estilo de código que não afetam seu comportamento lógico (espaços, linting com Biome, ponto e vírgula, formatação).
  * *Exemplo:* `style: formata arquivos com o biome`
* **`refactor`**: Mudanças no código que não corrigem um bug nem adicionam uma funcionalidade, com o objetivo de melhorar a estrutura.
  * *Exemplo:* `refactor(ui): simplifica estados internos do modal de feedback`
* **`perf`**: Alteração que melhora a performance da aplicação.
  * *Exemplo:* `perf(dashboard): otimiza renderização de gráficos complexos`
* **`test`**: Criação ou ajuste de testes automatizados.
  * *Exemplo:* `test(hooks): adiciona testes unitários para useLocalStorage`
* **`chore`**: Tarefas menores ou de infraestrutura que não alteram código fonte de produção.
  * *Exemplo:* `chore: atualiza versao do typescript`

#### Boas Práticas Recomendadas
1. **Mensagens no imperativo/presente**: Use "adiciona", "corrige", "cria" em vez de "adicionado", "corrigido", "criado".
2. **Commits Atômicos**: Procure fazer commits focados e pequenos. É muito melhor ter vários commits explicando passos específicos do que um único commit gigante misturando múltiplos tópicos.
3. **Escopo explícito**: Sempre que fizer alterações em uma área específica do código, informe o escopo entre parênteses para maior precisão (exemplo: `feat(ui): ...`, `fix(auth): ...`).

