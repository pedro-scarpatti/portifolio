/**
 * Queue Service - Gerencia fila de processamento
 * Simula uma fila como RabbitMQ, SQS ou Azure Queue Storage
 */

import { Job, JobStatus } from '../models/Job.js';

export class QueueService {
    constructor(options = {}) {
        this.queue = []; // Fila principal
        this.processing = new Map(); // Jobs em processamento
        this.completed = []; // Histórico de concluídos
        this.failed = []; // Histórico de falhas
        
        this.maxSize = options.maxSize || 1000;
        this.maxConcurrent = options.maxConcurrent || 3;
        this.retentionTime = options.retentionTime || 24 * 60 * 60 * 1000;
    }

    /**
     * Adiciona um job à fila
     */
    enqueue(job) {
        if (this.queue.length >= this.maxSize) {
            throw new Error('Fila cheia');
        }

        // Verifica duplicidade na fila
        const isDuplicate = this.queue.some(j => j.hash === job.hash);
        if (isDuplicate) {
            return { added: false, reason: 'duplicate', job };
        }

        // Verifica se já está em processamento
        if (this.processing.has(job.id)) {
            return { added: false, reason: 'already_processing', job };
        }

        this.queue.push(job);
        return { added: true, job };
    }

    /**
     * Remove e retorna o próximo job da fila
     */
    dequeue() {
        if (this.queue.length === 0) {
            return null;
        }

        // Ordena por prioridade (se implementada)
        this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        const job = this.queue.shift();
        this.processing.set(job.id, job);
        job.start();
        
        return job;
    }

    /**
     * Move job para concluídos
     */
    complete(jobId, result = null) {
        const job = this.processing.get(jobId);
        
        if (!job) {
            throw new Error(`Job ${jobId} não encontrado em processamento`);
        }

        job.complete();
        job.result = result;
        
        this.processing.delete(jobId);
        this.completed.push(job);
        
        // Limita histórico
        if (this.completed.length > 100) {
            this.completed.shift();
        }

        return job;
    }

    /**
     * Move job para falhas ou volta para fila (retry)
     */
    fail(jobId, error) {
        const job = this.processing.get(jobId);
        
        if (!job) {
            throw new Error(`Job ${jobId} não encontrado em processamento`);
        }

        job.fail(error);
        this.processing.delete(jobId);

        if (job.status === JobStatus.ERROR) {
            // Máximo de tentativas atingido
            this.failed.push(job);
            
            if (this.failed.length > 100) {
                this.failed.shift();
            }
        } else {
            // Retorna para fila (retry)
            this.queue.unshift(job);
        }

        return job;
    }

    /**
     * Retorna estatísticas da fila
     */
    getStats() {
        return {
            pending: this.queue.length,
            processing: this.processing.size,
            completed: this.completed.length,
            failed: this.failed.length,
            maxSize: this.maxSize,
            maxConcurrent: this.maxConcurrent
        };
    }

    /**
     * Retorna jobs por status
     */
    getJobs(status) {
        switch (status) {
            case JobStatus.PENDING:
                return [...this.queue];
            case JobStatus.PROCESSING:
                return Array.from(this.processing.values());
            case JobStatus.COMPLETED:
                return [...this.completed];
            case JobStatus.ERROR:
                return [...this.failed];
            default:
                return [
                    ...this.queue,
                    ...this.processing.values(),
                    ...this.completed,
                    ...this.failed
                ];
        }
    }

    /**
     * Busca job por ID
     */
    findJob(jobId) {
        // Busca em todas as coleções
        return (
            this.queue.find(j => j.id === jobId) ||
            this.processing.get(jobId) ||
            this.completed.find(j => j.id === jobId) ||
            this.failed.find(j => j.id === jobId)
        );
    }

    /**
     * Limpa histórico antigo
     */
    purge() {
        const cutoff = Date.now() - this.retentionTime;
        
        this.completed = this.completed.filter(j => 
            new Date(j.completedAt).getTime() > cutoff
        );
        
        this.failed = this.failed.filter(j => 
            new Date(j.completedAt).getTime() > cutoff
        );
    }

    /**
     * Limpa toda a fila (cuidado!)
     */
    clear() {
        this.queue = [];
        this.processing.clear();
        this.completed = [];
        this.failed = [];
    }

    /**
     * Exporta estado da fila
     */
    export() {
        return {
            queue: this.queue.map(j => j.toJSON()),
            processing: Array.from(this.processing.values()).map(j => j.toJSON()),
            completed: this.completed.map(j => j.toJSON()),
            failed: this.failed.map(j => j.toJSON())
        };
    }

    /**
     * Importa estado da fila
     */
    import(data) {
        this.queue = data.queue.map(j => Job.fromJSON(j));
        this.processing = new Map(
            data.processing.map(j => [j.id, Job.fromJSON(j)])
        );
        this.completed = data.completed.map(j => Job.fromJSON(j));
        this.failed = data.failed.map(j => Job.fromJSON(j));
    }
}

// Singleton
export const queueService = new QueueService();
