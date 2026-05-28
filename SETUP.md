# Guia de Setup Completo - Vôlei Teams

Siga este guia passo a passo para colocar o Vôlei Teams em produção.

## ⏱️ Tempo Estimado: 20-30 minutos

## ✅ Checklist de Pré-requisitos

- [ ] Conta Google (Gmail)
- [ ] Acesso a Google Sheets e Google Drive
- [ ] Conta GitHub
- [ ] Git instalado no computador
- [ ] Editor de texto (VS Code, Sublime, etc)

## 📍 PASSO 1: Preparar Google Sheets (5 min)

### 1.1 Criar a Planilha

1. Abra [Google Sheets](https://sheets.google.com)
2. Clique **"Nova planilha em branco"**
3. Renomeie para **"Vôlei Teams"** (clique no nome)
4. **Copie o ID da URL**:
   - A URL parece: `https://docs.google.com/spreadsheets/d/{ID_AQUI}/edit`
   - ID é a string entre `/d/` e `/edit`
   - Paste em um bloco de notas temporário

### 1.2 Abrir Apps Script

1. Na planilha, clique em **Extensions** (ou "Extensões")
2. Selecione **Apps Script**
3. Uma nova aba abrirá com um editor de código
4. **Delete o código padrão** (a função `myFunction`)

### 1.3 Adicionar Código Backend

1. No navegador, vá para `apps-script/Code.gs` neste repositório
2. Copie **todo** o código
3. Cola no editor do Apps Script
4. **Na linha 2**, substitua `SPREADSHEET_ID`:
   ```javascript
   const SPREADSHEET_ID = 'seu-id-aqui'; // Cole o ID que copiou
   ```
5. Clique **Ctrl+S** (ou Cmd+S) para salvar

### 1.4 Inicializar Bancos de Dados

1. No editor, clique no dropdown de funções (mostra algo como "Select function")
2. Selecione **`initializeSheets`**
3. Clique **Run** (play button ▶️)
4. **Primeira vez**: Aparecerá "Apps Script needs permission"
   - Clique **"Review Permissions"**
   - Selecione sua conta Google
   - Leia e clique **"Allow"**
5. Volte para a planilha (primeira aba) e **recarregue**
6. Verifique se as abas foram criadas:
   - [ ] Jogadores
   - [ ] Jogos
   - [ ] Avaliacoes
   - [ ] Scores
   - [ ] Times_Historico
   - [ ] Sessoes

✅ **Google Sheets está pronto!**

---

## 📍 PASSO 2: Publicar Web App (5 min)

### 2.1 Publicar como Web App

1. Volte ao **editor de Apps Script**
2. Clique em **Deploy** (canto superior direito)
3. Clique **"New Deployment"**
4. Preencha:
   ```
   Type: Web app
   Execute as: [sua conta Google]
   Who has access: Anyone
   ```
5. Clique **Deploy**
6. Aparecerá a URL! Parece algo como:
   ```
   https://script.google.com/macros/d/[ID_LONGO]/userweb
   ```
7. **Copie essa URL e salve** em um bloco de notas

**⚠️ IMPORTANTE**: Essa URL é privada e única. Guarde bem!

✅ **Web App publicado!**

---

## 📍 PASSO 3: Configurar Frontend (5 min)

### 3.1 Opção A: Hardcode da URL (Recomendado para testes)

1. Abra `docs/js/api.js` neste repositório
2. **Linha 2**, você verá:
   ```javascript
   const APPS_SCRIPT_URL = localStorage.getItem('appsScriptUrl') || '';
   ```
3. Substitua por:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/d/[SEU_ID]/userweb';
   ```
4. Salve o arquivo

### 3.2 Opção B: Dinâmica (Para múltiplos ambientes)

Deixe como está. O app pedirá a URL na tela inicial na primeira vez.

✅ **Frontend configurado!**

---

## 📍 PASSO 4: Publicar no GitHub Pages (5 min)

### 4.1 Clonar o Repositório (se não fez ainda)

```bash
git clone https://github.com/angeloxiru/ang_volei.git
cd ang_volei
```

### 4.2 Fazer Commit das Mudanças

```bash
git add -A
git commit -m "chore: configure Apps Script URL and spreadsheet ID"
git push origin claude/zen-lovelace-9dDpu
```

### 4.3 Ativar GitHub Pages

1. Vá para **Settings** do repositório (na aba principal)
2. Menu esquerdo: **Pages**
3. Preencha:
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: /docs
   ```
4. Clique **Save**
5. Aguarde ~1 minuto e recarregue a página
6. Verá algo como:
   ```
   Your site is live at https://angeloxiru.github.io/ang_volei/
   ```

✅ **App está online!**

---

## 🎮 PASSO 5: Teste Funcional (5-10 min)

### 5.1 Registrar Usuário Teste

1. Abra `https://angeloxiru.github.io/ang_volei/`
2. Clique **"Cadastre-se"**
3. Preencha:
   - **Nome**: João Teste
   - **Login**: joao
   - **Senha**: 123456
   - **Sexo**: Masculino
   - **Altura**: 185
   - **Idade**: 25
   - **Peso**: 80
4. Clique **Cadastrar**
5. Verá mensagem de sucesso

### 5.2 Fazer Login

1. Preencha:
   - **Login**: joao
   - **Senha**: 123456
2. Clique **Entrar**
3. Verá tela de Home: "Bem-vindo, João!"

### 5.3 Promover a Admin (na planilha)

1. Volte para a planilha Google
2. Abra a aba **Jogadores**
3. Encontre a linha do "João Teste"
4. Na coluna **papel**, mude de `JOGADOR` para `ADM`
5. Refresh do navegador

### 5.4 Testar Funcionalidades

- [ ] **Ver Jogadores**: Menu > Jogadores
  - Deve mostrar João com scores zerados (normal, sem avaliações ainda)
  
- [ ] **Gerar Times**: Menu > Gerar Times
  - Crie mais alguns usuários de teste primeiro (repita 5.1-5.2 para ~20 jogadores)
  - Seleção de 18 deve funcionar
  - Clique "Gerar Times"
  - Deve mostrar 3 times equilibrados
  
- [ ] **Avaliação**: Menu > Avaliação (só aparece se for ADM)
  - Crie um jogo primeiro (vai aparecer quando clicar)
  - Avalie os jogadores (scores 0-100)
  - Clique "Salvar Avaliações"
  
- [ ] **Histórico**: Menu > Histórico
  - Mostra montagens salvas

✅ **Funcionalidades testadas!**

---

## 🚀 Próximos Passos (Produção)

### Setup Adicional

1. **Fazer backup da planilha**:
   - Menu > File > Make a copy
   - Nome: "Vôlei Teams - Backup"

2. **Criar usuários reais**:
   - Peça que cada amigo se cadastre no app
   - Ou crie manualmente na planilha
   - Mantenha uma planilha com seus logins

3. **Promover ADMs**:
   - Na planilha, mude a coluna "papel" para "ADM" dos administradores

4. **Primeira semana**:
   - Crie um jogo para testar o fluxo completo
   - Faça algumas avaliações
   - Gere times e salve

### Ajustar Parâmetros (Opcional)

Se quiser customizar o comportamento, edite em `apps-script/Code.gs`:

```javascript
// Linha 3: Fator de decaimento (0.8 = 80% do peso anterior)
const DECAY_FACTOR = 0.8;

// Linhas 5-9: Pesos do algoritmo de times
const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,       // Penalidade por sexo desigual
  scoreGeral: 2.0, // Penalidade por skill desigual
  defesa: 1.0,     // Penalidade por defesa desigual
};
```

Após ajustar:
1. Salve no Apps Script
2. Clique Deploy > Deploy > Done (ou selecione "Update")
3. A nova URL será gerada (se mudou o tipo de deployment)

### Manutenção Contínua

- **Semanal**: Crie um jogo, peça avaliações, gere times
- **Mensal**: Verifique se a planilha não está muito grande (pode desacelerar)
- **Trimestral**: Review dos pesos do algoritmo com feedback do grupo

---

## ❓ FAQ - Troubleshooting

### P: "Apps Script URL not configured"
**R**: Configure na tela inicial (input campo) OU edite `docs/js/api.js` linha 2.

### P: "Erro de CORS no console"
**R**: 
- Verifique URL do Apps Script está correta
- Certifique que publicou como "Web app" com "Anyone" acesso
- Teste a URL diretamente: deve retornar JSON

### P: "Não consegui achar o ID da planilha"
**R**: Na URL da planilha: `https://docs.google.com/spreadsheets/d/{ID_AQUI}/edit`
- O ID é tudo entre `/d/` e `/edit`

### P: "Scores não estão atualizando"
**R**: 
- Certifique que salvou as avaliações (clicou botão)
- Recarregue a página após alguns segundos
- Verifique se o jogo está em status "avaliacao"

### P: "Times não estão sendo gerados"
**R**: 
- Selecione exatamente **18** jogadores
- Certifique que é administrador (papel = "ADM")
- Verifique console (F12) para erros

### P: "Não consigo ver o botão 'Gerar Times'"
**R**: 
- Certifique que é administrador (verifique na planilha, coluna "papel")
- Recarregue o navegador (Ctrl+F5)
- Faça logout e login novamente

### P: Posso usar em múltiplos sites/domínios?
**R**: Sim! A mesma URL do Apps Script funciona de qualquer domínio. Você pode:
- Usar no GitHub Pages oficial
- Hospedar seu próprio site
- Usar localmente (`localhost`)

---

## 📱 Instalação no Celular

Após tudo pronto:

1. Abra a URL no **Chrome** (Android) ou **Safari** (iPhone/iPad)
2. Menu (⋮ ou compartilhar) > "Instalar" / "Adicionar à Tela Inicial"
3. O app abrirá em modo standalone (sem barra de endereço)
4. Service Worker cacheia dados para offline básico

---

## 🎉 Parabéns!

Seu app está online! Compartilhe com os amigos:
```
https://angeloxiru.github.io/ang_volei/
```

**Dúvidas?** Abra uma Issue no repositório GitHub.

---

**Última atualização**: 2025-05-28
