"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = gracefulShutdown;
const mongoose_1 = __importDefault(require("mongoose"));
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../../shared/logger");
const SHUTDOWN_TIMEOUT_MS = 30000;
function gracefulShutdown(signal) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prevent duplicate shutdown attempts
        if (global.isShuttingDown) {
            logger_1.logger.warn(colors_1.default.yellow('⚠️  Shutdown already in progress...'));
            return;
        }
        global.isShuttingDown = true;
        logger_1.logger.info(colors_1.default.gray.black(`\n${'='.repeat(60)}`));
        logger_1.logger.info(colors_1.default.gray.black(`  WORKER ${process.pid} - GRACEFUL SHUTDOWN (${signal})  `));
        logger_1.logger.info(colors_1.default.gray.black(`${'='.repeat(60)}\n`));
        // Set a force shutdown timer (safety net)
        const forceShutdownTimer = setTimeout(() => {
            logger_1.errorLogger.error(colors_1.default.bgRed.white(`\n⚠️  FORCE SHUTDOWN after ${SHUTDOWN_TIMEOUT_MS}ms\n`));
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS);
        // Make sure timer doesn't prevent exit
        forceShutdownTimer.unref();
        try {
            const shutdownSteps = [
                {
                    name: 'HTTP Server',
                    action: () => __awaiter(this, void 0, void 0, function* () {
                        const server = global.httpServer;
                        if (server && server.listening) {
                            yield new Promise((resolve, reject) => {
                                const timeout = setTimeout(() => {
                                    reject(new Error('HTTP server close timeout'));
                                }, 10000);
                                server.close((err) => {
                                    clearTimeout(timeout);
                                    if (err)
                                        reject(err);
                                    else
                                        resolve();
                                });
                            });
                        }
                    })
                },
                {
                    name: 'Socket.IO Server',
                    action: () => __awaiter(this, void 0, void 0, function* () {
                        const io = global.socketServer;
                        if (io) {
                            // Disconnect all clients first
                            io.disconnectSockets(true);
                            yield new Promise((resolve, reject) => {
                                const timeout = setTimeout(() => {
                                    reject(new Error('Socket.IO close timeout'));
                                }, 10000);
                                io.close((err) => {
                                    clearTimeout(timeout);
                                    if (err)
                                        reject(err);
                                    else
                                        resolve();
                                });
                            });
                        }
                    })
                },
                {
                    name: 'MongoDB Connection',
                    action: () => __awaiter(this, void 0, void 0, function* () {
                        if (mongoose_1.default.connection.readyState !== 0) {
                            yield mongoose_1.default.connection.close(false);
                        }
                    })
                }
            ];
            // Execute shutdown steps sequentially
            for (const step of shutdownSteps) {
                try {
                    logger_1.logger.info(colors_1.default.cyan(`⏳ Closing: ${step.name}...`));
                    yield step.action();
                    logger_1.logger.info(colors_1.default.green(`✅ ${step.name} closed`));
                }
                catch (error) {
                    logger_1.errorLogger.error(colors_1.default.red(`❌ Failed to close ${step.name}:`), error);
                    // Continue with other steps
                }
            }
            // Clear the force shutdown timer
            clearTimeout(forceShutdownTimer);
            logger_1.logger.info(colors_1.default.bgGreen.black(`\n${'='.repeat(60)}`));
            logger_1.logger.info(colors_1.default.bgGreen.black(`  ✓ WORKER ${process.pid} SHUTDOWN COMPLETE  `));
            logger_1.logger.info(colors_1.default.bgGreen.black(`${'='.repeat(60)}\n`));
            process.exit(0);
        }
        catch (error) {
            clearTimeout(forceShutdownTimer);
            logger_1.errorLogger.error(colors_1.default.bgRed.white('\n❌ CRITICAL ERROR DURING SHUTDOWN:\n'), error);
            process.exit(1);
        }
    });
}
