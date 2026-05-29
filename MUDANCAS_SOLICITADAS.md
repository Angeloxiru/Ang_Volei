# Mudanças Solicitadas - Vôlei de Quinta v2.0

## 🔐 Autenticação
- ✅ **Apenas ADMs** acessam o app
- ❌ Remover: Tela de cadastro de jogadores
- ❌ Remover: Login/senha de jogadores
- ✅ Login simples: Apenas ADMs com login/senha

## 👥 Gestão de Jogadores
- **Dados mantidos**: id, nome, sexo
- **Dados removidos**: login, senha, papel, altura, idade, peso
- **Como funcionará**: 
  - ADM registra jogadores (sem login)
  - Apenas nome e sexo
  - Usados apenas para montagem de times

## 📊 Atributos/Habilidades
- **Remover**: Defesa (5 atributos em vez de 6)
- **Manter**: 
  1. Saque
  2. Ataque
  3. Recepção
  4. Bloqueio
  5. Levantamento
- **Score geral**: Média dos 5

## 📝 Avaliação
- ✅ **Simplificada**: Sem jogo em aberto
- ADM pode avaliar qualquer jogador, qualquer hora
- ADM seleciona jogador → seleciona atributo → nota (0-100)
- Salva imediatamente
- Recomputa score automaticamente

## 🎯 Algoritmo de Montagem de Times
- **Semente**: Sexo (distribuir M/F igualmente)
- **Otimização**: Equilibrar por score_geral
- **Saída**: 3 times equilibrados

## 🗑️ Remover do App
- Tela de cadastro (login/senha de jogadores)
- Página de Perfil (não há mais senha de jogador)
- Página de Histórico (opcional - pode manter)
- Muitos botões na navbar

## 📱 Interfaces a Manter/Criar
1. **Login**: Apenas para ADM
2. **Home**: Dashboard
3. **Jogadores**: Listar e cadastrar simples (nome + sexo)
4. **Avaliação**: Select jogador → input scores
5. **Gerar Times**: Select 18 → gerar → visualizar

## 💾 Banco de Dados (Google Sheets)
- **Jogadores**: id, nome, sexo
- **Avaliacoes**: id, id_jogador, saque, ataque, recepcao, bloqueio, levantamento, data
- **Scores**: id_jogador, saque, ataque, recepcao, bloqueio, levantamento, score_geral, atualizado_em
- **Times_Historico**: manter igual
- **Sessoes**: manter igual
- **Remover**: Aba de ADMs (apenas 1 ADM para testes)

## 🔄 Fluxo Esperado
1. ADM faz login
2. ADM registra jogadores (nome + sexo)
3. A qualquer hora: ADM avalia jogadores
4. Semana: ADM seleciona 18, gera times
5. Visualiza times, salva no histórico
