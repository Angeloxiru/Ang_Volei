# Google Apps Script - Backend do Vôlei Teams

Instruções para configurar e publicar o backend em Google Apps Script.

## 📋 Pré-requisitos

- Conta Google
- Acesso a Google Sheets
- Apps Script habilitado na sua conta

## 🚀 Configuração Passo a Passo

### 1. Criar a Planilha Google

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em "Nova planilha em branco"
3. Nomeie como "Vôlei Teams"
4. Copie o ID da URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
   - O ID é a string entre `/d/` e `/edit`

### 2. Abrir Google Apps Script

1. Na planilha, clique em **Extensions** (Extensões)
2. Selecione **Apps Script**
3. Uma nova aba abrirá com o editor de code

### 3. Adicionar o Código Backend

1. Delete o código padrão (`function myFunction() {...}`)
2. Copie todo o conteúdo de `Code.gs` (deste repositório)
3. Cole no editor do Apps Script
4. Na linha 2, substitua `SPREADSHEET_ID` com o ID copiado:

```javascript
const SPREADSHEET_ID = 'seu-id-aqui';
```

### 4. Executar Inicialização

1. No editor, clique na função dropdown (atualmente mostra "Select function")
2. Selecione `initializeSheets`
3. Clique no botão "Run" (▶️)
4. Autorize a aplicação (primeira vez):
   - Clique em "Review permissions"
   - Selecione sua conta
   - Clique "Allow" (a aplicação está pedindo acesso para ler/escrever na planilha)

**Resultado esperado**: A planilha agora terá as abas criadas:
- Jogadores
- Jogos
- Avaliacoes
- Scores
- Times_Historico
- Sessoes

### 5. Publicar como Web App

1. No editor de Apps Script, clique em **Deploy** (canto superior direito)
2. Selecione **New Deployment**
3. Preencha:
   - **Type**: Selecione "Web app"
   - **Execute as**: Sua conta Gmail
   - **Who has access**: "Anyone"
4. Clique **Deploy**
5. **Copie a URL** que aparecerá (formato: `https://script.google.com/macros/d/{ID}/userweb`)
   - **Salve esta URL**, você precisa dela no frontend

### 6. Configurar o Frontend

