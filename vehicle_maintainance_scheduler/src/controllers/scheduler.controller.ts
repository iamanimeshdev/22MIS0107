import { Request, Response } from 'express';
import { fetchDepots, fetchVehicles } from '../services/api.service';
import { optimizeDepotSchedule } from '../services/scheduler.service';
import { Depot, VehicleTask } from '../models/types';
// @ts-ignore
import { Log } from '../../../Logging_Middleware/index.js';

export async function getSchedule(req: Request, res: Response) {
    try {
        const depotsData = await fetchDepots();
        const vehiclesData = await fetchVehicles();


        const depots: Depot[] = depotsData.data || depotsData; 
        const tasks: VehicleTask[] = vehiclesData.data || vehiclesData;

        if (!Array.isArray(depots) || !Array.isArray(tasks)) {
            throw new Error('Invalid data format received from external APIs');
        }

        const schedule = optimizeDepotSchedule(depots, tasks);


        res.json(schedule);
    } catch (error: any) {
        await Log('backend', 'error', 'controller', `Error scheduling: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}
