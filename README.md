# Vôlei Teams - PWA de Gestão e Balanceamento de Times

Aplicação web progressiva (PWA) para gestão de times de vôlei com balanceamento automático baseado em scores de habilidade.

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitetura](#arquitetura)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Modelo de Dados](#modelo-de-dados)
- [Algoritmo de Montagem de Times](#algoritmo-de-montagem-de-times)
- [Cálculo de Scores](#cálculo-de-scores)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Changelog](#changelog)

## 🎯 Visão Geral

Sistema para approximately 30 amigos que jogam vôlei semanalmente:
- Cadastro de jogadores com atributos físicos
- Avaliação de habilidades pós-jogo por administradores
- Cálculo automático de scores com decaimento por recência
- Geração automática de 3 times equilibrados (6 jogadores cada)
- Histórico de divisões semanais

### Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **Administrador (ADM)** | Tudo do Jogador + avaliar jogadores + gerenciar jogos + gerar times |
| **Jogador** | Ver lista de jogadores, scores, times montados e histórico |

**Nota**: Papéis são atribuídos manualmente na planilha; não há interface de administração de acesso.

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript (PWA)
- **Backend**: Google Apps Script (Web App)
- **Banco de Dados**: Google Sheets
- **Hospedagem**: GitHub Pages (frontend)
- **Protocolo**: HTTPS + REST JSON

## 🏗️ Arquitetura

```
┌─────────────────────────┐
│   GitHub Pages (PWA)    │
│   HTML/CSS/JS Estático  │
│  (sem credenciais)      │
└────────────┬────────────┘
             │
             │ HTTPS fetch() (JSON)
             │
┌────────────▼────────────────────────┐
│  Google Apps Script Web App         │
│  - Autenticação                     │
│  - CRUD Jogadores/Jogos/Avaliações  │
│  - Cálculo de Scores                │
│  - Algoritmo de Times               │
└────────────┬────────────────────────┘
             │
             │ SpreadsheetApp API
             │
┌────────────▼────────────────────────┐
│      Google Sheets (Database)       │
│  - Jogadores                        │
│  - Jogos                            │
│  - Avaliacoes                       │
│  - Scores                           │
│  - Times_Historico                  │
│  - Sessoes                          │
└─────────────────────────────────────┘
```

### Decisões Arquiteturais

1. **Sem credenciais no frontend**: Planilha acessada apenas via Apps Script
2. **CORS habilitado**: Apps Script responde requisições do domínio GitHub Pages
3. **Autenticação própria**: Login/senha gerenciados na planilha (sem OAuth obrigatório)
4. **Tokens de sessão**: Emitidos após login, validados em requisições subsequentes

## 📦 Instalação e Configuração

### Pré-requisitos

- Conta Google (para Apps Script e Google Sheets)
- Repositório GitHub
- Git instalado

### Passo 1: Preparar a Planilha Google

1. Crie uma nova planilha no Google Sheets
2. Copie o ID da planilha (na URL: `docs.google.com/spreadsheets/d/{ID}/...`)
3. Abra o Apps Script da planilha (Extensions > Apps Script)
4. Delete o código padrão e copie o conteúdo de `apps-script/Code.gs`
5. Substitua `SPREADSHEET_ID` no código pelo ID copiado
6. Execute `initializeSheets()` para criar as abas automaticamente
7. **Publique como Web App**:
   - Click em "Deploy" (botão novo)
   - Selecione "New Deployment"
   - Type: "Web app"
   - Execute como: sua conta
   - Quem tem acesso: "Anyone"
   - Copy a URL gerada (ex: `https://script.google.com/macros/d/{ID}/userweb`)

### Passo 2: Configurar o Frontend

1. Clone este repositório
2. Abra `docs/index.html` em um navegador e configure a URL do Apps Script:
   - Na primeira tela, há um campo para inserir a URL do Web App
   - **Alternativa**: Edite `docs/js/api.js` linha 2 e hardcode a URL
3. Faça commit dos arquivos:
   ```bash
   git add -A
   git commit -m "Initial commit: PWA frontend and Apps Script backend"
   git push origin main
   ```

### Passo 3: Ativar GitHub Pages

1. Vá para Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /docs
5. Salve

Seu app estará em: `https://{username}.github.io/{repo-name}/`

## 🎮 Como Usar

### Fluxo de Cadastro

1. Clique em "Cadastre-se"
2. Preencha nome, login, senha, sexo, altura, idade, peso
3. Sistema o adiciona como **JOGADOR**
4. ADM promove manualmente na planilha (coluna "papel")

### Fluxo Semanal

1. **ADM cria jogo**: Menu Gerar Times > Seleciona 18 presentes
2. **Após a partida**: ADM vai para Avaliação > seleciona o jogo > preenche scores (0-100) para cada habilidade
3. **Sistema recalcula**: Scores são atualizados automaticamente com decaimento por recência
4. **ADM gera times**: Próxima semana > Gerar Times > seleciona 18 presentes > algoritmo monta times equilibrados
5. **ADM salva montagem**: Times ficam visíveis a todos no Histórico

### Vizualização de Dados

- **Jogadores**: Lista de todos com filtros por nome/score
- **Histórico**: Consultável por todos; mostra times das semanas anteriores

## 📊 Modelo de Dados

### Aba: Jogadores

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string (UUID) | Identificador único |
| nome | string | Nome do jogador |
| login | string | Único; usado no login |
| senha_hash | string | Hash SHA-256 + base64 |
| papel | "ADM" \| "JOGADOR" | Definido manualmente pelo dono |
| sexo | "M" \| "F" | Distribuição de times |
| altura_cm | inteiro | Semente do snake draft |
| idade | inteiro | Informativo |
| peso_kg | inteiro | Informativo |
| ativo | booleano | Desativar sem apagar histórico |
| data_cadastro | datetime | Criação |

### Aba: Jogos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_jogo | string (UUID) | ID do jogo/rodada |
| data | date | Data |
| jogadores_presentes | JSON array | 18 IDs de jogadores |
| status | "aberto" \| "avaliacao" \| "fechado" | Controla fluxo |

### Aba: Avaliacoes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_avaliacao | string (UUID) | ID único |
| id_jogo | string | Referência ao jogo |
| id_avaliador | string | ADM que avaliou |
| id_avaliado | string | Jogador |
| saque | 0-100 | Nota |
| ataque | 0-100 | Nota |
| bloqueio | 0-100 | Nota |
| defesa | 0-100 | Nota |
| levantamento | 0-100 | Nota |
| recepcao | 0-100 | Nota |
| data | datetime | Quando foi avaliado |

### Aba: Scores

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_jogador | string | Referência |
| saque | 0-100 | Média ponderada por recência |
| ataque | 0-100 | Média ponderada por recência |
| bloqueio | 0-100 | Média ponderada por recência |
| defesa | 0-100 | Média ponderada por recência |
| levantamento | 0-100 | Média ponderada por recência |
| recepcao | 0-100 | Média ponderada por recência |
| score_geral | 0-100 | Média das 6 habilidades |
| atualizado_em | datetime | Última recomputação |

### Aba: Times_Historico

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_montagem | string (UUID) | ID da geração |
| data | date | Semana |
| time | 1 \| 2 \| 3 | Número do time |
| id_jogador | string | Jogador |
| score_geral_time | 0-100 | Média do time |
| defesa_media_time | 0-100 | Defesa média do time |

### Aba: Sessoes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| token | string | Token de sessão |
| id_jogador | string | ID do jogador |
| criada_em | datetime | Quando foi criada |
| expira_em | datetime | Validade (7 dias) |

## 🧮 Cálculo de Scores

### Fórmula de Score Ponderado por Recência

Para cada jogador e habilidade:

```
peso(i) = DECAY_FACTOR ^ i
score_habilidade = Σ(nota_i * peso_i) / Σ(peso_i)
score_geral = média das 6 habilidades
```

**Fator de Decaimento**: `DECAY_FACTOR = 0.8`
- Cada jogo anterior vale 80% do peso do próximo jogo mais recente
- Configurável em `apps-script/Code.gs`

### Quando Recalcular

- Automaticamente após cada avaliação gravada
- Quando múltiplos ADMs avaliam o mesmo jogador no mesmo jogo: média dos ADMs por jogo → depois decaimento

## 🏐 Algoritmo de Montagem de Times

### Objetivo

Distribuir 18 jogadores em 3 times de 6, minimizando diferenças de habilidade e mantendo equilíbrio.

### Prioridades (em ordem)

1. **Distribuição por altura (semente)**: Snake draft
2. **Distribuição por sexo**: Máximo 1 diferença entre times
3. **Equilíbrio de score geral**: Minimizar desvio entre médias dos times
4. **Equilíbrio de defesa**: Minimizar desvio entre médias de defesa dos times

### Abordagem

**Fase 1 — Snake Draft por Altura**
```
Ordenar jogadores por altura (decrescente)
Distribuir em round-robin reverso:
  i=0: Time 1
  i=1: Time 2
  i=2: Time 3
  i=3: Time 3 (reverso)
  i=4: Time 2
  i=5: Time 1
  ...
```

**Fase 2 — Otimização Local (Hill Climbing)**
```
Custo = w1 * desvioSexo + w2 * desvioScoreGeral + w3 * desvioDefesa
Iterativamente trocar pares de jogadores enquanto custo reduzir
Máximo 100 iterações (roda em milissegundos)
```

### Pesos (configuráveis)

```javascript
const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,
  scoreGeral: 2.0,
  defesa: 1.0,
};
```

Edite em `apps-script/Code.gs` para ajustar prioridades.

## 🔌 API Endpoints

Todos retornam JSON. Base URL: `{APPS_SCRIPT_URL}`

### Public

#### `registrar` (POST)
Registra novo jogador (sempre como JOGADOR).
```json
{
  "action": "registrar",
  "nome": "João Silva",
  "login": "joao",
  "senha": "123456",
  "sexo": "M",
  "altura_cm": 185,
  "idade": 25,
  "peso_kg": 80
}
```
**Resposta**: `{ "id": "...", "nome": "..." }`

#### `login` (POST)
Valida credenciais, emite token.
```json
{
  "action": "login",
  "login": "joao",
  "senha": "123456"
}
```
**Resposta**: `{ "token": "...", "usuario": { "id", "nome", "papel", ... } }`

### Autenticado

Todas as requisições abaixo exigem `"token"` no payload.

#### `listarJogadores` (POST)
Lista todos com scores.
**Resposta**: Array de `{ "id", "nome", "sexo", "altura_cm", "idade", "score_geral", "saque", "ataque", ... }`

#### `listarJogos` (POST)
Lista todos os jogos.
**Resposta**: Array de `{ "id_jogo", "data", "jogadores_presentes", "status" }`

#### `listarHistorico` (POST)
Lista montagens salvas.
**Resposta**: Array de `{ "id_montagem", "data", "times": [ { "jogadores": [...], "stats": {...} } ] }`

### Administrador

#### `criarJogo` (POST)
```json
{
  "action": "criarJogo",
  "token": "...",
  "data": "2025-05-28",
  "jogadores_presentes": ["id1", "id2", ...]
}
```
**Resposta**: `{ "id_jogo": "..." }`

#### `avaliar` (POST)
```json
{
  "action": "avaliar",
  "token": "...",
  "id_jogo": "...",
  "id_avaliado": "...",
  "habilidades": {
    "saque": 75,
    "ataque": 80,
    "bloqueio": 70,
    "defesa": 85,
    "levantamento": 78,
    "recepcao": 82
  }
}
```
**Resposta**: `{ "id_avaliacao": "..." }`

#### `fecharJogo` (POST)
```json
{
  "action": "fecharJogo",
  "token": "...",
  "id_jogo": "..."
}
```
**Resposta**: `{ "id_jogo": "..." }`

#### `gerarTimes` (POST)
```json
{
  "action": "gerarTimes",
  "token": "...",
  "jogadores_ids": ["id1", "id2", ..., "id18"]
}
```
**Resposta**: `{ "id_montagem": "...", "times": [ { "jogadores": [...], "stats": {...} } ] }`

#### `salvarMontagem` (POST)
```json
{
  "action": "salvarMontagem",
  "token": "...",
  "id_montagem": "...",
  "data": "2025-05-28",
  "times": [ { "jogadores": [...], "stats": {...} } ]
}
```
**Resposta**: `{ "id_montagem": "..." }`

## 🚀 Deployment

### GitHub Pages (Frontend)

1. Certifique-se de que `/docs` contém todos os arquivos
2. Vá para Settings > Pages
3. Configure para servir `main` branch, `/docs` folder
4. URL será: `https://{username}.github.io/{repo}/`

### Google Apps Script (Backend)

1. Abra a planilha no Google Sheets
2. Extensions > Apps Script
3. Cole `apps-script/Code.gs`
4. Clique "Deploy" > "New deployment"
5. Type: "Web app"
6. Execute como: Sua conta Google
7. Quem tem acesso: "Anyone"
8. Copy a URL e configure no frontend

### Configuração de CORS

O Apps Script responde a requisições cross-origin automaticamente. Se houver erros, certifique-se de:
- Usar `Content-Type: text/plain` nas requisições
- Validar tokens no backend antes de operações

## 📝 Changelog

### v1.0.0 (2025-05-28)

**Features iniciais**:
- ✅ PWA estática com responsive design
- ✅ Autenticação com login/senha
- ✅ Cadastro de jogadores
- ✅ Gestão de jogos (criar, avaliar, fechar)
- ✅ Cálculo de scores com decaimento por recência
- ✅ Algoritmo de montagem de times (snake draft + hill climbing)
- ✅ Histórico de montagens
- ✅ Google Apps Script Web App backend
- ✅ Integração com Google Sheets
- ✅ Token-based authentication
- ✅ Service Worker para offline (cache de assets)
- ✅ Responsivo mobile-first
- ✅ Installable no home screen

**Arquivos**:
- `/docs/index.html` - App shell
- `/docs/css/style.css` - Estilos
- `/docs/js/api.js` - Cliente HTTP
- `/docs/js/auth.js` - Autenticação
- `/docs/js/app.js` - Lógica principal
- `/docs/manifest.json` - PWA metadata
- `/docs/service-worker.js` - Offline support
- `apps-script/Code.gs` - Backend completo
- `README.md` - Esta documentação

## ⚙️ Configuração Avançada

### Ajustar Fator de Decaimento

Em `apps-script/Code.gs`, linha ~2:
```javascript
const DECAY_FACTOR = 0.8; // Padrão: 80% do peso anterior
```

Valores: entre 0 e 1 (mais alto = menos peso em jogos antigos)

### Ajustar Pesos do Algoritmo

Em `apps-script/Code.gs`, linhas ~5-8:
```javascript
const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,        // Quanto penalizar desequilíbrio de sexo
  scoreGeral: 2.0,  // Quanto penalizar desequilíbrio de skill
  defesa: 1.0,      // Quanto penalizar desequilíbrio de defesa
};
```

Maior peso = maior penalidade. Teste e ajuste conforme feedback do grupo.

### Estender Duração de Sessão

Em `apps-script/Code.gs`, função `login()`, linha ~expiracao:
```javascript
const expiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
```

## 🐛 Troubleshooting

### "Token inválido ou expirado"
- Faça login novamente
- Tokens expiram em 7 dias
- Limpe localStorage do navegador se persistir: `localStorage.clear()`

### "Apps Script URL not configured"
- Configure a URL na tela inicial do app OU
- Edite `docs/js/api.js` linha 2 com a URL do seu Web App

### Times não estão sendo gerados
- Verifique se exatamente 18 jogadores estão selecionados
- Certifique-se de ser administrador (coluna "papel" na planilha)
- Verifique console (F12) para erros

### Scores não atualizam
- Certifique-se de que salvou as avaliações (botão "Salvar")
- Espere alguns segundos (o Apps Script recalcula em background)
- Recarregue a página

### Problema com CORS
- Certifique-se de que a URL do Apps Script está correta
- Teste a URL diretamente no navegador (deve retornar JSON com erro)

## 📱 Instalação no Celular

1. Abra a URL no Chrome/Safari
2. Menu (⋮) > "Instalar" ou "Adicionar à Tela Inicial"
3. App abre em modo standalone
4. Service Worker cache os assets para uso offline

## 📄 Licença

MIT License - Use livremente!

---

**Desenvolvido com ❤️ para os amigos do vôlei**
