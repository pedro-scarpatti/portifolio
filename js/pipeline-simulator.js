/**
 * pipeline-simulator.js — UI Wiring for Pipeline Demo
 * Connects PipelineProcessor + QueueService + EventBus → DOM
 */
import { pipelineProcessor } from './modules/processors/PipelineProcessor.js';
import { queueService } from './modules/services/QueueService.js';
import { idempotencyService } from './modules/services/IdempotencyService.js';
import { appLogger } from './modules/utils/Logger.js';
import { eventBus, PipelineEvents } from './modules/utils/EventBus.js';
import { validator } from './modules/validators/DataValidator.js';

// ── DOM References (IDs match pipeline-simulator.html) ────────────
const $ = id => document.getElementById(id);

const els = {
    // Form
    form:      $('job-form'),
    name:      $('job-name'),
    data:      $('job-data'),
    priority:  $('job-priority'),
    genBtn:    $('btn-generate'),

    // Controls
    startBtn:  $('btn-start'),
    stopBtn:   $('btn-stop'),
    clearBtn:  $('btn-clear'),
    rateInput: $('failure-rate'),
    rateValue: $('failure-rate-value'),

    // Metrics (kebab-case to match HTML)
    mPending:    $('metric-pending'),
    mProcessing: $('metric-processing'),
    mCompleted:  $('metric-completed'),
    mError:     $('metric-error'),

    // Queue
    queueContainer: $('queue-container'),
    queueCount:     $('queue-count'),

    // Logs
    logContainer: $('log-container'),
    exportBtn:    $('btn-export-logs'),
};

// ── State ────────────────────────────────────────────────────────
let pipelineRunning = false;

// ── Init ─────────────────────────────────────────────────────────
function init() {
    bindEvents();
    updateMetrics();
    updateQueueDisplay();
    addLog('info', 'Pipeline pronto. Envie um job para começar.');

    eventBus.subscribe(PipelineEvents.JOB_CREATED,    onJobCreated);
    eventBus.subscribe(PipelineEvents.JOB_STARTED,    onJobStarted);
    eventBus.subscribe(PipelineEvents.JOB_COMPLETED, onJobCompleted);
    eventBus.subscribe(PipelineEvents.JOB_FAILED,     onJobFailed);
    eventBus.subscribe(PipelineEvents.JOB_RETRY,     onJobRetry);
    eventBus.subscribe(PipelineEvents.QUEUE_UPDATED, onQueueUpdated);
    eventBus.subscribe(PipelineEvents.METRICS_UPDATED, onMetricsUpdated);
    eventBus.subscribe(PipelineEvents.ERROR,          onError);

    appLogger.info('Pipeline UI inicializada');
}

// ── Event Bindings ───────────────────────────────────────────────
function bindEvents() {
    els.form.addEventListener('submit', onFormSubmit);
    els.genBtn.addEventListener('click', generateRandomJob);
    els.startBtn.addEventListener('click', startPipeline);
    els.stopBtn.addEventListener('click', stopPipeline);
    els.clearBtn.addEventListener('click', clearAll);
    els.rateInput.addEventListener('input', onRateChange);
    els.exportBtn.addEventListener('click', exportLogs);
}

// ── Form ─────────────────────────────────────────────────────────
async function onFormSubmit(e) {
    e.preventDefault();

    const name = els.name.value.trim();
    const rawData = els.data.value.trim();
    const priority = parseInt(els.priority.value);

    if (!name || !rawData) {
        addLog('error', 'Preencha nome e dados do job.');
        return;
    }

    let parsedData;
    try {
        parsedData = JSON.parse(rawData);
    } catch (err) {
        addLog('error', `JSON inválido: ${err.message}`);
        return;
    }

    const jobPayload = { name, data: parsedData, priority };

    try {
        validator.validatePipelineInput(JSON.stringify(jobPayload));
    } catch (err) {
        addLog('error', `Validação falhou: ${err.message}`);
        return;
    }

    const result = await pipelineProcessor.submitJob(jobPayload);

    if (result.added) {
        addLog('success', `Job "${name}" enfileirado [${result.jobId}]`);
        els.name.value = '';
        els.data.value = '';
        updateQueueDisplay();
    } else {
        addLog('warn', `Job rejeitado: ${result.reason}`);
    }
}

