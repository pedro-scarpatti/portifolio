```
📁 Portfolio (seu-usuario.github.io/portfolio)
│
├── 📄 index.html
│   └─ SPA Principal
│     ├ Dark mode toggle
│     ├ Hero com CTA buttons
│     ├ Seção About com skills
│     ├ Seção Projects (2 cards com modais)
│     ├ Seção Contact
│     └ Footer
│
├── 📁 projects/
│   ├── 🏥 Gerenciador de Senhas.html
│   │   └─ Sistema SUS (painel de atendimento)
│   └── ✍️ monolithic-article-editor.html
│       └─ Editor de artigos WYSIWYG
│
├── 📖 README.md
│   └─ Documentação principal
│
├── 🚀 QUICK-START.md
│   └─ Deploy em 3 passos
│
├── .gitignore
│   └─ Configuração Git
│
└── .git/
    └─ Controle de versão
```

## Flow

```
User abre https://seu-usuario.github.io/portfolio
         ↓
    index.html carrega (SPA)
         ↓
    User clica em card "Sistema SUS"
         ↓
    Modal abre com <iframe src="projects/Gerenciador de Senhas.html">
         ↓
    App roda dentro do modal
```

## Vantagens desta estrutura

✅ Clean separation of concerns (SPA + apps)
✅ Fácil adicionar novos projetos (só dropar em `projects/`)
✅ Cada app isolado em seu próprio arquivo
✅ GitHub Pages processa tudo corretamente
✅ Sem conflitz de variáveis globais
✅ Deploy retém estrutura original
