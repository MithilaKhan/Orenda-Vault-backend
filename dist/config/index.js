"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    ip_address: process.env.IP_ADDRESS,
    database_url: process.env.DATABASE_URL,
    backup_database_url: process.env.BACKUP_DATABASE_URL,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_expire_in: process.env.JWT_EXPIRE_IN,
    },
    email: {
        from: process.env.EMAIL_FROM,
        user: process.env.EMAIL_USER,
        port: process.env.EMAIL_PORT,
        host: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASS,
    },
    super_admin: {
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
    },
    stripe: {
        secret_key: process.env.STRIPE_API_SECRET,
        webhook_secret: process.env.WEBHOOK_SECRET,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    kafka: {
        url: process.env.KAFKA_URL
    },
    elasticSearch: {
        url: process.env.ELASTICSEARCH_URL
    },
    openai_api_key: process.env.OPENAI_API_KEY,
    resend_api_key: process.env.RESEND_API_KEY,
};
