# Pedro Scarpatti — Portfolio Profissional

> **Backend Developer & Data Engineer** focado em C#, .NET, SQL Server e pipelines de processamento de dados.

[![Portfolio](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square)](https://pedro-scarpatti.github.io/Pagina_Portifolio/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-semantic-e34f26?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-custom%20properties-1572b6?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🎯 O que é

Um portfólio que vai além do visual — demonstra **capacidade real de engenharia** através de uma demo interativa funcional (o Simulador de Pipeline de Dados). O site usa apenas HTML, CSS e JavaScript vanilla, provando que o desenvolvedor entende arquitetura antes de usar frameworks.

O objetivo: um recrutador que abre o código deve pensar *"esse dev entende como sistemas de dados funcionam em produção"* — não apenas "sabe fazer um site".

---

## 🔗 Links Rápidos

| Recurso | URL |
|---------|-----|
| **Site ao vivo** | `https://pedro-scarpatti.github.io/Pagina_Portifolio/` |
| **Pipeline Demo** | `/pipeline-simulator.html` |
| **GitHub** | `https://github.com/pedro-scarpatti` |
| **LinkedIn** | `https://linkedin.com/in/pedro-batista-2k99` |

---

## 💼 Projetos Principais

### ⭐ Simulador de Pipeline de Processamento de Dados _(projeto destaque)_

> Demo interativa que simula uma arquitetura real de pipeline de dados no navegador.

**Problema que resolve:** Pipelines de dados em produção falham silenciosamente — sem visibilidade de estado, duplicidade não detectada e logs inexistentes.

**Funcionalidades implementadas:**

- 🔀 **Fila FIFO com prioridade** — jobs ordenados por criticidade, max 3 workers simultâneos
- 🔒 **Idempotência via hash** — jobs duplicados bloqueados antes do processamento
- 📊 **4 estados visíveis** — `PENDENTE → PROCESSANDO → CONCLUÍDO / ERRO` com timestamps
- 📋 **Logging estruturado** — níveis DEBUG, INFO, SUCCESS, WARNING, ERROR + exportação JSON
- ⚠️ **Simulação de falhas** — taxa configurável 0–50%, erros realistas de produção
- 🔁 **Retry pattern** — até 3 tentativas automáticas com backoff
- 🔄 **ETL simulado** — normalização e enriquecimento de dados com metadata

**Arquitetura técnica (seção própria abaixo ↓)**

---

### 🏥 Sistema de Senhas e Atendimentos (SESA/SUS)

**Stack:** HTML5 · CSS3 · JavaScript ES6 · LocalStorage · Event-driven UI

- Painel operacional com controle de guichês e triage
- Dashboard ao vivo com métricas em tempo real
- Fila ordenada por prioridade e categoria
- Persistência em LocalStorage

---

### ✍️ Editor de Artigos

**Stack:** HTML5 · CSS3 · JavaScript ES6 · ContentEditable API · LocalStorage

- Editor WYSIWYG com toolbar contextual
- Preview em tempo real com formatação live
- Categorização e busca de artigos
- Publicação integrada

---

## 🏗 Arquitetura do Simulador de Pipeline

```
┌─────────────────────────────────────────────────────┐
│                      UI LAYER                        │
│              (pipeline-simulator.html)               │
│   Métricas · Fila · Logs · Controles                 │
└──────────────────────┬──────────────────────────────┘
                       │ eventos
                       ▼
┌─────────────────────────────────────────────────────┐
│               PIPELINE SERVICE                       │
│          (pipeline-simulator.js — Wiring)            │
│   Orchestration · Event handling · UI updates        │
└──────────────────────┬──────────────────────────────┘
                       │ calls
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│  Job Model  │ │ Validator│ │ EventBus      │
│  (Job.js)   │ │(DataVal..│ │ (PUB/SUB)    │
└─────────────┘ └──────────┘ └──────────────┘

          ┌────────────┐  ┌────────────────────┐
          │ QueueService│  │IdempotencyService  │
          │  (FIFO)     │  │ (Hash → Cache)     │
          └──────┬──────┘  └─────────┬──────────┘
                 │ dequeue            │ hash check
                 ▼                    ▼
┌──────────────────────────────────────────────┐
│           PIPELINE PROCESSOR                  │
│        (async workers, retry, ETL)           │
│  • simulação de delay                        │
│  • simulação de falhas (configurável)       │
│  • enriquecimento de dados                   │
└──────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│              LOGGING SERVICE                  │
│           (Logger.js — Structured)           │
│  Timestamps · Níveis · Metadata · Export    │
└──────────────────────────────────────────────┘
```

### Decisões Arquiteturais

| Decisão | Por quê |
|---------|---------|
| **Separação services/processors/validators** | Mentalidade de backend real — cada módulo é como um microserviço independente |
| **FIFO com prioridade** | Simula Azure Service Bus / RabbitMQ com priority queues |
| **Hash de idempotência** | Padrão crítico em sistemas distributed (evita double-processing) |
| **Event Bus (PUB/SUB)** | Comunicação desacoplada — se um módulo quebra, os outros continuam |
| **Retry com limite** | Implementa circuit breaker pattern — falha rápida após N tentativas |
| **Structured Logging** | Mesma prática de Serilog/NLog em .NET — logs查询áveis em produção |
| **JavaScript vanilla** | Dominação da plataforma sem muleta de framework |

---

## 🛠 Stack & Ferramentas

### Backend
| Tecnologia | Nível |
|-----------|-------|
| C# / .NET 8 | Avançado |
| SQL Server / T-SQL | Avançado |
| ASP.NET Core | Intermediário |
| Entity Framework Core | Intermediário |
| REST APIs | Intermediário |
| Dapper | Intermediário |

### Data & ETL
| Tecnologia | Nível |
|-----------|-------|
| Pipelines / ETL | Intermediário |
| Power BI | Básico |
| Python | Básico |

### DevOps & Frontend
| Tecnologia | Nível |
|-----------|-------|
| Git | Intermediário |
| Docker | Básico |
| JavaScript ES6+ | Intermediário |
| HTML5 / CSS3 | Intermediário |

---

## 🚀 Como Rodar

### Local (recomendado)

Precisa de um servidor HTTP por causa dos módulos ES6:

```bash
# Python (já vem no Windows/macOS)
cd Pagina_Portifolio
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Acesse `http://localhost:8080`

> ⚠️ Os módulos JavaScript usam `type="module"` — Chrome/Firefox bloqueiam execução via `file://` por CORS.

### GitHub Pages

1. Fork ou clone este repositório
2. Habilite GitHub Pages em **Settings → Pages → Source: main**
3. Acesse `https://[seu-user].github.io/[repo]/`

---

## ✅ Checklist de Qualidade

| Área | Implementado |
|------|:---:|
| Validação de input (schema) | ✅ |
| Deduplicação por hash (idempotência) | ✅ |
| Estados do pipeline (PENDENTE/PROCESSANDO/CONCLUÍDO/ERRO) | ✅ |
| Logging estruturado multi-nível | ✅ |
| Simulação de falhas configurável | ✅ |
| Retry com limite de tentativas | ✅ |
| Transformação de dados (ETL) | ✅ |
| Event Bus (PUB/SUB) | ✅ |
| FIFO com prioridade | ✅ |
| Cache de resultados com TTL (idempotência) | ✅ |
| Exportação de logs (JSON) | ✅ |
| Módulos ES6 separados por responsabilidade | ✅ |
| UI responsiva | ✅ |
| Sem frameworks externos | ✅ |
| SEO meta tags | ✅ |
| Acessibilidade (focus-visible, semantic HTML) | ✅ |
| Tema dark (reduz consumo de energia em OLED) | ✅ |

---

## 📁 Estrutura do Projeto

```
Pagina_Portifolio/
├── index.html                     # Página principal (portfólio)
├── pipeline-simulator.html        # Demo interativa do pipeline
│
├── js/
│   ├── main.js                    # Navegação e efeitos do index
│   ├── pipeline-simulator.js      # Wiring UI ↔ pipeline modules
│   └── modules/
│       ├── models/
│       │   └── Job.js            # Modelo (estados, hash, retry, ETL)
│       ├── processors/
│       │   └── PipelineProcessor.js  # Motor async (workers)
│       ├── services/
│       │   ├── QueueService.js       # FIFO + prioridade
│       │   └── IdempotencyService.js # Deduplicação via hash
│       ├── validators/
│       │   └── DataValidator.js      # Camada de validação
│       └── utils/
│           ├── EventBus.js          # PUB/SUB (message broker)
│           └── Logger.js            # Logging estruturado
│
├── projects/
│   ├── Gerenciador de Senhas.html    # Sistema de filas SUS
│   └── monolithic-article-editor.html # Editor WYSIWYG
│
└── css/
    ├── variables.css           # Design tokens
    ├── base.css               # Reset + globais
    ├── layout.css             # Layout + responsivo
    ├── components.css         # Componentes reutilizáveis
    ├── pages.css              # Estilos de páginas extras
    └── pipeline-simulator.css # Estilos do simulador
```

---

## 🔧 Possíveis Melhorias

- [ ] **Persistência em IndexedDB** — fila e resultados persistem entre reloads
- [ ] **Web Workers** — processar items em thread separada (UI não trava)
- [ ] **Gráfico de throughput** — mostrar items processados por segundo
- [ ] **Histórico de execuções** — salvar runs anteriores para comparação
- [ ] **Drag-and-drop** — reordenar items na fila antes de processar
- [ ] **Mais tipos de job** — `payment`, `invoice`, `shipment` com validações específicas
- [ ] **Dark/light theme toggle** — via CSS custom properties
- [ ] **CI/CD** — GitHub Actions para deploy automático no push

---

## 📬 Contato

- 📧 **Email:** scarpatti.pedro@gmail.com
- 💻 **GitHub:** github.com/pedro-scarpatti
- 💼 **LinkedIn:** linkedin.com/in/pedro-batista-2k99

Procuro oportunidades em **backend, dados ou pipelines** — remote ou híbrido.

---

## 📄 Licença

MIT — sinta-se livre para usar como template, mas personalize com seus próprios projetos e informações.
