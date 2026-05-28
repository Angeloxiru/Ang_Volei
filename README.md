Especificação Técnica
App PWA de Gestão e Balanceamento de Times de Vôlei
Documento de briefing para desenvolvimento
Versão 1.0
Stack: GitHub Pages (PWA) + Google Apps Script + Google Sheets
 
Sumário
Sumário	1
1. Visão Geral do Produto	1
1.1. Objetivos	1
1.2. Perfis de Usuário	1
2. Arquitetura	1
2.1. Decisões de arquitetura obrigatórias	1
3. Modelo de Dados (abas da planilha Google)	1
3.1. Aba Jogadores	1
3.2. Aba Jogos	1
3.3. Aba Avaliacoes	1
3.4. Aba Scores (calculada / cache)	1
3.5. Aba Times_Historico	1
4. Cálculo de Score (ponderado por recência)	1
4.1. Fórmula	1
4.2. Quando recalcular	1
5. Autenticação e Segurança	1
5.1. Tela inicial	1
5.2. Requisitos de segurança	1
6. Fluxo Funcional Semanal	1
7. Telas e Funcionalidades (front PWA)	1
7.1. Login / Cadastro	1
7.2. Lista de Jogadores (todos)	1
7.3. Avaliação (somente ADM)	1
7.4. Gerar Times (somente ADM)	1
7.5. Histórico (todos)	1
7.6. Requisitos de PWA	1
8. Algoritmo de Montagem dos Times	1
8.1. Prioridades (na ordem)	1
8.2. Abordagem sugerida	1
8.3. Função de custo (referência)	1
8.4. Saída esperada	1
9. Contrato de API (Apps Script)	1
10. Estrutura do Repositório GitHub	1
10.1. Configuração do GitHub Pages	1
10.2. Regra de manutenção da documentação	1
11. Entregáveis Esperados do Desenvolvedor	1
12. Itens em Aberto / A Confirmar com o Cliente	1

 
1. Visão Geral do Produto
Aplicação web progressiva (PWA) para um grupo de aproximadamente 30 amigos que jogam vôlei semanalmente. A cada semana, 18 jogadores comparecem e são divididos em 3 times de 6. O objetivo central do sistema é montar times equilibrados automaticamente, com base em estatísticas de habilidade coletadas via avaliações pós-jogo.
1.1. Objetivos
•	Manter um cadastro de jogadores com atributos físicos (altura, idade, peso, sexo).
•	Permitir que administradores avaliem as habilidades de cada jogador após os jogos.
•	Calcular um score por habilidade para cada jogador, ponderado por recência (jogos recentes pesam mais).
•	Gerar automaticamente 3 times equilibrados a partir dos 18 presentes na semana.
•	Manter histórico visível das divisões de cada semana.
1.2. Perfis de Usuário
Perfil	Permissões
Administrador (ADM)	Tudo que o jogador pode fazer + avaliar jogadores + abrir/fechar jogos + gerar e salvar times. A definição de quem é ADM é feita manualmente pelo dono na planilha.
Jogador	Visualizar lista de jogadores, ver seus próprios scores, ver os times montados em cada semana e o histórico. Não avalia.
Nota de gestão: a atribuição de papel (ADM x Jogador) é feita manualmente pelo dono editando uma coluna na planilha. O sistema apenas lê esse valor; não há tela de administração de papéis.
2. Arquitetura
O front-end é estático e hospedado no GitHub Pages. Ele não acessa a planilha diretamente (não é possível esconder credenciais em um site estático). Toda leitura e escrita passa por um Google Apps Script publicado como Web App, que atua como camada de API e única detentora do acesso à planilha.
[ GitHub Pages : PWA estático (HTML/CSS/JS) ]
            |  HTTPS fetch() (JSON)
            v
[ Google Apps Script : Web App / API + auth + lógica ]
            |  SpreadsheetApp
            v
[ Google Sheets : banco de dados (abas) ]
2.1. Decisões de arquitetura obrigatórias
•	Sem credenciais no front: o front nunca recebe a chave da planilha. Comunica-se apenas com a URL pública do Web App.
•	CORS: o Apps Script publicado como Web App responde a requisições do domínio do GitHub Pages. Atenção ao tratamento de requisições (o Apps Script tem particularidades com preflight/POST — o dev deve usar o padrão de POST com content-type text/plain ou contornar via doGet/doPost conforme apropriado).
•	Autenticação própria: login/senha gerenciado na própria planilha (ver seção 5). Não usar login do Google obrigatório, para não forçar conta Google a todos os jogadores.
 
