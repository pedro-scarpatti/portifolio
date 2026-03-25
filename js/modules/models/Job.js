/**
 * Job Model - Representa uma unidade de trabalho no pipeline
 * Simula um modelo de dados que seria usado em um backend real
 */

export const JobStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

export class Job {
    constructor(data) {
        this.id = this.generateId();
        this.data = data;
        this.status = JobStatus.PENDING;
        this.createdAt = new Date();
        this.startedAt = null;
        this.completedAt = null;
        this.error = null;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.hash = this.calculateHash();
    }

    /**
     * Gera um ID único para o job
     * Simula UUID generation de um backend
     */
    generateId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calcula hash dos dados para idempotência
     * Permite detectar jobs duplicados
     */
    calculateHash() {
        const str = JSON.stringify(this.data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `hash_${Math.abs(hash).toString(16)}`;
    }

    /**
     * Inicia o processamento do job
     */
    start() {
        this.status = JobStatus.PROCESSING;
        this.startedAt = new Date();
        this.attempts++;
    }

    /**
     * Marca o job como concluído
     */
    complete() {
        this.status = JobStatus.COMPLETED;
        this.completedAt = new Date();
    }

    /**
     * Marca o job com erro
     */
    fail(error) {
        this.error = error;
        if (this.attempts >= this.maxAttempts) {
            this.status = JobStatus.ERROR;
            this.completedAt = new Date();
        } else {
            this.status = JobStatus.PENDING;
        }
    }

    /**
     * Retorna a duração do processamento
     */
    getDuration() {
        if (!this.startedAt) return 0;
        const end = this.completedAt || new Date();
        return end - this.startedAt;
    }

    /**
     * Serializa o job para persistência/transmissão
     */
    toJSON() {
        return {
            id: this.id,
            data: this.data,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
            startedAt: this.startedAt?.toISOString(),
            completedAt: this.completedAt?.toISOString(),
            attempts: this.attempts,
            error: this.error,
            hash: this.hash
        };
    }

    /**
     * Recria um job a partir de dados serializados
     */
    static fromJSON(json) {
        const job = new Job(json.data);
        job.id = json.id;
        job.status = json.status;
        job.createdAt = new Date(json.createdAt);
        job.startedAt = json.startedAt ? new Date(json.startedAt) : null;
        job.completedAt = json.completedAt ? new Date(json.completedAt) : null;
        job.attempts = json.attempts;
        job.error = json.error;
        job.hash = json.hash;
        return job;
    }
}
