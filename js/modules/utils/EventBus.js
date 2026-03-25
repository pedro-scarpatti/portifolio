/**
 * EventBus - Sistema de eventos pub/sub
 * Simula um message broker como RabbitMQ, Kafka ou Azure Service Bus
 */

export class EventBus {
    constructor() {
        this.subscribers = new Map();
        this.history = [];
        this.maxHistory = 100;
    }

    /**
     * Subscreve em um evento
     */
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        
        this.subscribers.get(event).add(callback);

        // Retorna função para unsubscribir
        return () => {
            this.subscribers.get(event)?.delete(callback);
        };
    }

    /**
     * Publica um evento
     */
    publish(event, data) {
        const eventData = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: event,
            data,
            timestamp: new Date().toISOString()
        };

        // Armazena no histórico
        this.history.push(eventData);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Notifica subscribers
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data, eventData);
                } catch (error) {
                    console.error(`Erro ao processar evento ${event}:`, error);
                }
            });
        }

        // Notifica wildcards
        const wildcards = this.subscribers.get('*');
        if (wildcards) {
            wildcards.forEach(callback => {
                try {
                    callback(data, eventData);
                } catch (error) {
                    console.error(`Erro ao processar evento wildcard:`, error);
                }
            });
        }
    }

    /**
     * Publica e aguarda resposta (simula request/response)
     */
    async publishAndWait(event, data, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const correlationId = `corr_${Date.now()}`;
            const responseEvent = `${event}:response:${correlationId}`;
            
            // Setup listener para resposta
            const unsubscribe = this.subscribe(responseEvent, (response) => {
                unsubscribe();
                clearTimeout(timer);
                resolve(response);
            });

            // Timeout
            const timer = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Timeout aguardando resposta para ${event}`));
            }, timeout);

            // Publica evento com correlation ID
            this.publish(event, {
                ...data,
                correlationId,
                responseEvent
            });
        });
    }

    /**
     * Retorna histórico de eventos
     */
    getHistory(eventType = null) {
        if (eventType) {
            return this.history.filter(e => e.type === eventType);
        }
        return [...this.history];
    }

    /**
     * Limpa histórico
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Retorna estatísticas do event bus
     */
    getStats() {
        const stats = {
            totalEvents: this.history.length,
            eventsByType: {},
            totalSubscribers: 0
        };

        this.history.forEach(event => {
            stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
        });

        this.subscribers.forEach((callbacks, event) => {
            stats.totalSubscribers += callbacks.size;
        });

        return stats;
    }
}

// Event bus global
export const eventBus = new EventBus();

// Eventos do pipeline
export const PipelineEvents = {
    JOB_CREATED: 'job:created',
    JOB_STARTED: 'job:started',
    JOB_COMPLETED: 'job:completed',
    JOB_FAILED: 'job:failed',
    JOB_RETRY: 'job:retry',
    QUEUE_UPDATED: 'queue:updated',
    METRICS_UPDATED: 'metrics:updated',
    ERROR: 'pipeline:error'
};