3. Modelo de Dados (abas da planilha Google)
3.1. Aba Jogadores
Campo	Tipo	Descrição
id	string	Identificador único (UUID), gerado no cadastro
nome	string	Nome do jogador
login	string	Usado no login (único)
senha_hash	string	Hash da senha (nunca texto puro — ver seção 5)
papel	ADM | JOGADOR	Definido manualmente pelo dono
sexo	M | F	Usado no balanceamento
altura_cm	inteiro	Semente do balanceamento (snake draft)
idade	inteiro	Informativo
peso_kg	inteiro	Informativo
ativo	booleano	Permite desativar sem apagar histórico
data_cadastro	datetime	Data de criação
3.2. Aba Jogos
Campo	Tipo	Descrição
id_jogo	string	UUID do jogo/rodada
data	date	Data do jogo
jogadores_presentes	lista de ids	Os 18 presentes naquela semana
status	aberto | avaliacao | fechado	Controla o fluxo (ver seção 6)
3.3. Aba Avaliacoes
Uma linha por combinação avaliador → avaliado → jogo. Como apenas ADMs avaliam, e há poucos ADMs, o volume é controlado.
Campo	Tipo	Descrição
id_avaliacao	string	UUID
id_jogo	string	Referência ao jogo
id_avaliador	string	ADM que avaliou
id_avaliado	string	Jogador avaliado
saque	0–100	Nota da habilidade
ataque	0–100	Nota da habilidade
bloqueio	0–100	Nota da habilidade
defesa	0–100	Nota da habilidade
levantamento	0–100	Nota da habilidade
recepcao	0–100	Nota da habilidade
data	datetime	Quando foi avaliado
3.4. Aba Scores (calculada / cache)
Score consolidado por jogador e habilidade, recomputado pelo Apps Script sempre que uma avaliação é registrada. Mantida como cache para leitura rápida pelo front.
Campo	Tipo	Descrição
id_jogador	string	Referência ao jogador
saque	0–100	Média ponderada por recência
ataque	0–100	Média ponderada por recência
bloqueio	0–100	Média ponderada por recência
defesa	0–100	Média ponderada por recência
levantamento	0–100	Média ponderada por recência
recepcao	0–100	Média ponderada por recência
score_geral	0–100	Média das 6 habilidades
atualizado_em	datetime	Última recomputação
3.5. Aba Times_Historico
Registro das divisões geradas a cada semana, para consulta posterior.
Campo	Tipo	Descrição
id_montagem	string	UUID da montagem
data	date	Semana / data
time	1 | 2 | 3	Número do time
id_jogador	string	Jogador alocado naquele time
score_geral_time	0–100	Score médio do time (repetido na linha p/ facilitar leitura)
defesa_media_time	0–100	Defesa média do time
 
