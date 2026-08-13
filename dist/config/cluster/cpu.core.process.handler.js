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
exports.setupProcessHandlers = setupProcessHandlers;
const logger_1 = require("../../shared/logger");
const cpu_shutdown_1 = require("./cpu.shutdown");
const colors_1 = __importDefault(require("colors"));
const cluster_1 = __importDefault(require("cluster"));
function setupProcessHandlers() {
    return __awaiter(this, void 0, void 0, function* () {
        // CRITICAL: Only setup in worker processes
        if (cluster_1.default.isPrimary) {
            logger_1.logger.warn('⚠️ Process handlers should not be set up in master process');
            return;
        }
        const processId = process.pid;
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.error(colors_1.default.bgRed.white(`❌ Worker ${processId} UNCAUGHT EXCEPTION:`), error);
            yield (0, cpu_shutdown_1.gracefulShutdown)('uncaughtException');
        }));
        // Handle unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error(colors_1.default.bgRed.white(`❌ Worker ${processId} UNHANDLED REJECTION:`));
            logger_1.logger.error('Rejection at:', promise, 'reason:', reason);
            (0, cpu_shutdown_1.gracefulShutdown)('unhandledRejection');
        });
        // Signal handlers for graceful shutdown
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(colors_1.default.bgYellow.black(`⚠️ Worker ${processId} SIGINT signal received. Graceful shutdown initiated.`));
            yield (0, cpu_shutdown_1.gracefulShutdown)('SIGINT');
        }));
        process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(colors_1.default.bgYellow.black(`⚠️ Worker ${processId} SIGTERM signal received. Graceful shutdown initiated.`));
            yield (0, cpu_shutdown_1.gracefulShutdown)('SIGTERM');
        }));
        process.on('SIGUSR2', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(colors_1.default.bgYellow.black(`⚠️ Worker ${processId} SIGUSR2 signal received. Graceful shutdown initiated.`));
            yield (0, cpu_shutdown_1.gracefulShutdown)('SIGUSR2');
        }));
        // Handle warnings
        process.on('warning', (warning) => {
            logger_1.logger.warn(colors_1.default.yellow(`⚠️ Worker ${processId} Warning:`), warning.name, warning.message);
        });
        logger_1.logger.info(colors_1.default.green(`✅ Worker ${processId} Process handlers registered successfully`));
    });
}
