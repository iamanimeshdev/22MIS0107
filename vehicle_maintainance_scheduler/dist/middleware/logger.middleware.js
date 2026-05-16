"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = loggerMiddleware;
// @ts-ignore
const index_js_1 = require("../../../Logging_Middleware/index.js");
async function loggerMiddleware(req, res, next) {
    const message = `[${req.method}] ${req.originalUrl}`;
    try {
        await (0, index_js_1.Log)('backend', 'info', 'middleware', message);
    }
    catch (e) {
        // Fallback or ignore if it fails
    }
    next();
}