4. Cálculo de Score (ponderado por recência)
Para cada jogador e cada habilidade, o score é a média das notas recebidas em todos os jogos, com decaimento gradual: jogos mais recentes pesam mais, e o peso diminui conforme o jogo fica mais antigo.
4.1. Fórmula
Ordenar as avaliações do jogador por data (mais recente primeiro). Atribuir a cada avaliação um peso decrescente segundo um fator de decaimento exponencial:
peso(i) = fator ^ i      // i = 0 para o jogo mais recente, 1 para o anterior, ...
score_habilidade = Σ( nota_i * peso_i ) / Σ( peso_i )
Fator de decaimento sugerido: 0,8. Significa que cada jogo mais antigo vale 80% do peso do jogo seguinte mais recente. Esse valor deve ser uma constante configurável no código (ex.: DECAY_FACTOR), para ajuste fácil sem refatoração.
score_geral = média aritmética simples das 6 habilidades já ponderadas.
4.2. Quando recalcular
•	Sempre que uma nova avaliação é gravada, recomputar o score do jogador avaliado e atualizar a aba Scores.
•	Quando múltiplos ADMs avaliam o mesmo jogador no mesmo jogo, as notas dos ADMs daquele jogo entram como média do jogo antes de aplicar o peso de recência (decidir e documentar: média entre ADMs por jogo → depois decaimento entre jogos).
5. Autenticação e Segurança
5.1. Tela inicial
•	Campo de login e senha.
•	Botão 'Registrar novo jogador' que abre o formulário de cadastro (seção 7.1).
•	Após login bem-sucedido, o sistema lê o papel (ADM/JOGADOR) e habilita as telas conforme a permissão.
5.2. Requisitos de segurança
•	Senha nunca em texto puro: armazenar hash (ex.: SHA-256 com salt, ou bcrypt se viável no Apps Script). O front envia a senha via HTTPS; o hashing ocorre no Apps Script.
•	Sessão: emitir um token simples (ex.: token assinado ou opaco guardado em uma aba Sessoes com expiração) retornado ao front e enviado nas requisições seguintes. Evitar guardar senha no cliente.
•	Autorização no servidor: toda ação de ADM (avaliar, gerar times, fechar jogo) deve revalidar o papel no Apps Script — nunca confiar apenas na UI escondida no front.
 
6. Fluxo Funcional Semanal
1.	ADM cria um novo jogo (registro na aba Jogos, status = aberto) e informa os 18 jogadores presentes.
2.	Após a partida, o ADM muda o status para 'avaliacao' e preenche as notas (0–100) das 6 habilidades para cada jogador que jogou.
3.	Cada avaliação gravada dispara a recomputação do score do jogador (seção 4).
4.	ADM pode avaliar a qualquer momento (sem prazo). Quando terminar, marca o jogo como 'fechado'.
5.	Na semana seguinte, o ADM informa os 18 presentes e aciona 'Gerar Times'.
6.	O algoritmo (seção 8) monta os 3 times equilibrados e os exibe.
7.	O ADM confirma e salva a montagem na aba Times_Historico; ela passa a ser visível a todos.
7. Telas e Funcionalidades (front PWA)
7.1. Login / Cadastro
•	Login (login + senha) e botão de registro de novo jogador.
•	Formulário de cadastro: nome, login, senha, sexo, altura (cm), idade, peso (kg). Papel NÃO é escolhido pelo usuário — entra como JOGADOR e o dono promove manualmente direto na planilha.
7.2. Lista de Jogadores (todos)
•	Lista de jogadores ativos com seus scores por habilidade e score geral.
•	Filtro/ordenação por nome ou por score.
7.3. Avaliação (somente ADM)
•	Seleção do jogo em status 'avaliacao'.
•	Para cada jogador presente, 6 campos (0–100). Indicar visualmente quem já foi avaliado.
7.4. Gerar Times (somente ADM)
•	Seleção/entrada dos 18 presentes. Botão 'Gerar Times'.
•	Exibição dos 3 times com indicadores de equilíbrio: score médio, defesa média, composição por sexo e por altura.
•	Botão 'Re-gerar' (nova tentativa) e 'Salvar montagem'.
7.5. Histórico (todos)
•	Lista das montagens salvas por data, com os times e seus indicadores.
7.6. Requisitos de PWA
•	manifest.json (nome, ícones, cor de tema, display standalone).
•	service-worker.js para cache de assets e funcionamento offline básico (leitura de dados já carregados).
•	Instalável em celular (add to home screen). Layout responsivo mobile-first.
 