1. No repositório local, abra `docs/js/api.js`
2. Na primeira linha do IIFE, atualize:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/d/{ID}/userweb';
```

3. Salve e faça commit

**Alternativa (sem hardcode)**: O frontend pode solicitar a URL na primeira tela de login.

## 🔑 Tokens e Sessões

Os tokens são gerenciados na aba **Sessoes** da planilha:
- **token**: String aleatória (UUID)
- **id_jogador**: ID do jogador autenticado
- **criada_em**: Timestamp de criação
- **expira_em**: Timestamp de expiração (7 dias)

Tokens expirados são automaticamente ignorados.

## 📊 Estrutura de Dados

Cada aba da planilha tem um header (primeira linha) com os nomes das colunas. O código lê/escreve automaticamente a partir da linha 2.

### Jogadores
```
id | nome | login | senha_hash | papel | sexo | altura_cm | idade | peso_kg | ativo | data_cadastro
```

### Scores
```
id_jogador | saque | ataque | bloqueio | defesa | levantamento | recepcao | score_geral | atualizado_em
```

### Jogos
```
id_jogo | data | jogadores_presentes | status
```
Onde `jogadores_presentes` é um JSON array stringificado.

### Avaliacoes
```
id_avaliacao | id_jogo | id_avaliador | id_avaliado | saque | ataque | bloqueio | defesa | levantamento | recepcao | data
```

### Times_Historico
```
id_montagem | data | time | id_jogador | score_geral_time | defesa_media_time
```

### Sessoes
```
token | id_jogador | criada_em | expira_em
```

## ⚙️ Configurações Ajustáveis

### Fator de Decaimento (Recency Weight)

```javascript
const DECAY_FACTOR = 0.8;
```

- **0.8**: Cada jogo anterior vale 80% do anterior (padrão, mais conservador)
- **0.5**: Cada jogo anterior vale 50% (favorece mais jogos recentes)
- **0.95**: Cada jogo anterior vale 95% (valoriza histórico completo)

### Pesos do Algoritmo de Montagem

```javascript
const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,
  scoreGeral: 2.0,
  defesa: 1.0,
};
```

Interprete como "penalidade por desequilíbrio":
- **sexo: 2.0**: Fortemente penaliza distribuição desigual de sexo
- **scoreGeral: 2.0**: Fortemente penaliza times com skills muito diferentes
- **defesa: 1.0**: Menos importante que os anteriores

**Exemplo de ajuste**:
```javascript
const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 1.0,        // Menos importante
  scoreGeral: 3.0,  // Muito importante
  defesa: 2.0,      // Importante
};
```

## 🧪 Teste Manual

### 1. Criar Usuários Teste

Abra a planilha e adicione uma linha manualmente:
- id: Cole um UUID (ex: `550e8400-e29b-41d4-a716-446655440000`)
- nome: "João Teste"
- login: "joao"
- senha_hash: Deixe em branco por enquanto
- papel: "JOGADOR"
- sexo: "M"
- altura_cm: 185
- idade: 25
- peso_kg: 80
- ativo: TRUE
- data_cadastro: Clique em "Insert function" > "TODAY()"

### 2. Testar Endpoint

Use o navegador ou Postman:

```bash
curl -X POST \
  'https://script.google.com/macros/d/{ID}/userweb' \
  -H 'Content-Type: text/plain' \
  -d '{
    "action": "listarJogadores"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "nome": "João Teste",
      "sexo": "M",
      ...
    }
  ]
}
```

## 🐛 Troubleshooting

### "Erro: Cannot read property 'getRange' of null"
**Causa**: Planilha ou aba não existe
**Solução**: Execute `initializeSheets()` novamente

### "CORS Error" no navegador
**Causa**: Domínio não permitido
**Solução**: Apps Script Web App com "Anyone" acesso deve funcionar. Se persistir, tente em modo incógnito/anônimo.

### "Token inválido"
**Causa**: Token expirado ou não existe
**Solução**: Verifique se a linha foi criada em `Sessoes` após login

### Alterar URL do Web App publicado

Se publicar novamente:
1. Vá para **Deployments** (no Apps Script)
2. Veja "Version" da versão ativa (deve ter um ID)
3. Para atualizar código e gerar nova URL: **Deploy > Update**
4. Copie a nova URL

**Nota**: URLs anteriores se tornam inativas.

## 🔐 Segurança

### Senhas

Senhas são hasheadas com SHA-256 + Base64:
```javascript
const senhaHash = Utilities.base64Encode(hashPassword(data.senha));
```

Nunca é armazenada em texto plano. O frontend envia a senha via HTTPS; o hashing acontece no backend.

### Tokens

Tokens são UUIDs aleatórios armazenados na planilha:
- Validados a cada requisição
- Expiram em 7 dias
- Exclusivos por sessão

### Autorização

Cada endpoint que requer ADM chama `verificarAdministrador(token)`:
```javascript
function verificarAdministrador(token) {
  const jogadorId = verificarAutenticacao(token);
  // ... verifica se papel === 'ADM'
}
```

Isso garante que até modificações na UI do navegador não permitem bypass.

## 📈 Performance

O Apps Script tem limites:
- **Execução**: ~30 minutos por dia por usuário
- **Requests**: Até 500.000 por dia
- **Tamanho de resposta**: Até 50 MB

Para ~30 usuários jogando 1x/semana:
- ~30 logins/semana
- ~30 listas de jogadores/semana
- ~180 avaliações/semana (6 habilidades × 30 jogadores)
- ~1 geração de times/semana

**Estimado**: ~250 requisições/semana → Fácil dentro dos limites.

Se a base crescer significativamente, considere arquivar dados antigos.

## 📚 Referências

- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [SpreadsheetApp Reference](https://developers.google.com/apps-script/reference/spreadsheet)
- [Deploying Apps Script as Web App](https://developers.google.com/apps-script/guides/web)

---

**Último atualizado**: 2025-05-28
