"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduler_controller_1 = require("../controllers/scheduler.controller");
const router = (0, express_1.Router)();
router.get('/schedule', scheduler_controller_1.getSchedule);
exports.default = router;
