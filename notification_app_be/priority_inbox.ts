import fs from 'fs';
import path from 'path';

function loadEnv(): void {
    const envPath = path.join(process.cwd(), '../.env');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*[=:]\s*(.*)?\s*$/);
        if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            process.env[key] = val;
        }
    });
}
loadEnv();

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

interface NotificationItem {
    ID: string;
    Type: string;
    Message: string;
    Timestamp: string;
}

const getWeight = (type: string): number => {
    const t = type.toLowerCase();
    if (t === 'placement') return 3;
    if (t === 'result') return 2;
    if (t === 'event') return 1;
    return 0; 
};

class MinHeap {
    public heap: NotificationItem[] = [];

    public isSmaller(a: NotificationItem, b: NotificationItem): boolean {
        const weightA = getWeight(a.Type);
        const weightB = getWeight(b.Type);

        if (weightA !== weightB) {
            return weightA < weightB;
        }

        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        
        return timeA < timeB;
    }

    public push(val: NotificationItem): void {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    public pop(): NotificationItem | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.siftDown(0);
        return root;
    }

    public peek(): NotificationItem | undefined {
        return this.heap[0];
    }

    public size(): number {
        return this.heap.length;
    }

    private siftUp(i: number): void {
        let parent = Math.floor((i - 1) / 2);
        while (i > 0 && this.isSmaller(this.heap[i], this.heap[parent])) {
            [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
            i = parent;
            parent = Math.floor((i - 1) / 2);
        }
    }

    private siftDown(i: number): void {
        const len = this.heap.length;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;

            if (left < len && this.isSmaller(this.heap[left], this.heap[smallest])) smallest = left;
            if (right < len && this.isSmaller(this.heap[right], this.heap[smallest])) smallest = right;

            if (smallest === i) break;

            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
}

const print = (msg: string): boolean => process.stdout.write(`${msg}\n`);

async function fetchNotifications(): Promise<NotificationItem[]> {
    const token = process.env.access_token || process.env['access-token'] || process.env.AUTH_TOKEN;
    if (!token) throw new Error("access_token missing in .env");

    const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    const data: any = await res.json();
    return data.notifications || data;
}

async function main(): Promise<void> {
    try {
        print("Fetching notifications from API...");
        const notifications = await fetchNotifications();
        
        const topN = 10;
        const minHeap = new MinHeap();

        for (const notif of notifications) {
            if (minHeap.size() < topN) {
                minHeap.push(notif);
            } else {
                if (minHeap.peek() && minHeap.isSmaller(minHeap.peek()!, notif)) {
                    minHeap.pop(); 
                    minHeap.push(notif); 
                }
            }
        }

        const topNotifications: NotificationItem[] = [];
        while (minHeap.size() > 0) {
            topNotifications.unshift(minHeap.pop()!);
        }

        print("\n=======================================================");
        print("           TOP 10 PRIORITY NOTIFICATIONS               ");
        print("=======================================================\n");
        
        topNotifications.forEach((n, idx) => {
            print(`${String(idx + 1).padStart(2, ' ')}. [${n.Type}] - ${n.Message}`);
            print(`    Time: ${n.Timestamp} | ID: ${n.ID}\n`);
        });

    } catch (err: any) {
        print(`Error: ${err.message}`);
    }
}

main();
