"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCluster = setupCluster;
const os_1 = __importDefault(require("os"));
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../../shared/logger");
const cluster_1 = __importDefault(require("cluster"));
const cpu_core_process_handler_1 = require("./cpu.core.process.handler");
const server_1 = require("../../server");
const CONFIG = {
    WORKER_RESTART_DELAY: 5000,
    MAX_RESTART_ATTEMPTS: 5,
    MAX_BACKOFF_DELAY: 60000,
    GRACEFUL_SHUTDOWN_TIMEOUT: 30000,
    WORKER_COUNT: os_1.default.cpus().length,
};
function setupCluster() {
    if (cluster_1.default.isPrimary) {
        setupMasterProcess();
    }
    else {
        setupWorkerProcess();
    }
}
function setupMasterProcess() {
    const workerRestarts = new Map();
    let shuttingDown = false;
    logger_1.logger.info(colors_1.default.bgBlue.white(`\n${'='.repeat(60)}`));
    logger_1.logger.info(colors_1.default.bgBlue.white(`  MASTER PROCESS ${process.pid} STARTING  `));
    logger_1.logger.info(colors_1.default.bgBlue.white(`  Workers: ${CONFIG.WORKER_COUNT} | CPUs: ${os_1.default.cpus().length}  `));
    logger_1.logger.info(colors_1.default.bgBlue.white(`${'='.repeat(60)}\n`));
    // Fork workers
    for (let i = 0; i < CONFIG.WORKER_COUNT; i++) {
        const worker = cluster_1.default.fork();
        logger_1.logger.info(colors_1.default.cyan(`🔧 Forking worker ${i + 1}/${CONFIG.WORKER_COUNT} (PID: ${worker.process.pid})`));
    }
    // Listen for worker ready messages
    cluster_1.default.on('message', (worker, message) => {
        if (message === 'ready') {
            logger_1.logger.info(colors_1.default.green(`✅ Worker ${worker.process.pid} is ready and accepting connections`));
        }
    });
    // Handle worker exits
    cluster_1.default.on('exit', (worker, code, signal) => {
        const pid = worker.process.pid || 0;
        const restarts = workerRestarts.get(pid) || 0;
        // Don't restart during shutdown
        if (shuttingDown) {
            logger_1.logger.info(colors_1.default.blue(`Worker ${pid} exited during shutdown (not restarting)`));
            // Check if all workers are dead
            const remainingWorkers = Object.keys(cluster_1.default.workers || {}).length;
            if (remainingWorkers === 0) {
                logger_1.logger.info(colors_1.default.green('All workers stopped. Master exiting.'));
                process.exit(0);
            }
            return;
        }
        // Log exit reason
        if (signal) {
            logger_1.logger.warn(colors_1.default.yellow(`⚠️  Worker ${pid} killed by signal: ${signal}`));
        }
        else if (code !== 0) {
            logger_1.errorLogger.error(colors_1.default.red(`❌ Worker ${pid} exited with error code: ${code}`));
        }
        else {
            logger_1.logger.info(colors_1.default.blue(`Worker ${pid} exited successfully`));
        }
        // Attempt restart with exponential backoff
        if (restarts < CONFIG.MAX_RESTART_ATTEMPTS) {
            const delay = Math.min(CONFIG.WORKER_RESTART_DELAY * Math.pow(2, restarts), CONFIG.MAX_BACKOFF_DELAY);
            logger_1.logger.info(colors_1.default.yellow(`🔄 Restarting worker in ${delay}ms (attempt ${restarts + 1}/${CONFIG.MAX_RESTART_ATTEMPTS})`));
            setTimeout(() => {
                const newWorker = cluster_1.default.fork();
                workerRestarts.set(newWorker.process.pid || 0, restarts + 1);
                logger_1.logger.info(colors_1.default.cyan(`🔧 New worker ${newWorker.process.pid} forked to replace ${pid}`));
            }, delay);
        }
        else {
            logger_1.errorLogger.error(colors_1.default.bgRed.white(`❌ Worker ${pid} FAILED after ${CONFIG.MAX_RESTART_ATTEMPTS} restart attempts`));
            // If too many workers have failed, exit master
            const aliveWorkers = Object.keys(cluster_1.default.workers || {}).length;
            if (aliveWorkers === 0) {
                logger_1.errorLogger.error(colors_1.default.bgRed.white('❌ NO WORKERS ALIVE - SHUTTING DOWN MASTER'));
                process.exit(1);
            }
        }
    });
    // Graceful shutdown on signals
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, () => {
            if (shuttingDown)
                return;
            shuttingDown = true;
            logger_1.logger.info(colors_1.default.bgYellow.black(`\n${'='.repeat(60)}`));
            logger_1.logger.info(colors_1.default.bgYellow.black(`  MASTER ${process.pid} RECEIVED ${signal} - SHUTTING DOWN  `));
            logger_1.logger.info(colors_1.default.bgYellow.black(`${'='.repeat(60)}\n`));
            // Send SIGTERM to all workers
            for (const id in cluster_1.default.workers) {
                const worker = cluster_1.default.workers[id];
                if (worker) {
                    logger_1.logger.info(colors_1.default.yellow(`📤 Sending SIGTERM to worker ${worker.process.pid}`));
                    worker.process.kill('SIGTERM');
                }
            }
            // Force shutdown if workers don't exit gracefully
            setTimeout(() => {
                logger_1.errorLogger.error(colors_1.default.bgRed.white('⚠️  FORCE SHUTDOWN - Workers did not exit in time'));
                process.exit(1);
            }, CONFIG.GRACEFUL_SHUTDOWN_TIMEOUT);
        });
    });
    // Handle uncaught errors in master
    process.on('uncaughtException', (error) => {
        logger_1.errorLogger.error(colors_1.default.bgRed.white('❌ MASTER UNCAUGHT EXCEPTION:'), error);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
        logger_1.errorLogger.error(colors_1.default.bgRed.white('❌ MASTER UNHANDLED REJECTION:'), reason);
        process.exit(1);
    });
}
function setupWorkerProcess() {
    logger_1.logger.info(colors_1.default.blue(`Worker ${process.pid} initializing...`));
    // Setup process handlers for this worker FIRST
    (0, cpu_core_process_handler_1.setupProcessHandlers)();
    // Start the server
    (0, server_1.main)()
        .then(() => {
        logger_1.logger.info(colors_1.default.green(`✅ Worker ${process.pid} started successfully`));
    })
        .catch((error) => {
        logger_1.errorLogger.error(colors_1.default.red(`❌ Worker ${process.pid} failed to start:`), error);
        process.exit(1);
    });
}
