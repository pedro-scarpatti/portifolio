# Pedro Scarpatti — Portfolio Profissional

> **Analista de BI & Dados** — pipelines ETL, dashboards operacionais, arquitetura de dados e integração de IA para o setor público.

[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square)](https://pedro-scarpatti.github.io/portifolio/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077b5?style=flat-square&logo=linkedin)](https://linkedin.com/in/pedro-batista-2k99)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🎯 Positioning

Este portfólio demonstra **capacidade real de engenharia de dados e arquitetura de sistemas** através de demos interativas que simulam padrões usados em produção:

- **Pipeline ETL** → fila + idempotência + retry + logging estruturado
- **Motor de Busca** → índice reverso + TF-IDF/BM25 + tokenização + stemmer
- **API Gateway** → JWT + rate limiting + circuit breaker + dead letter queue
- **Dashboard Analytics** → visualização de dados + métricas + gráficos SVG animados

O site usa apenas HTML, CSS e JavaScript vanilla — provando que o desenvolvedor entende **arquitetura sem depender de frameworks**.

---

## 🔗 Links Rápidos

| Recurso | URL |
|---------|-----|
| **Site ao vivo** | `https://pedro-scarpatti.github.io/portifolio/` |
| **Pipeline ETL Simulator** | `/projects/pipeline-simulator.html` |
| **Motor de Busca (TF-IDF)** | `/projects/motor-de-busca.html` |
| **API Gateway Architecture** | `/projects/api-gateway.html` |
| **Dashboard Analytics** | `/projects/dashboard-monolith.html` |
| **GitHub** | `https://github.com/pedro-scarpatti` |
| **LinkedIn** | `https://linkedin.com/in/pedro-batista-2k99` |

---

## 💼 Projetos & Demonstrações

### ⭐ Simulador de Pipeline ETL com Fila + Idempotência

> Demo interativa que simula uma arquitetura real de pipeline de dados no navegador.

**Problema:** Pipelines de dados em produção falham silenciosamente — sem visibilidade de estado, duplicidade não detectada e logs inexistentes.

**Stack:** JavaScript ES6+ · FIFO Queue · Idempotência via Hash · Event Bus · Structured Logging · Retry Pattern · ETL Pattern

**Funcionalidades implementadas:**
- 🔀 **Fila FIFO com prioridade** — max 3 workers simultâneos
- 🔒 **Idempotência via hash** — jobs duplicados bloqueados antes do processamento
- 📊 **4 estados visíveis** — `PENDENTE → PROCESSANDO → CONCLUÍDO / ERRO` com timestamps
- 📋 **Logging estruturado** — níveis DEBUG, INFO, SUCCESS, WARNING, ERROR + exportação JSON
- ⚠️ **Simulação de falhas** — taxa configurável 0–50%
- 🔁 **Retry pattern** — até 3 tentativas automáticas
- 🔄 **ETL simulado** — normalização e enriquecimento de dados

---

### 🔍 Motor de Busca com Índice Reverso + TF-IDF

> Implementação completa de um motor de busca: tokenização, stemmer, índice invertido e ranking BM25.

**Stack:** JavaScript ES6+ · TF-IDF · Inverted Index · Tokenização · Stemming

**Funcionalidades:**
- Tokenização com stop words em português
- Stemmer (suffix stripping) para normalização
- Índice reverso com postings lists e document frequency
- Ranking BM25 com normalização por doc length
- Snippets com highlights nos termos encontrados
- Visualização do índice invertido (quais termos aparecem em quais docs)
- Análise da consulta (tokens, stems, tempo de resposta)

---

### 🌐 API Gateway — Arquitetura de Microserviços

> Demonstração visual e interativa de arquitetura de microserviços com padrões empresariais.

**Stack:** HTML5 · CSS3 · JavaScript ES6 · SVG · Arquitetura de Sistemas

**Padrões implementados:**
- ⚡ **API Gateway** — roteamento, autenticação, rate limiting
- 🔐 **JWT Auth** — token validation, refresh flow
- ⚖️ **Rate Limiting** — 100 req/min por IP
- ⟳ **Circuit Breaker** — open after 5 failures, half-open after 30s
- 📬 **Dead Letter Queue** — mensagens com falha vão pra DLQ
- 📊 **Observabilidade** — logs em tempo real, métricas de latência

---

### 🏥 Painel Operacional de Atendimento — SESA/SUS

> Sistema em produção na SESA gerenciando fluxo de atendimento de unidades de saúde pública.

**Stack:** HTML5 · CSS3 · JavaScript ES6 · LocalStorage · Event-driven UI

**Funcionalidades:**
- Exibição pública de filas em tempo real
- Controle de guichês e triage
- Dashboard operacional com métricas
- Milhares de atendimentos processados diariamente

---

### 📊 Dashboard Analytics — ETL Monolith

> Dashboard analítico demonstrando visualização de dados e mentalidade de engineering.

**Stack:** HTML5 · CSS3 · JavaScript ES6 · SVG · CSS Animations

**Funcionalidades:**
- Gráficos SVG animados (line chart, doughnut chart)
- Métricas KPIs com contadores animados
- Activity feed com estados
- Barras de skill com animação
- Design system dark consistente

---

## 🏗 Arquitetura do Simulador de Pipeline

```
┌──────────────────────────────────────────────────────┐
│                      UI LAYER                         │
│              (pipeline-simulator.html)                │
│   Métricas · Fila · Logs · Controles                  │
└──────────────────────┬───────────────────────────────┘
                       │ eventos (EventBus)
                       ▼
┌──────────────────────────────────────────────────────┐
│               PIPELINE SERVICE                        │
│          (pipeline-simulator.js — Wiring)            │
│   Orchestration · Event handling · UI updates        │
└──────────────────────┬───────────────────────────────┘
                       │ calls
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│  Job Model  │ │ Validator│ │  EventBus    │
│  (Job.js)   │ │(DataVal..│ │  (PUB/SUB)   │
└─────────────┘ └──────────┘ └──────────────┘

          ┌────────────┐  ┌────────────────────┐
          │QueueService│  │IdempotencyService  │
          │  (FIFO)    │  │ (Hash → Cache)     │
          └──────┬─────┘  └─────────┬──────────┘
                 │ dequeue           │ hash check
                 ▼                   ▼
┌──────────────────────────────────────────────────────┐
│           PIPELINE PROCESSOR                         │
│        (async workers, retry, ETL)                    │
│  • simulação de delay                                │
│  • simulação de falhas (configurável)               │
│  • enriquecimento de dados                           │
└──────────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│              LOGGING SERVICE                         │
│           (Logger.js — Structured)                   │
│  Timestamps · Níveis · Metadata · Export            │
└──────────────────────────────────────────────────────┘
```

### Decisões Arquiteturais

| Decisão | Por quê |
|---------|---------|
| **Separação modules/** | Mentalidade de engenharia — cada módulo é independente como um microserviço |
| **FIFO com prioridade** | Simula priority queues reais (RabbitMQ, SQS) |
| **Hash de idempotência** | Padrão crítico em sistemas distribuídos — evita double-processing |
| **Event Bus (PUB/SUB)** | Comunicação desacoplada — se um módulo quebra, os outros continuam |
| **Retry com limite** | Circuit breaker pattern — falha rápida após N tentativas |
| **Structured Logging** | Mesma prática de logging em sistemas Python de produção |
| **JavaScript vanilla** | Dominação da plataforma sem muleta de framework |

---

## 🛠 Stack & Ferramentas

### Dados & BI
| Tecnologia | Uso |
|-----------|-----|
| SQL / PostgreSQL / SQL Server | Uso diário — queries, modelagem, otimização |
| Python (Pandas, Scripts, ETL) | Uso diário — automação, análise, pipelines |
| Power BI / Dashboards | Uso diário — visualização para decisão |
| MongoDB | Projeto — base de dados não-relacional |

### IA & Processamento de Dados
| Tecnologia | Uso |
|-----------|-----|
| OCR (Tesseract / API) | Projeto — extração de dados de documentos |
| Índice Reverso / BM25 | Projeto — busca em grande escala |
| LLMs / Integração IA | Aprendendo — RAG, embeddings |
| Busca Vetorial | Aprendendo — ChromaDB, Pinecone |

### Desenvolvimento & Infra
| Tecnologia | Uso |
|-----------|-----|
| JavaScript ES6+ / TypeScript | Projeto — front-end e integrações |
| React / Astro | Projeto — construção de interfaces |
| Git / GitHub | Uso diário — versionamento |
| Docker / Cloud (AWS/GCP) | Aprendendo — containerização e cloud |

---

## 🚀 Como Rodar

### Local (recomendado)

Precisa de um servidor HTTP por causa dos módulos ES6:

```bash
# Python
cd portifolio
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
| Estados do pipeline | ✅ |
| Logging estruturado multi-nível | ✅ |
| Simulação de falhas configurável | ✅ |
| Retry com limite de tentativas | ✅ |
| Transformação de dados (ETL) | ✅ |
| Event Bus (PUB/SUB) | ✅ |
| FIFO com prioridade | ✅ |
| Cache de resultados com TTL | ✅ |
| Exportação de logs (JSON) | ✅ |
| Módulos ES6 separados | ✅ |
| Índice reverso (TF-IDF/BM25) | ✅ |
| API Gateway (routing, JWT, rate limit) | ✅ |
| Circuit Breaker pattern | ✅ |
| Dead Letter Queue | ✅ |
| UI responsiva | ✅ |
| Sem frameworks externos | ✅ |
| SEO meta tags | ✅ |
| Acessibilidade (focus-visible, semantic HTML) | ✅ |

---

## 📁 Estrutura do Projeto

```
portifolio/
├── index.html                          # Página principal
│
├── projects/
│   ├── pipeline-simulator.html         # ⭐ Demo: Pipeline ETL
│   ├── motor-de-busca.html             # Demo: Índice Reverso + TF-IDF
│   ├── api-gateway.html                # Demo: API Gateway
│   ├── dashboard-monolith.html         # Demo: Dashboard Analytics
│   ├── Gerenciador de Senhas.html      # Produção: SESA/SUS
│   └── monolithic-article-editor.html   # Editor WYSIWYG
│
├── js/
│   ├── main.js                         # Navegação e efeitos
│   ├── pipeline-simulator.js           # Wiring UI ↔ modules
│   └── modules/
│       ├── models/
│       │   └── Job.js                  # Modelo (estados, hash, retry)
│       ├── processors/
│       │   └── PipelineProcessor.js
│       ├── services/
│       │   ├── QueueService.js          # FIFO com prioridade
│       │   └── IdempotencyService.js   # Hash deduplication
│       ├── validators/
│       │   └── DataValidator.js
│       └── utils/
│           ├── EventBus.js             # PUB/SUB
│           └── Logger.js               # Structured logging
│
└── css/
    ├── variables.css
    ├── base.css
    ├── layout.css
    ├── components.css
    ├── pages.css
    └── pipeline-simulator.css
```

---

## 📬 Contato

- 📧 **Email:** scarpatti.pedro@gmail.com
- 💻 **GitHub:** github.com/pedro-scarpatti
- 💼 **LinkedIn:** linkedin.com/in/pedro-batista-2k99

Procuro oportunidades em **BI, dados ou desenvolvimento** — remote ou híbrido.

---

## 📄 Licença

MIT — sinta-se livre para usar como template, mas personalize com seus próprios projetos.
