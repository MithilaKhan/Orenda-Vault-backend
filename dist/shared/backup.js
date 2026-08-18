"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.backupToAtlas = backupToAtlas;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = __importDefault(require("../config"));
/** Run shell command as Promise */
function shell(cmd) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}
/** Ensure mongodump and mongorestore are installed */
function ensureMongoToolsInstalled() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield shell("which mongodump");
            yield shell("which mongorestore");
            console.log("MongoDB tools already installed ✓");
        }
        catch (_a) {
            console.log("MongoDB tools not found. Installing for Ubuntu Noble...");
            const installCmd = `
      sudo apt-get update &&
      sudo apt-get install -y gnupg curl ca-certificates &&
      curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo tee /usr/share/keyrings/mongodb-server-6.0.gpg > /dev/null &&
      echo "deb [signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list &&
      sudo apt-get update &&
      sudo apt-get install -y mongodb-database-tools
    `;
            yield shell(installCmd);
            console.log("MongoDB tools installed successfully ✓");
        }
    });
}
/**
 * Backup local MongoDB to MongoDB Atlas
 * @param localUri Local MongoDB URI
 * @param atlasUri MongoDB Atlas URI
 */
function backupToAtlas() {
    return __awaiter(this, void 0, void 0, function* () {
        // Step 1: Ensure tools exist
        yield ensureMongoToolsInstalled();
        // Step 2: Create backup folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = path.join(__dirname, `mongo-backup-${timestamp}.gz`);
        console.log("Creating local MongoDB backup...");
        yield new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`mongodump --uri="${config_1.default.database_url}" --archive=${backupPath} --gzip`, (err) => {
                if (err) {
                    console.error("Local backup failed:", err);
                    return reject(err);
                }
                console.log("Local backup created at", backupPath);
                resolve();
            });
        });
        // Step 3: Restore to Atlas
        console.log("Restoring backup to MongoDB Atlas...");
        yield new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`mongorestore --uri="${config_1.default.backup_database_url}" --archive=${backupPath} --gzip --drop`, (err) => {
                if (err) {
                    console.error("Restore to Atlas failed:", err);
                    return reject(err);
                }
                console.log("Backup restored to Atlas successfully ✓");
                resolve();
            });
        });
        // Step 4: Delete local backup
        fs.unlinkSync(backupPath);
        console.log("Local backup deleted.");
    });
}
