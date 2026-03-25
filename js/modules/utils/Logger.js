/**
 * Logger - Sistema de logging estruturado
 * Simula um sistema de logging de backend (Serilog, NLog, etc.)
 */

export const LogLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

export class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.listeners = [];
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * Adiciona um listener para eventos de log
     */
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Emite um log para todos os listeners
     */
    emit(logEntry) {
        this.logs.push(logEntry);
        
        // Mantém apenas os últimos logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Notifica listeners
        this.listeners.forEach(listener => {
            try {
                listener(logEntry);
            } catch (error) {
                console.error('Erro no listener de log:', error);
            }
        });

        // Também loga no console em desenvolvimento
        if (process?.env?.NODE_ENV === 'development' || true) {
            const styles = this.getConsoleStyles(logEntry.level);
            console.log(
                `%c[${logEntry.timestamp}] [${logEntry.context}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`,
                styles
            );
        }
    }

    getConsoleStyles(level) {
        const styles = {
            [LogLevel.DEBUG]: 'color: #6b7280',
            [LogLevel.INFO]: 'color: #06b6d4',
            [LogLevel.SUCCESS]: 'color: #10b981',
            [LogLevel.WARNING]: 'color: #f59e0b',
            [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold'
        };
        return styles[level] || '';
    }

    /**
     * Cria uma entrada de log
     */
    createEntry(level, message, metadata = {}) {
        return {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            metadata
        };
    }

    debug(message, metadata) {
        this.emit(this.createEntry(LogLevel.DEBUG, message, metadata));
    }

    info(message, metadata) {
        this.emit(this.createEntry(LogLevel.INFO, message, metadata));
    }

    success(message, metadata) {
        this.emit(this.createEntry(LogLevel.SUCCESS, message, metadata));
    }

    warn(message, metadata) {
        this.emit(this.createEntry(LogLevel.WARNING, message, metadata));
    }

    error(message, metadata) {
        this.emit(this.createEntry(LogLevel.ERROR, message, metadata));
    }

    /**
     * Log estruturado para operações do pipeline
     */
    logPipeline(jobId, operation, status, details = {}) {
        const message = `Job ${jobId}: ${operation} - ${status}`;
        const level = status === 'success' ? LogLevel.SUCCESS : 
                      status === 'error' ? LogLevel.ERROR : LogLevel.INFO;
        
        this.emit(this.createEntry(level, message, {
            jobId,
            operation,
            status,
            ...details
        }));
    }

    /**
     * Retorna todos os logs
     */
    getLogs(filter = {}) {
        let result = [...this.logs];

        if (filter.level) {
            result = result.filter(log => log.level === filter.level);
        }

        if (filter.context) {
            result = result.filter(log => log.context === filter.context);
        }

        if (filter.since) {
            result = result.filter(log => new Date(log.timestamp) >= filter.since);
        }

        return result;
    }

    /**
     * Limpa todos os logs
     */
    clear() {
        this.logs = [];
    }

    /**
     * Exporta logs em formato estruturado
     */
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }
        
        if (format === 'text') {
            return this.logs.map(log => 
                `[${log.timestamp}] [${log.context}] ${log.level.toUpperCase()}: ${log.message}`
            ).join('\n');
        }

        return this.logs;
    }
}

// Logger global para a aplicação
export const appLogger = new Logger('PipelineSimulator');
