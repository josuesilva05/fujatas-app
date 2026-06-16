Projeto para desenvolver a estrutura de modelagem de dados e os módulos
recomendados para o desenvolvimento desse projeto de marketplace em
ambiente web.
1. Visão Geral do Sistema e Escopo
O objetivo do sistema é transformar o processo de gestão de Atas de Registro
de Preços em uma experiência de e-commerce público (Business to Government
- B2G). O sistema funcionará como uma vitrine digital onde:
• Órgãos Gerenciadores publicam as atas resultantes de licitações.
• Fornecedores têm suas empresas e propostas ganhas expostas no
catálogo.
• Órgãos Compradores navegam pelos itens, consultam as
especificações técnicas, analisam o saldo físico disponível e efetuam
solicitações de contratação ou adesão ("carona").
2. Modelagem de Dados (Entidades e Atributos)
Para suportar o cadastro exato das especificações, quantidades e preços
contidos nos modelos de atas, a arquitetura do banco de dados relacional deve
seguir a estrutura abaixo:
A. Entidade: Ata de Registro de Preços (AtaRegistroPrecos)
Guarda as informações de cabeçalho e os metadados legais do certame.
• id (Chave Primária)
• numero_ata: Identificador único (Ex: 004/2026/SEPLAG).
• processo_administrativo: O número do processo de origem (Ex: SEPLAG-
PRO-2026/02942).
• numero_pregao: O pregão eletrônico vinculado (Ex: №
003/2026/SEPLAG).
• orgao_gerenciador: Instituição responsável pela ata (Ex: SEPLAG-MT).
• data_assinatura / data_publicacao: Início da vigência do registro.
• vigencia_meses: Prazo de validade legal (geralmente estipulado em 12
meses).
• valor_total_global_ata: O valor teto homologado para a ata inteira.
B. Entidade: Fornecedor Ganhador (Fornecedor)
Cadastro das empresas detentoras dos preços registrados.
• id (Chave Primária)
• cnpj: Cadastro Nacional da Pessoa Jurídica da empresa detentora.
• razao_social: Nome empresarial (Ex: ATM SOLUÇÕES EM SERVIÇOS
LTDA).
• endereco_completo: Logradouro, bairro, município e CEP da sede.
• nome_representante e cpf_representante: Dados do responsável legal.
• contato_telefone e email: Canais eletrônicos diretos de comunicação com
o fornecedor.
C. Entidade: Grupo ou Lote (GrupoLote)
Atas complexas dividem seus itens em lotes ou grupos competitivos.
• id (Chave Primária)
• ata_id (Chave Estrangeira referenciando AtaRegistroPrecos)
• numero_grupo: Identificador numérico do lote (Ex: GRUPO 02).
• descricao_grupo: Resumo ou escopo macro daquele lote de itens.
D. Entidade: Item da Ata (ItemAta) — Core do Marketplace
Contém o produto/serviço, as especificações detalhadas, as quantidades
oferecidas e os preços de tabela.
• id (Chave Primária)
• ata_id (Chave Estrangeira)
• grupo_id (Chave Estrangeira, nula se o item for isolado).
• fornecedor_id (Chave Estrangeira vinculando a empresa que venceu o
item).
• numero_item: Código sequencial do item dentro da ata (Ex: ITEM 04,
ITEM 06).
• descricao_especificacao: Texto descritivo integral com as especificações
exigidas (Ex: "Locação de veículo SUV 07 lugares zero km..." ou "Serviço
especializado de motorista categoria D...").
• unidade_medida: Unidade de contratação (Ex: UND, POS, DIÁRIA).
• marca_modelo: Registra a marca/modelo do produto aceito no certame
(crucial para o fornecimento de bens).
• quantidade_total_ofertada: Quantidade volumétrica máxima inicial
oferecida pela empresa.
• quantidade_saldo_disponivel: Quantidade que decresce em tempo real
conforme os órgãos realizam pedidos.
• valor_unitario: O preço unitário registrado e imutável para aquele item.
E. Entidades de Controle de Consumo (Orgao e PedidoAdesao)
• Órgão (Orgao): Cadastro dos órgãos compradores (Ex: DETRAN, CASA
CIVIL, SESP). Mapeia também se o órgão é um "Participante Inicial" da
ata (participou do planejamento) ou se é um órgão externo ("Carona").
• Pedido de Adesão (PedidoAdesao): Funciona como o
"carrinho/checkout" do marketplace. Armazena o orgao_id, item_ata_id,
quantidade_solicitada, tipo_adesao (Participante ou Carona), data e o
status do pedido (Pendente, Autorizado, Empenhado).
3. Principais Módulos Funcionais do Sistema Web
Módulos 0: Módulos de Cadastros.
• Módulo de cadastro das entidades acima.
Módulo 1: Catálogo e Busca Avançada (Painel do Comprador)
• Busca Indexada por Palavras-chave: O comprador digita termos como
"SUV" ou "Motorista" e o sistema busca diretamente no campo
descricao_especificacao de todos os itens ativos.
• Filtros Comerciais: Filtrar resultados por menor preço unitário , marca ,
fornecedor , ou número da ata original.
• Vitrine de Saldo: Cada card de produto no marketplace deve exibir
claramente o preço unitário, a marca e um componente visual (como uma
barra de progresso) indicando a Quantidade Ganhador vs. Saldo
Restante.
Módulo 2: Fluxo de Pedido e Validação Automática de Regras (Checkout)
• Verificação de Perfil: Ao adicionar itens ao carrinho, o sistema identifica
se o órgão logado é Participante ou Carona.
• Trava Automática de Saldo (Carona): O sistema aplica as regras de
limite legal automaticamente. Se um órgão "Carona" tentar solicitar uma
quantidade que ultrapasse o limite permitido para adesões externas sobre
o item da ata, o sistema bloqueia o checkout emitindo um alerta.
• Cálculo de Subtotais e Totais: Multiplicação imediata da quantidade
desejada pelo preço unitário do item, gerando o montante global
necessário para o empenho.
Módulo 3: Painel Administrativo (Órgão Gerenciador)
• Carga de Dados e Upload de Atas: Tela para cadastro manual ou
importação automatizada da Ata de Registro de Preços e suas planilhas
de itens.
• Workflow de Autorização: Painel onde o Órgão Gerenciador visualiza os
pedidos de "Adesão Carona" solicitados pelos compradores no
marketplace, permitindo autorizar ou rejeitar eletronicamente antes de
liberar o saldo para empenho.
Módulo 4: Painel do Fornecedor
• Gerenciamento de Itens Ativos: Espaço para a empresa acompanhar
suas atas vigentes, ver quais itens estão publicados no catálogo e
monitorar o consumo de suas quantidades.
• Central de Notificações: Emissão de alertas automáticos via sistema e
e-mail sempre que um órgão público finalizar um pedido de contratação
do seu item, disponibilizando os dados cadastrais do comprador para
início do fornecimento do bem ou serviço.
4. Sugestão de Tecnologias para o Ambiente Web
• Frontend: React.js ou Next.js com TailwindCSS ou qualquer linguagem
de familiaridade do aluno, permitindo construir uma interface moderna de
e-commerce que seja responsiva e acessível para os servidores públicos.
• Backend: Node.js (TypeScript) ou Python (FastAPI) ou qualquer outra
linguagem de familiar do grupo. É fundamental implementar mecanismos
de Database Locks (bloqueios de banco de dados) para evitar condições
de corrida (garantindo que dois órgãos não consumam o mesmo saldo de
item ao mesmo tempo).
• Banco de Dados: PostgreSQL ou MySQL, devido à robustez necessária
para gerenciar relacionamentos complexos e chaves estrangeiras rígidas
entre Atas, Itens, Órgãos e Fornecedores.
