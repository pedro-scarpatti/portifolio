/**
 * Pipeline Processor - Motor de processamento de dados
 * Simula um worker service que processa jobs de uma fila
 */

import { Job, JobStatus } from '../models/Job.js';
import { queueService } from '../services/QueueService.js';
import { idempotencyService } from '../services/IdempotencyService.js';
import { appLogger } from '../utils/Logger.js';
import { eventBus, PipelineEvents } from '../utils/EventBus.js';

export class PipelineProcessor {
    constructor(options = {}) {
        this.isRunning = false;
        this.processingInterval = null;
        this.processingDelay = options.processingDelay || 1000;
        this.failureRate = options.failureRate ?? 0.1; // 10% default
        this.concurrentJobs = 0;
        this.maxConcurrent = options.maxConcurrent || 3;
    }

    set failureRate(value) {
        this._failureRate = Math.max(0, Math.min(1, value));
    }

    get failureRate() {
        return this._failureRate ?? 0.1;
    }

    /**
     * Inicia o processador
     */
    start() {
        if (this.isRunning) {
            appLogger.warn('Pipeline já está em execução');
            return;
        }

        this.isRunning = true;
        appLogger.info('Pipeline processor iniciado');
        eventBus.publish(PipelineEvents.METRICS_UPDATED, this.getMetrics());

        // Loop principal de processamento
        this.processingInterval = setInterval(() => {
            this.processLoop();
        }, this.processingDelay);
    }

    /**
     * Para o processador
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        clearInterval(this.processingInterval);
        appLogger.info('Pipeline processor parado');
    }

    /**
     * Loop principal de processamento
     */
    async processLoop() {
        if (!this.isRunning) return;
        if (this.concurrentJobs >= this.maxConcurrent) return;

        const job = queueService.dequeue();
        if (!job) return;

        this.concurrentJobs++;
        
        try {
            await this.processJob(job);
        } finally {
            this.concurrentJobs--;
        }
    }

    /**
     * Processa um job individual
     */
    async processJob(job) {
        appLogger.logPipeline(job.id, 'PROCESS', 'started', {
            hash: job.hash,
            attempt: job.attempts
        });

        eventBus.publish(PipelineEvents.JOB_STARTED, { jobId: job.id });

        try {
            // Verifica idempotência
            const idempotencyCheck = await idempotencyService.check(job.hash);
            
            if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
                appLogger.logPipeline(job.id, 'IDEMPOTENCY', 'deduplicated', {
                    originalJobId: idempotencyCheck.jobId
                });
                
                queueService.complete(job.id, idempotencyCheck.result);
                eventBus.publish(PipelineEvents.JOB_COMPLETED, { 
                    jobId: job.id, 
                    deduplicated: true 
                });
                return;
            }

            // Simula processamento
            await this.simulateProcessing(job);

            // Processa dados
            const result = await this.transformData(job.data);

            // Armazena resultado para idempotência
            await idempotencyService.storeResult(job.hash, job.id, 'completed', result);

            // Completa o job
            queueService.complete(job.id, result);
            
            appLogger.logPipeline(job.id, 'PROCESS', 'success', { 
                duration: job.getDuration() 
            });
            
            eventBus.publish(PipelineEvents.JOB_COMPLETED, { jobId: job.id, result });

        } catch (error) {
            await this.handleError(job, error);
        }

