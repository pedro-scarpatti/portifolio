/**
 * Idempotency Service - Gerencia idempotência de jobs
 * Simula um serviço de deduplicação como seria implementado com Redis/DynamoDB
 */

export class IdempotencyService {
    constructor(options = {}) {
        this.store = new Map(); // Simula cache distribuído
        this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24h default
        this.cleanup();
    }

    /**
     * Verifica se um job já foi processado
     */
    async check(hash) {
        const entry = this.store.get(hash);
        
        if (!entry) {
            return { exists: false };
        }

        // Verifica se expirou
        if (Date.now() > entry.expiresAt) {
            this.store.delete(hash);
            return { exists: false };
        }

        return {
            exists: true,
            jobId: entry.jobId,
            status: entry.status,
            result: entry.result
        };
    }

    /**
     * Armazena resultado de um job para idempotência
     */
    async storeResult(hash, jobId, status, result = null) {
        this.store.set(hash, {
            jobId,
            status,
            result,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.ttl
        });
    }

    /**
     * Remove entrada de idempotência
     */
    async remove(hash) {
        return this.store.delete(hash);
    }

    /**
     * Limpa entradas expiradas periodicamente
     */
    cleanup() {
        const now = Date.now();
        for (const [hash, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(hash);
            }
        }
        
        // Agenda próxima limpeza
        setTimeout(() => this.cleanup(), 60 * 60 * 1000); // A cada hora
    }

    /**
     * Retorna estatísticas do serviço
     */
    getStats() {
        const now = Date.now();
        let active = 0;
        let expired = 0;

        for (const entry of this.store.values()) {
            if (now > entry.expiresAt) {
                expired++;
            } else {
                active++;
            }
        }

        return {
            total: this.store.size,
            active,
            expired,
            ttl: this.ttl
        };
    }

    /**
     * Exporta dados para persistência
     */
    export() {
        const data = {};
        const now = Date.now();
        
        for (const [hash, entry] of this.store.entries()) {
            if (now <= entry.expiresAt) {
                data[hash] = entry;
            }
        }
        
        return data;
    }

    /**
     * Importa dados
     */
    import(data) {
        for (const [hash, entry] of Object.entries(data)) {
            if (Date.now() <= entry.expiresAt) {
                this.store.set(hash, entry);
            }
        }
    }
}

// Singleton
export const idempotencyService = new IdempotencyService();
