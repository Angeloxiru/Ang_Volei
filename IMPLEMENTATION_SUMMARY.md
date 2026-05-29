# Implementação v2.0 - Vôlei de Quinta

## 🎯 Resumo Executivo

Implementação completa da reestruturação do aplicativo conforme solicitado. O app agora é **exclusivamente para administradores**, com interface simplificada e gerenciamento direto de avaliações sem dependência de jogos.

## ✅ Mudanças Implementadas

### 🔐 Autenticação
- ✅ Remover acesso de jogadores - **apenas ADMs podem acessar**
- ✅ Tela de login único (sem registro de jogadores)
- ✅ Autenticação via Administradores sheet no Google Sheets
- ✅ Token com validade de 7 dias

### 👥 Gestão de Jogadores
- ✅ Schema simplificado: `id`, `nome`, `sexo`
- ✅ Removidos: `login`, `senha`, `altura_cm`, `idade`, `peso`
- ✅ Registro direto pelo ADM (nome + sexo apenas)
- ✅ Lista de jogadores com scores agregados

### 📊 Habilidades (5 em vez de 6)
- ✅ Removido: `Defesa`
- ✅ Mantidos: `Saque`, `Ataque`, `Recepção`, `Bloqueio`, `Levantamento`
- ✅ Score Geral = Média dos 5

### 📝 Sistema de Avaliação
- ✅ Desacoplado de jogos - **ADM pode avaliar qualquer hora**
- ✅ Seleção simples de jogador → input de 5 notas (0-100)
- ✅ Recálculo automático de scores com decay (0.8)
- ✅ Histórico de avaliações no Google Sheets

### 🎯 Algoritmo de Montagem de Times
- ✅ **Semente por Sexo**: Distribui M/F igualmente
- ✅ **Otimização**: Hill climbing baseado em score_geral
- ✅ **Resultado**: 3 times equilibrados
- ✅ Salva no histórico com data e scores

### 🗺️ Interface Simplificada

#### Telas Mantidas
1. **Login**: ADM login/senha
2. **Home**: Dashboard com menu rápido
3. **Jogadores**: Registrar novo + Listar com filtros
4. **Avaliação**: Select jogador → Input 5 skills
5. **Gerar Times**: Select 18 → Gerar → Salvar
6. **Histórico**: Ver montagens salvas

#### Telas Removidas
- ❌ Cadastro de Jogadores (movia para dentro de Home/Jogadores)
- ❌ Perfil de Usuário (não há mais dados para editar)
- ❌ Jogos/Partidas (avaliação é independente)

### 💾 Schema Google Sheets

#### Administradores (NOVO)
```
id | nome | login | senha
```

#### Jogadores (SIMPLIFICADO)
```
id | nome | sexo
```

#### Scores (5 SKILLS)
```
id_jogador | saque | ataque | recepcao | bloqueio | levantamento | score_geral | atualizado_em
```

#### Avaliacoes (INDEPENDENTE)
```
id_avaliacao | id_jogador | saque | ataque | recepcao | bloqueio | levantamento | data
```

#### Times_Historico
```
id_montagem | data | time | id_jogador | score_geral_time
```

#### Sessoes (ATUALIZADO)
```
token | id_admin | criada_em | expira_em
```

## 📝 Alterações de Código

### Backend (Google Apps Script)
- ✅ Removeu: `registrar()`, `criarJogo()`, `listarJogos()`, `fecharJogo()`, `atualizarStatusJogo()`
- ✅ Adicionou: `registrarJogador()` (apenas nome + sexo)
- ✅ Atualizou: `login()` para checar Administradores sheet
- ✅ Atualizou: `avaliar()` para remover game_id
- ✅ Mantém: `gerarTimes()`, `salvarMontagem()`, `listarHistorico()`

### Frontend HTML
- ✅ Removeu: `register-section`
- ✅ Removeu: `perfil-section`  
- ✅ Removeu: Link "Cadastre-se" da tela de login
- ✅ Adicionou: Formulário de registro em `jogadores-section`
- ✅ Atualizou: `avaliacao-section` para select de jogador (não jogo)

### Frontend JavaScript
- ✅ **api.js**: Removeu métodos de registro/jogo, adicionou `registrarJogador()`
- ✅ **auth.js**: Removeu fluxo de registro, simplificou para admin-only
- ✅ **app.js**: Reescrito completo
  - Removeu referências a altura/idade/peso/defesa
  - Atualizou visualização para 5 skills
  - Removeu lógica de jogos
  - Implementou fluxo simplificado de avaliação

## 🚀 Fluxo de Uso

### Setup Inicial
1. Criar entry na aba "Administradores" com login/senha
2. ADM faz login no app com as credenciais

### Uso Diário
1. **Registrar Jogadores**
   - Home → Jogadores → Registrar (nome + sexo)
   
2. **Avaliar Jogadores**
   - Home → Avaliação → Seleciona jogador → Input 5 notas (0-100)
   - Sistema recalcula scores automaticamente

3. **Gerar Times**
   - Home → Gerar Times → Select 18 → Gerar
   - Visualiza 3 times equilibrados
   - Clica "Salvar Montagem"

4. **Verificar Histórico**
   - Home → Histórico → Vê montagens salvas

## 📱 Responsividade
- ✅ Menu hambúrguer em mobile (< 768px)
- ✅ Layout adaptativo para tablets e desktop
- ✅ Touch targets com 44px mínimo
- ✅ Funciona offline com Service Worker

## 🔄 Próximos Passos

### Para Usar
1. Copie o código de `apps-script/Code.gs` para Google Apps Script
2. Crie manualmente uma entry na aba "Administradores"
3. Use o app em `https://<seu-github-pages>/docs/`

### Testes Sugeridos
1. ✅ Login como ADM
2. ✅ Registrar 20+ jogadores (mistos M/F)
3. ✅ Avaliar alguns jogadores
4. ✅ Gerar times com exatamente 18
5. ✅ Verificar histórico
6. ✅ Testar em mobile

## 🎉 Funcionalidades Entregues

- ✅ ADM-only access
- ✅ Player management simplificado
- ✅ 5 skills evaluation
- ✅ Game-independent assessment
- ✅ Balanced team generation
- ✅ History tracking
- ✅ Responsive mobile UI
- ✅ Offline support
- ✅ Token-based auth
- ✅ Recency-weighted scoring