        eventBus.publish(PipelineEvents.QUEUE_UPDATED, queueService.getStats());
    }

    /**
     * Simula tempo de processamento
     */
    simulateProcessing(job) {
        return new Promise((resolve, reject) => {
            const duration = 500 + Math.random() * 1500; // 0.5s - 2s
            
            setTimeout(() => {
                // Simula falhas aleatórias
                if (Math.random() < this.failureRate) {
                    reject(new Error('Simulated processing error'));
                } else {
                    resolve();
                }
            }, duration);
        });
    }

    /**
     * Transforma dados (simula ETL)
     */
    async transformData(data) {
        // Simula transformações de dados
        const transformations = [];
        
        // Validação
        transformations.push({ step: 'validate', status: 'ok' });
        
        // Normalização
        const normalized = this.normalizeData(data);
        transformations.push({ step: 'normalize', status: 'ok' });
        
        // Enriquecimento
        const enriched = this.enrichData(normalized);
        transformations.push({ step: 'enrich', status: 'ok' });
        
        return {
            processed: true,
            timestamp: new Date().toISOString(),
            transformations,
            data: enriched
        };
    }

    /**
     * Normaliza dados
     */
    normalizeData(data) {
        return {
            ...data,
            _normalized: true,
            _normalizedAt: new Date().toISOString()
        };
    }

    /**
     * Enriquece dados
     */
    enrichData(data) {
        return {
            ...data,
            _enriched: true,
            _metadata: {
                source: 'pipeline-processor',
                version: '1.0.0',
                processedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Trata erros de processamento
     */
    async handleError(job, error) {
        appLogger.logPipeline(job.id, 'PROCESS', 'error', { 
            error: error.message,
            attempt: job.attempts 
        });

        // Verifica se deve retry
        queueService.fail(job.id, error.message);

        if (job.status === JobStatus.ERROR) {
            // Máximo de tentativas atingido
            await idempotencyService.storeResult(job.hash, job.id, 'error', { 
                error: error.message 
            });
            
            eventBus.publish(PipelineEvents.JOB_FAILED, { 
                jobId: job.id, 
                error: error.message 
            });
        } else {
            // Retry
            eventBus.publish(PipelineEvents.JOB_RETRY, { 
                jobId: job.id, 
                attempt: job.attempts 
            });
        }

        eventBus.publish(PipelineEvents.ERROR, { 
            jobId: job.id, 
            error: error.message 
        });
    }

    /**
     * Adiciona job ao pipeline
     */
    async submitJob(data) {
        const job = new Job(data);
        
        appLogger.logPipeline(job.id, 'SUBMIT', 'received', { hash: job.hash });

        // Verifica idempotência antes de enfileirar
        const idempotencyCheck = await idempotencyService.check(job.hash);
        
        if (idempotencyCheck.exists) {
            appLogger.logPipeline(job.id, 'IDEMPOTENCY', 'found', {
                status: idempotencyCheck.status,
                originalJobId: idempotencyCheck.jobId
            });
        }

        const result = queueService.enqueue(job);
        
        if (result.added) {
            eventBus.publish(PipelineEvents.JOB_CREATED, { jobId: job.id });
            eventBus.publish(PipelineEvents.QUEUE_UPDATED, queueService.getStats());
            appLogger.logPipeline(job.id, 'ENQUEUE', 'success');
        } else {
            appLogger.logPipeline(job.id, 'ENQUEUE', 'rejected', { 
                reason: result.reason 
            });
        }

        return { jobId: job.id, added: result.added, reason: result.reason };
    }

    /**
     * Retorna métricas do processador
     */
    getMetrics() {
        const queueStats = queueService.getStats();
        const idempotencyStats = idempotencyService.getStats();

        return {
            ...queueStats,
            idempotency: idempotencyStats,
            isRunning: this.isRunning,
            concurrentJobs: this.concurrentJobs,
            maxConcurrent: this.maxConcurrent
        };
    }

    /**
     * Retorna estado completo para persistência
     */
    exportState() {
        return {
            queue: queueService.export(),
            idempotency: idempotencyService.export(),
            isRunning: this.isRunning,
            metrics: this.getMetrics()
        };
    }

    /**
     * Importa estado
     */
    importState(state) {
        if (state.queue) {
            queueService.import(state.queue);
        }
        if (state.idempotency) {
            idempotencyService.import(state.idempotency);
        }
    }
}

// Singleton
export const pipelineProcessor = new PipelineProcessor();
