"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./routes"));
const morgen_1 = require("./shared/morgen");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ApiError_1 = __importDefault(require("./errors/ApiError"));
const express_session_1 = __importDefault(require("express-session"));
const request_ip_1 = __importDefault(require("request-ip"));
const handleChunkUpload_1 = require("./helpers/handleChunkUpload");
const fileStreamingHelper_1 = require("./helpers/fileStreamingHelper");
const mcp_routes_1 = require("./mcp-server/mcp.routes");
const app = (0, express_1.default)();
// app.get("/stripe/webhook",express.raw({type:"application/json"}),handleStripeWebhook); /// stripe webhook
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        if (!req.clientIp) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Unable to determine client IP!');
        }
        return req.clientIp;
    },
    handler: (req, res, next, options) => {
        throw new ApiError_1.default(options === null || options === void 0 ? void 0 : options.statusCode, `Rate limit exceeded. Try again in ${options.windowMs / 60000} minutes.`);
    }
});
app.use((0, express_session_1.default)({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Secure should be true in production with HTTPS
}));
app.use(request_ip_1.default.mw());
app.use(limiter);
//morgan
app.use(morgen_1.Morgan.successHandler);
app.use(morgen_1.Morgan.errorHandler);
//body parser
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//file retrieve
app.use("/files/:folder/:file", fileStreamingHelper_1.fileStreamHandler);
app.use(express_1.default.static('uploads'));
//router
app.post('/api/v1/upload/chunk', handleChunkUpload_1.handleChunkUpload);
app.use('/api/v1', routes_1.default);
app.use('/api/mcp', mcp_routes_1.mcpRoutes);
//live response
app.get('/', (req, res) => {
    const date = new Date(Date.now());
    res.send(`<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `);
});
//global error handle
app.use(globalErrorHandler_1.default);
//handle not found route;
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;
