# Guia de Contribuição

Obrigado por querer contribuir com o Vôlei Teams! Este documento fornece diretrizes e instruções.

## 🎯 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já foi reportado (procure em Issues)
2. Se novo, abra uma Issue descrevendo:
   - O que esperava acontecer
   - O que realmente aconteceu
   - Passos para reproduzir
   - Screenshots (se aplicável)
   - Seu ambiente (navegador, dispositivo, OS)

### Sugerir Melhorias

1. Abra uma Issue com label "enhancement"
2. Descreva a melhoria e por que seria útil
3. Exemplos de uso são bem-vindos

### Pull Requests

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Faça commits com mensagens claras
4. Teste suas mudanças
5. Push para sua fork: `git push origin feature/sua-feature`
6. Abra um Pull Request

## 📝 Padrões de Código

### JavaScript

- Use `const` para variáveis (nunca `var`)
- Use `let` apenas se a variável mudar
- Nomes em camelCase para funções/variáveis
- Nomes em PascalCase para classes/construtores
- Comente apenas quando a lógica é não-óbvia

**Exemplo ruim**:
```javascript
// Aumenta x em 1
x++;
```

**Exemplo bom**:
```javascript
counter++;
```

### CSS

- Organize por componente
- Use variáveis CSS (`:root`)
- Mobile-first media queries
- Nunca use IDs para estilo (apenas classes)

### HTML

- Semântico quando possível (`<button>` vs `<div onclick>`)
- Acessibilidade (labels, alt text, ARIA quando necessário)
- Indentação de 2 espaços

## 🧪 Testando Localmente

1. Clone o repositório
2. Crie uma planilha teste no Google Sheets
3. Configure Apps Script com seu ID
4. Publique como Web App e copie a URL
5. Abra `index.html` em um navegador local
6. Configure a URL do Apps Script na primeira tela
7. Teste as funcionalidades

## 📋 Checklist antes de PR

- [ ] Código segue padrões do projeto
- [ ] Testei a funcionalidade manualmente
- [ ] Atualizei documentação se necessário
- [ ] Não há `console.log` de debug
- [ ] Sem credenciais/senhas no código
- [ ] Mensagens de commit são claras

## 📚 Estrutura do Projeto

```
Ang_Volei/
├── docs/                    # Frontend (GitHub Pages)
│   ├── index.html           # App shell
│   ├── manifest.json        # PWA config
│   ├── service-worker.js    # Offline support
│   ├── css/
│   │   └── style.css        # Estilos
│   └── js/
│       ├── api.js           # Client HTTP
│       ├── auth.js          # Autenticação
│       └── app.js           # Lógica principal
├── apps-script/             # Backend (Google Apps Script)
│   ├── Code.gs              # Código principal
│   └── README.md            # Instruções de deploy
├── README.md                # Documentação geral
└── CONTRIBUTING.md          # Este arquivo
```

## 🔄 Workflow de Desenvolvimento

1. **Issue → Design → Code → Review → Merge**
2. Uma funcionalidade por PR
3. PRs devem passar em qualquer validação automática
4. Mínimo 1 review antes de merge

## 💡 Ideias para Contribuir

### Fácil
- [ ] Melhorar mensagens de erro
- [ ] Adicionar validações de input
- [ ] Traduzir comentários do código
- [ ] Melhorar responsividade

### Médio
- [ ] Adicionar dark mode
- [ ] Implementar busca avançada
- [ ] Adicionar gráficos de scores
- [ ] Exportar dados (CSV)

### Avançado
- [ ] Recuperação de senha
- [ ] Sistema de roles mais granular
- [ ] WebSocket para atualizações em tempo real
- [ ] Otimizar algoritmo de times com ML

## 📧 Contato

Dúvidas? Abra uma Issue com label "question" ou entre em contato.

---

Obrigado por contribuir! 🙌
