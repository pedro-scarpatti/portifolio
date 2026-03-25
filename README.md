# 🚀 Pedro Scarpatti — Portfólio

Portfólio de **BI Developer & Data Analyst** com UI moderna, dark mode e projetos embarcados.

## ✨ Stack

- **HTML5** — Semântico
- **CSS3** — Gradientes, animações, glassmorphism
- **JavaScript Vanilla** — Sem dependências
- **GitHub Pages** — Deploy instantâneo

## 📁 Estrutura

```
├── index.html                           # Portfólio principal (SPA)
├── 📁 projects/                         # Pasta com apps dos modais
│   ├── Gerenciador de Senhas.html       # Projeto 1: SUS
│   └── monolithic-article-editor.html   # Projeto 2: Editor
├── README.md
├── QUICK-START.md
└── .gitignore
```

## 🚀 Deploy

### Localmente

```bash
# Opção 1: Clique duplo em index.html

# Opção 2: Com Python
python -m http.server 8000

# Opção 3: Com Node
npx http-server
```

### GitHub Pages

```bash
git init
git add .
git commit -m "🚀 Deploy portfólio"
git branch -M main
git remote add origin https://github.com/seu-usuario/portfolio.git
git push -u origin main
```

Depois em **Settings** → **Pages** → Selecione `main` + `/root` → **Save**

URL: `https://seu-usuario.github.io/portfolio`

## 🎨 Personalizar

1. **Suas redes**: Procure por `seu-github`, `seu-linkedin`, `seu-email@exemplo.com`
2. **Cores**: Edite `:root` no CSS do `index.html`
3. **Projetos**: 
   - Coloque o HTML novo em `projects/`
   - Atualize `const projects = []` no script do `index.html`
   - Crie um novo `.project-card` na seção de projetos

---

**Construído com ❤️** 🚀
