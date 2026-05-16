"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchedule = getSchedule;
const api_service_1 = require("../services/api.service");
const scheduler_service_1 = require("../services/scheduler.service");
// @ts-ignore
const index_js_1 = require("../../../Logging_Middleware/index.js");
async function getSchedule(req, res) {
    try {
        const depotsData = await (0, api_service_1.fetchDepots)();
        const vehiclesData = await (0, api_service_1.fetchVehicles)();
        // Ensure we are working with arrays (sometimes APIs wrap in { data: [...] })
        const depots = depotsData.data || depotsData;
        const tasks = vehiclesData.data || vehiclesData;
        if (!Array.isArray(depots) || !Array.isArray(tasks)) {
            throw new Error('Invalid data format received from external APIs');
        }
        const schedule = (0, scheduler_service_1.optimizeDepotSchedule)(depots, tasks);
        // Required Format for array or wrapping?
        // Returning array of schedules directly or wrapped in success. Let's return the array or wrap it.
        // The requirements say "Expected Output Example" has an object `{ depotId: 1... }`, so we'll return an array of these objects or wrapped.
        res.json(schedule);
    }
    catch (error) {
        await (0, index_js_1.Log)('backend', 'error', 'controller', `Error scheduling: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}
