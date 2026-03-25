/**
 * Data Validator - Validação de dados de entrada
 * Simula camada de validação de um backend
 */

export class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

export class DataValidator {
    constructor() {
        this.rules = new Map();
        this.setupDefaultRules();
    }

    setupDefaultRules() {
        // Regras de validação padrão
        this.rules.set('required', (value, field) => {
            if (value === null || value === undefined || value === '') {
                throw new ValidationError(`Campo ${field} é obrigatório`, field);
            }
            return true;
        });

        this.rules.set('string', (value, field) => {
            if (typeof value !== 'string') {
                throw new ValidationError(`Campo ${field} deve ser uma string`, field);
            }
            return true;
        });

        this.rules.set('number', (value, field) => {
            if (typeof value !== 'number' || isNaN(value)) {
                throw new ValidationError(`Campo ${field} deve ser um número`, field);
            }
            return true;
        });

        this.rules.set('email', (value, field) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                throw new ValidationError(`Campo ${field} deve ser um email válido`, field);
            }
            return true;
        });

        this.rules.set('min', (value, field, min) => {
            if (typeof value === 'string' && value.length < min) {
                throw new ValidationError(`Campo ${field} deve ter no mínimo ${min} caracteres`, field);
            }
            if (typeof value === 'number' && value < min) {
                throw new ValidationError(`Campo ${field} deve ser no mínimo ${min}`, field);
            }
            return true;
        });

        this.rules.set('max', (value, field, max) => {
            if (typeof value === 'string' && value.length > max) {
                throw new ValidationError(`Campo ${field} deve ter no máximo ${max} caracteres`, field);
            }
            if (typeof value === 'number' && value > max) {
                throw new ValidationError(`Campo ${field} deve ser no máximo ${max}`, field);
            }
            return true;
        });

        this.rules.set('json', (value, field) => {
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    throw new ValidationError(`Campo ${field} deve ser um JSON válido`, field);
                }
            }
            if (typeof value !== 'object') {
                throw new ValidationError(`Campo ${field} deve ser um objeto ou JSON válido`, field);
            }
            return true;
        });
    }

    /**
     * Adiciona uma regra de validação customizada
     */
    addRule(name, validatorFn) {
        this.rules.set(name, validatorFn);
    }

    /**
     * Valida um objeto contra um schema
     */
    validate(data, schema) {
        const errors = [];
        const validated = {};

        for (const [field, rules] of Object.entries(schema)) {
            try {
                const value = data[field];
                
                // Aplica cada regra do campo
                for (const rule of rules) {
                    const [ruleName, ...params] = rule.split(':');
                    const validator = this.rules.get(ruleName);
                    
                    if (!validator) {
                        throw new Error(`Regra de validação desconhecida: ${ruleName}`);
                    }
                    
                    validator(value, field, ...params);
                }

                validated[field] = value;
            } catch (error) {
                if (error instanceof ValidationError) {
                    errors.push({ field: error.field, message: error.message });
                } else {
                    errors.push({ field, message: error.message });
                }
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(
                `Validação falhou: ${errors.map(e => e.message).join(', ')}`,
                errors.map(e => e.field).join(', ')
            );
        }

        return validated;
    }

    /**
     * Valida dados brutos de entrada do pipeline
     */
    validatePipelineInput(input) {
        const schema = {
            name: ['required', 'string', 'min:1', 'max:100'],
            data: ['required', 'json'],
            priority: ['number'],
            retryEnabled: [] // opcional
        };

        try {
            const parsed = typeof input === 'string' ? JSON.parse(input) : input;
            return this.validate(parsed, schema);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError('Formato de entrada inválido', 'input');
        }
    }

    /**
     * Validação rápida (retorna booleano)
     */
    isValid(data, schema) {
        try {
            this.validate(data, schema);
            return true;
        } catch {
            return false;
        }
    }
}

// Singleton para uso global
export const validator = new DataValidator();
