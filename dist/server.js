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
exports.main = main;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./shared/logger");
const colors_1 = __importDefault(require("colors"));
const socketHelper_1 = require("./helpers/socketHelper");
const socket_io_1 = require("socket.io");
const seedAdmin_1 = require("./DB/seedAdmin");
const node_cluster_1 = require("./config/cluster/node.cluster");
const cluster_1 = __importDefault(require("cluster"));
if (cluster_1.default.isPrimary) {
    process.on('uncaughtException', error => {
        logger_1.errorLogger.error('Master uncaughtException Detected', error);
        process.exit(1);
    });
    process.on('unhandledRejection', error => {
        logger_1.errorLogger.error('Master unhandledRejection Detected', error);
        process.exit(1);
    });
}
// Main function - only runs in worker processes
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Connect to database
            yield mongoose_1.default.connect(config_1.default.database_url);
            logger_1.logger.info(colors_1.default.green('🚀 Database connected successfully'));
            // Seed super admin
            yield (0, seedAdmin_1.seedSuperAdmin)();
            // loadConsumer() // if you use kafka
            // Start HTTP server
            const port = typeof config_1.default.port === 'number' ? config_1.default.port : Number(config_1.default.port);
            const server = app_1.default.listen(port, config_1.default.ip_address, () => {
                logger_1.logger.info(colors_1.default.bold.italic.bgGreen(`♻️ Worker ${process.pid} listening on ${config_1.default.ip_address}:${config_1.default.port}`));
            });
            // Setup Socket.IO
            const io = new socket_io_1.Server(server, {
                pingTimeout: 60000,
                cors: {
                    origin: '*'
                }
            });
            socketHelper_1.socketHelper.socket(io);
            // Store in global for graceful shutdown
            global.httpServer = server;
            global.socketServer = io;
            // Notify master that worker is ready
            if (cluster_1.default.worker) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
            }
            return server;
        }
        catch (error) {
            logger_1.errorLogger.error(colors_1.default.red('🤢 Failed to start worker:'), error);
            throw error;
        }
    });
}
// Bootstrap function - runs on startup
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // setupSecurity();
            if (config_1.default.node_env === 'production') {
                (0, node_cluster_1.setupCluster)();
            }
            else {
                logger_1.logger.info("dev mode");
                yield main();
            }
        }
        catch (error) {
            logger_1.errorLogger.error(colors_1.default.red('🤢 Failed to bootstrap application:'), error);
            process.exit(1);
        }
    });
}
// Start the application
bootstrap();
