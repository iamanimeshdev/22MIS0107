"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load from parent directory since .env is there
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const express_1 = __importDefault(require("express"));
const scheduler_route_1 = __importDefault(require("./routes/scheduler.route"));
const logger_middleware_1 = require("./middleware/logger.middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Custom Logging Middleware (no console.log or built-in loggers)
app.use(logger_middleware_1.loggerMiddleware);
app.use('/api', scheduler_route_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // using stdout directly since console.log is disallowed
    process.stdout.write(`Server running on port ${PORT}\n`);
});
