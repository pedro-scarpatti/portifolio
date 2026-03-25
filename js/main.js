/**
 * Main Application Module
 * Ponto de entrada da aplicação
 */

import { appLogger } from './modules/utils/Logger.js';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    appLogger.info('Aplicação inicializada');
    
    initNavigation();
    initSmoothScroll();
    initScrollEffects();
});

/**
 * Inicializa navegação mobile
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Fecha menu ao clicar em um link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Atualiza link ativo baseado na seção visível
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Inicializa scroll suave
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Efeitos de scroll
 */
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Mostra modal de arquitetura
 */
window.showArchitecture = function(project) {
    const architectures = {
        pipeline: {
            title: 'Arquitetura do Pipeline de Dados',
            diagram: `
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                   (Browser - UI)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│              (Simulado no frontend)                         │
│  • Validação de entrada                                     │
│  • Rate limiting                                            │
│  • Autenticação                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   QUEUE SERVICE                             │
│              (In-Memory Queue)                              │
│  • Gerenciamento de filas                                   │
│  • Ordenação por prioridade                                 │
│  • Controle de concorrência                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  WORKER 1    │ │  WORKER 2    │ │  WORKER 3    │
│ (Processor)  │ │ (Processor)  │ │ (Processor)  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                IDEMPOTENCY SERVICE                          │
│              (Deduplication Cache)                          │
│  • Verificação de duplicatas                                │
│  • Armazenamento de resultados                              │
│  • TTL (Time-To-Live)                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  LOGGING SERVICE                            │
│              (Structured Logging)                           │
│  • Eventos estruturados                                     │
│  • Múltiplos níveis (DEBUG, INFO, ERROR)                    │
│  • Exportação de logs                                       │
└─────────────────────────────────────────────────────────────┘
            `,
            description: `
<p><strong>Componentes:</strong></p>
<ul>
    <li><strong>Job Model:</strong> Representa uma unidade de trabalho com estados, hash de idempotência e retry</li>
    <li><strong>Queue Service:</strong> Gerencia fila FIFO com prioridade e controle de concorrência</li>
    <li><strong>Pipeline Processor:</strong> Workers que processam jobs com lógica ETL</li>
    <li><strong>Idempotency Service:</strong> Evita processamento duplicado via hash dos dados</li>
    <li><strong>Logger:</strong> Sistema de logging estruturado com múltiplos níveis</li>
    <li><strong>Event Bus:</strong> Pub/sub para comunicação entre componentes</li>
</ul>
<p><strong>Padrões Aplicados:</strong></p>
<ul>
    <li>Queue-Based Load Leveling</li>
    <li>Idempotency Pattern</li>
    <li>Retry Pattern com Circuit Breaker</li>
    <li>Event-Driven Architecture</li>
    <li>Repository Pattern (simulado)</li>
</ul>
            `
        }
    };

    const arch = architectures[project];
    if (!arch) return;

    const modal = document.createElement('div');
    modal.className = 'architecture-modal active';
    modal.innerHTML = `
        <div class="architecture-content">
            <button class="close-modal" onclick="this.closest('.architecture-modal').remove()">&times;</button>
            <h2>${arch.title}</h2>
            <pre class="architecture-diagram">${arch.diagram}</pre>
            ${arch.description}
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
};
