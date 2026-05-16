import { Depot, VehicleTask, ScheduledDepot } from '../models/types';

export function optimizeDepotSchedule(depots: Depot[], tasks: VehicleTask[]): ScheduledDepot[] {
    const results: ScheduledDepot[] = [];

    for (const depot of depots) {
        const capacity = depot.MechanicHours;
        const n = tasks.length;
        

        const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            const task = tasks[i - 1];
            for (let w = 0; w <= capacity; w++) {
                if (task.Duration <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        dp[i - 1][w - task.Duration] + task.Impact
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }


        const selectedTasks: VehicleTask[] = [];
        let res = dp[n][capacity];
        let w = capacity;

        for (let i = n; i > 0 && res > 0; i--) {
            if (res === dp[i - 1][w]) {
                continue;
            } else {
                const task = tasks[i - 1];
                selectedTasks.push(task);
                res -= task.Impact;
                w -= task.Duration;
            }
        }

        results.push({
            depotId: depot.ID,
            mechanicHours: capacity,
            totalImpact: dp[n][capacity],
            selectedTasks: selectedTasks.reverse()
        });
    }

    return results;
}
