# Stage 1

## Core Actions
- Fetch notifications (paginated)
- Get unread count
- Mark notification as read
- Mark all as read
- Real-time pushes

## REST API Endpoints

**Headers (All Endpoints)**
Authorization: Bearer <token>
Content-Type: application/json

### 1. Fetch Notifications
`GET /api/v1/notifications?page=1&limit=20`

Response:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "alert",
      "title": "System Update",
      "body": "Update successful",
      "actionUrl": "/settings",
      "isRead": false,
      "createdAt": "2026-05-16T10:30:00Z"
    }
  ],
  "page": 1,
  "total": 42
}
```

### 2. Get Unread Count
`GET /api/v1/notifications/unread-count`

Response:
```json
{
  "unreadCount": 5
}
```

### 3. Mark as Read
`PATCH /api/v1/notifications/:id/read`

Response:
```json
{
  "success": true,
  "id": "uuid",
  "isRead": true
}
```

### 4. Mark All as Read
`POST /api/v1/notifications/read-all`

Response:
```json
{
  "success": true,
  "updatedCount": 5
}
```

## Real-Time Notifications

**Protocol:** WebSockets
**Endpoint:** `wss://api.domain.com/v1/notifications/live?token=<token>`

Flow:
1. Client connects using JWT token in query.
2. Server validates token.
3. Server pushes JSON on new notification events.

Server Payload:
```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "uuid",
    "type": "message",
    "title": "New message",
    "body": "Hey there",
    "actionUrl": "/chat",
    "isRead": false,
    "createdAt": "2026-05-16T11:00:00Z"
  }
}
```
4. Client receives payload, updates UI list, and increments unread badge.

# Stage 2

## Database Choice
**PostgreSQL**
- Notifications need structured queries (filter by user, pagination, read status).
- Relational mapping makes it easy to tie to users table.
- Excellent indexing capabilities (like partial indexes) for fast read operations.

## Schema
Table: `notifications`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key, Indexed)
- `type` (VARCHAR)
- `title` (VARCHAR)
- `body` (TEXT)
- `action_url` (VARCHAR, nullable)
- `is_read` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP, Default: NOW())

**Indexes:**
- Index on `(user_id, created_at DESC)` for fast fetching and pagination.
- Partial index on `user_id` WHERE `is_read = false` for blazing fast unread counts.

## Scaling Problems
1. **Huge table size:** Millions of notifications will eventually slow down read/write operations.
2. **Expensive unread count:** COUNT() queries become heavy on large tables.

## Solutions
1. **Partitioning:** Partition the table by created_at (e.g., monthly).
2. **Data Retention:** Delete or archive read notifications older than 30 days.
3. **Caching:** Store unread_count in Redis. Increment on new notification, decrement when read. Avoids hitting the DB for badge counts.

## Queries

**1. Fetch Notifications**
SELECT id, type, title, body, action_url, is_read, created_at
FROM notifications
WHERE user_id = 'user_uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;


**2. Get Unread Count**

SELECT COUNT(*) 
FROM notifications 
WHERE user_id = 'user_uuid' AND is_read = false;

**3. Mark as Read**
UPDATE notifications 
SET is_read = true 
WHERE id = 'notification_uuid' AND user_id = 'user_uuid';

**4. Mark All as Read**
UPDATE notifications 
SET is_read = true 
WHERE user_id = 'user_uuid' AND is_read = false;

## Stage 6: Priority Inbox

**Objective:** Maintain a "Priority Inbox" displaying the top $N$ (e.g., 10) most important unread notifications.
**Priority Logic:** 
1. Weight: Placement (3) > Result (2) > Event (1).
2. Recency: If weights are tied, the newer notification has higher priority.

**Approach:**
To maintain the top $N$ items efficiently in a streaming/continuous incoming notification environment, the optimal data structure is a **Min-Heap**.

1. **Why Min-Heap?**
   A Min-Heap of size $N$ keeps the *lowest priority* notification out of the top $N$ at its root. 
   When a new notification arrives:
   - If the heap has fewer than $N$ items, we simply insert the notification ($O(\log N)$).
   - If the heap has exactly $N$ items, we compare the new notification to the root. If the new notification has a *higher* priority than the root, we pop the root ($O(\log N)$) and insert the new notification ($O(\log N)$).
   - If it has a lower priority than the root, we ignore it ($O(1)$).

2. **Efficiency:**
   Processing $M$ incoming notifications into a top-$N$ list takes $O(M \log N)$ time. Since $N$ is small (e.g., 10), the operation is effectively $O(M)$, making it extremely fast and memory-efficient. We don't need to sort the entire array of notifications ($O(M \log M)$), which would be much slower for large feeds.

3. **Implementation:**
   The logic is implemented in `priority_inbox.ts` using a custom Min-Heap class. The script fetches the live data from the protected API, processes it through the heap, and outputs exactly the Top 10 notifications sorted descending by priority.
