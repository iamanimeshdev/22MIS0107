export interface Depot {
    ID: number;
    MechanicHours: number;
}

export interface VehicleTask {
    TaskID: string;
    Duration: number;
    Impact: number;
}

export interface ScheduledDepot {
    depotId: number;
    mechanicHours: number;
    totalImpact: number;
    selectedTasks: VehicleTask[];
}