8. Algoritmo de Montagem dos Times
Entrada: 18 jogadores (ids) presentes na semana, com seus atributos e scores. Saída: 3 times de 6, o mais equilibrados possível segundo as prioridades abaixo.
8.1. Prioridades (na ordem)
8.	Distribuição por altura (semente): ordenar os 18 por altura decrescente e distribuir em 'snake draft' (1→T1, 2→T2, 3→T3, 4→T3, 5→T2, 6→T1, ...), espalhando os mais altos entre times diferentes.
9.	Distribuição por sexo: redistribuir para igualar ao máximo o número de mulheres e homens por time. Se o total de mulheres não for múltiplo de 3, a diferença entre times deve ser de no máximo 1.
10.	Equilíbrio de score geral: minimizar a diferença do score_geral médio entre os 3 times.
11.	Equilíbrio de defesa: minimizar a diferença do score de defesa médio entre os 3 times.
8.2. Abordagem sugerida
•	Fase 1 — semente: snake draft por altura (passo 1).
•	Fase 2 — otimização local: função de custo combinando desvio de sexo, desvio de score geral e desvio de defesa, com pesos. Trocar pares de jogadores entre times enquanto a troca reduzir o custo (hill climbing / simulated annealing leve). Com 18 jogadores, roda em milissegundos.
•	A função de custo e seus pesos devem ser constantes configuráveis.
8.3. Função de custo (referência)
custo = w1 * desvioSexo + w2 * desvioScoreGeral + w3 * desvioDefesa
Onde 'desvio' é, por exemplo, a diferença entre o time de maior e o de menor valor naquele critério (ou desvio padrão entre os 3 times). Pesos iniciais sugeridos: sexo e score geral altos, defesa intermediário. Ajustáveis.
8.4. Saída esperada
•	3 listas de 6 jogadores.
•	Para cada time: score geral médio, defesa média, qtd. de mulheres/homens, altura média.
9. Contrato de API (Apps Script)
Endpoints lógicos a expor pelo Web App (o dev decide se via parâmetro 'action' em doPost). Todos retornam JSON. Ações de ADM exigem token válido de ADM.
Ação	Quem	Descrição
registrar	público	Cria jogador (papel=JOGADOR)
login	público	Valida credenciais, retorna token + papel
listarJogadores	autenticado	Lista jogadores + scores
criarJogo	ADM	Cria jogo com presentes
avaliar	ADM	Grava avaliação e recomputa score
fecharJogo	ADM	Muda status para fechado
gerarTimes	ADM	Roda algoritmo e retorna 3 times
salvarMontagem	ADM	Persiste em Times_Historico
listarHistorico	autenticado	Retorna montagens salvas
 
10. Estrutura do Repositório GitHub
volei-teams/
├── README.md            <- documentação (atualizar a cada mudança)
├── docs/                <- pasta servida pelo GitHub Pages
│   ├── index.html
│   ├── manifest.json    <- PWA
│   ├── service-worker.js
│   ├── css/style.css
│   └── js/
│       ├── api.js       <- chamadas ao Apps Script
│       ├── auth.js
│       ├── cadastro.js
│       ├── avaliacao.js
│       ├── jogadores.js
│       ├── times.js    <- consumo do gerador de times
│       └── historico.js
├── apps-script/
│   ├── Code.gs          <- backend (CRUD, auth, score, algoritmo)
│   └── README.md        <- como publicar o Web App
└── .github/workflows/   <- (opcional) deploy/lint
10.1. Configuração do GitHub Pages
•	Servir a pasta /docs do branch principal.
•	HTTPS habilitado (padrão do Pages).
10.2. Regra de manutenção da documentação
Obrigatório: a cada alteração no repositório, o README.md deve ser atualizado refletindo a mudança (novas telas, novos endpoints, ajuste de fórmula/pesos, instruções de deploy). O README deve conter: descrição do projeto, stack, como configurar a planilha, como publicar o Apps Script, como rodar o front, e changelog resumido.
11. Entregáveis Esperados do Desenvolvedor
•	Repositório GitHub configurado com a estrutura acima e GitHub Pages ativo.
•	Front PWA completo, responsivo e instalável, cobrindo todas as telas da seção 7.
•	Apps Script publicado como Web App, implementando o contrato da seção 9, auth da seção 5, score da seção 4 e algoritmo da seção 8.
•	Planilha modelo com as abas da seção 3 e instruções de cópia.
•	README completo e atualizado, incluindo passo a passo de deploy de ponta a ponta.
•	Constantes configuráveis expostas (fator de decaimento, pesos do algoritmo).
12. Itens em Aberto / A Confirmar com o Cliente
Pontos que o desenvolvedor deve confirmar antes ou durante o desenvolvimento:
•	Tratamento de empate/sobra na distribuição por sexo quando o total de mulheres não é múltiplo de 3.
•	Pesos exatos da função de custo do algoritmo (valores iniciais sugeridos, ajustar em testes).
•	Mecanismo exato de sessão/token aceitável para o grupo.
•	Necessidade (ou não) de recuperação de senha.