function generateRandomJob() {
    const types    = ['order', 'payment', 'invoice', 'shipment'];
    const customers = ['João Silva', 'Maria Costa', 'Carlos Souza', 'Ana Beatriz', 'Pedro Lima'];
    const type = types[Math.floor(Math.random() * types.length)];

    const samples = {
        order: {
            orderId:  `ORD-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
            customer: customers[Math.floor(Math.random() * customers.length)],
            amount:   parseFloat((Math.random() * 15000).toFixed(2)),
            items: [
                { sku: `PROD-${Math.floor(Math.random() * 900 + 100)}`, qty: Math.floor(Math.random() * 5 + 1) },
                { sku: `PROD-${Math.floor(Math.random() * 900 + 100)}`, qty: Math.floor(Math.random() * 3 + 1) },
            ]
        },
        payment: {
            paymentId: `PAY-${Date.now().toString().slice(-8)}`,
            method:   ['credit_card', 'pix', 'boleto'][Math.floor(Math.random() * 3)],
            amount:   parseFloat((Math.random() * 5000).toFixed(2)),
            status:   'pending'
        },
        invoice: {
            invoiceId: `INV-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
            issuedTo: customers[Math.floor(Math.random() * customers.length)],
            total:    parseFloat((Math.random() * 8000).toFixed(2)),
            dueDate:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        shipment: {
            trackingCode: `SHP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            carrier:      ['Correios', 'FedEx', 'DHL', 'Azul'][Math.floor(Math.random() * 4)],
            weight:       parseFloat((Math.random() * 30).toFixed(2)),
            destination:  `${Math.floor(Math.random() * 90000 + 10000)}-${['SP','RJ','MG','PR','RS'][Math.floor(Math.random() * 5)]}`
        }
    };

    els.name.value = `${type.charAt(0).toUpperCase() + type.slice(1)} #${Math.floor(Math.random() * 9999)}`;
    els.data.value = JSON.stringify(samples[type], null, 2);
    addLog('info', `Job gerado: ${type}`);
}

// ── Pipeline Controls ────────────────────────────────────────────
function startPipeline() {
    if (pipelineRunning) return;
    pipelineRunning = true;
    els.startBtn.disabled = true;
    els.stopBtn.disabled = false;
    els.startBtn.textContent = '⏸ Rodando...';

    pipelineProcessor.start();
    addLog('info', '▶ Pipeline iniciado');
}

function stopPipeline() {
    if (!pipelineRunning) return;
    pipelineRunning = false;
    pipelineProcessor.stop();
    els.startBtn.disabled = false;
    els.stopBtn.disabled = true;
    els.startBtn.textContent = '▶ Iniciar';
    addLog('warn', '⏹ Pipeline parado');
}

function clearAll() {
    stopPipeline();
    queueService.clear();
    idempotencyService.store = new Map();
    appLogger.clear();
    els.logContainer.innerHTML = '';
    updateMetrics();
    updateQueueDisplay();
    pipelineRunning = false;
    els.startBtn.disabled = false;
    els.stopBtn.disabled = true;
    els.startBtn.textContent = '▶ Iniciar';
    addLog('info', '🗑 Pipeline limpo');
}

function onRateChange() {
    const pct = els.rateInput.value;
    els.rateValue.textContent = `${pct}%`;
    pipelineProcessor.failureRate = parseInt(pct) / 100;
    addLog('info', `Taxa de falha: ${pct}%`);
}

// ── Pipeline Event Handlers ──────────────────────────────────────
function onJobCreated({ jobId }) {
    updateQueueDisplay();
    updateMetrics();
}

function onJobStarted({ jobId }) {
    updateMetrics();
    updateQueueDisplay();
    addLog('info', `⚙ Processando: ${jobId}`);
}

function onJobCompleted({ jobId, deduplicated }) {
    updateMetrics();
    updateQueueDisplay();
    if (deduplicated) {
        addLog('warn', `✓ ${jobId} — resultado duplicado (cacheado)`);
    } else {
        const job = queueService.findJob(jobId);
        const ms = job ? job.getDuration() : '?';
        addLog('success', `✓ ${jobId} concluído (${ms}ms)`);
    }
}

function onJobFailed({ jobId, error }) {
    updateMetrics();
    updateQueueDisplay();
    addLog('error', `✗ ${jobId} falhou: ${error}`);
}

function onJobRetry({ jobId, attempt }) {
    addLog('warn', `↩ Retry #${attempt}: ${jobId}`);
}

function onQueueUpdated() {
    updateMetrics();
}

function onMetricsUpdated(stats) {
    updateMetrics(stats);
}

function onError({ jobId, error }) {
    addLog('error', `[ERR] ${jobId ? jobId + ': ' : ''}${error}`);
}

// ── UI Updates ───────────────────────────────────────────────────
function updateMetrics(stats) {
    stats = stats || queueService.getStats();
    els.mPending.textContent    = stats.pending;
    els.mProcessing.textContent = stats.processing;
    els.mCompleted.textContent  = stats.completed;
    els.mError.textContent      = stats.failed;
}

function updateQueueDisplay() {
    const stats = queueService.getStats();
    els.queueCount.textContent = stats.pending > 0 ? `${stats.pending} pendente(s)` : '';

    const allJobs = [
        ...queueService.getJobs('pending'),
        ...queueService.getJobs('processing'),
    ];

    if (allJobs.length === 0) {
        els.queueContainer.innerHTML = `
            <div class="queue-empty" style="text-align:center;padding:40px 20px;color:var(--text-3);">
                <div style="font-size:2rem;margin-bottom:10px;opacity:0.4;">📭</div>
                <p style="font-size:0.875rem;">Nenhum job na fila.<br>Envie um job para começar.</p>
            </div>`;
        return;
    }

    const processing = queueService.getJobs('processing');
    const pending   = queueService.getJobs('pending');

    let html = '';

    if (processing.length > 0) {
        html += `<div style="margin-bottom:16px;">
            <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent);margin-bottom:8px;font-weight:700;">Processando</p>
            <div style="display:flex;flex-direction:column;gap:6px;">`;
        processing.forEach(job => {
            html += `<div class="queue-item queue-item--processing">
                <span class="queue-item__id">${job.id}</span>
                <span class="queue-item__status queue-item__status--processing">PROCESSANDO</span>
                <span class="queue-item__time">${job.getDuration()}ms</span>
            </div>`;
        });
        html += `</div></div>`;
    }

    if (pending.length > 0) {
        html += `<div>
            <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-3);margin-bottom:8px;font-weight:700;">Pendentes (${pending.length})</p>
            <div style="display:flex;flex-direction:column;gap:6px;">`;
        pending.slice(0, 20).forEach(job => {
            const prio = job.priority === 2 ? '🔴' : job.priority === 1 ? '🟡' : '⚪';
            html += `<div class="queue-item queue-item--pending">
                <span class="queue-item__id">${job.id}</span>
                <span class="queue-item__prio">${prio}</span>
                <span class="queue-item__status queue-item__status--pending">PENDENTE</span>
            </div>`;
        });
        if (pending.length > 20) {
            html += `<p style="font-size:0.72rem;color:var(--text-3);padding:4px 0;">... e mais ${pending.length - 20} jobs</p>`;
        }
        html += `</div></div>`;
    }

    els.queueContainer.innerHTML = html;
}

// ── Logging ──────────────────────────────────────────────────────
const LEVELS = {
    info:    { bg: 'rgba(6,182,212,0.12)',   color: '#06b6d4', label: 'INFO' },
    success: { bg: 'rgba(0,255,148,0.12)',   color: '#00ff94', label: 'OK'   },
    error:   { bg: 'rgba(255,45,107,0.12)',  color: '#ff2d6b', label: 'ERR'  },
    warn:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'WARN' },
    debug:   { bg: 'rgba(90,90,117,0.15)',   color: '#5a5a75', label: 'DBG'  },
};

function addLog(level, message) {
    const time = new Date().toTimeString().split(' ')[0];
    const s = LEVELS[level] || LEVELS.info;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.cssText = `
        display:flex; align-items:flex-start; gap:8px;
        padding:5px 8px; border-radius:5px; margin-bottom:3px;
        background:${s.bg}; animation:slideIn 0.18s ease-out;`;

    entry.innerHTML = `
        <span style="color:${s.color};font-family:var(--font-mono);font-size:0.68rem;min-width:65px;flex-shrink:0;">${time}</span>
        <span style="background:${s.color}20;color:${s.color};padding:1px 6px;border-radius:3px;font-size:0.62rem;font-weight:700;letter-spacing:0.05em;min-width:38px;text-align:center;flex-shrink:0;">${s.label}</span>
        <span style="color:var(--text-2);font-family:var(--font-mono);font-size:0.72rem;flex:1;word-break:break-all;line-height:1.5;">${esc(message)}</span>`;

    els.logContainer.appendChild(entry);
    els.logContainer.scrollTop = els.logContainer.scrollHeight;

    while (els.logContainer.children.length > 200) {
        els.logContainer.removeChild(els.logContainer.firstChild);
    }
}

function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function exportLogs() {
    const logs = appLogger.export('json');
    const blob = new Blob([logs], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pipeline-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addLog('info', 'Logs exportados');
}

// ── Boot ─────────────────────────────────────────────────────────
init();
