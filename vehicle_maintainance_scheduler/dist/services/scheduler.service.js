"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeDepotSchedule = optimizeDepotSchedule;
function optimizeDepotSchedule(depots, tasks) {
    const results = [];
    for (const depot of depots) {
        const capacity = depot.MechanicHours;
        const n = tasks.length;
        // dp[i][w] stores max impact using first i tasks with w duration limit
        const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
        for (let i = 1; i <= n; i++) {
            const task = tasks[i - 1];
            for (let w = 0; w <= capacity; w++) {
                if (task.Duration <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - task.Duration] + task.Impact);
                }
                else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        // Backtracking to find selected tasks
        const selectedTasks = [];
        let res = dp[n][capacity];
        let w = capacity;
        for (let i = n; i > 0 && res > 0; i--) {
            if (res === dp[i - 1][w]) {
                continue;
            }
            else {
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
            selectedTasks: selectedTasks.reverse() // maintain original order relative
        });
    }
    return results;
}
