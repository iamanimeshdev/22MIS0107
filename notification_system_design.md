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
- Relational mapping makes it easy to tie to `users` table.
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
2. **Expensive unread count:** `COUNT()` queries become heavy on large tables.

## Solutions
1. **Partitioning:** Partition the table by `created_at` (e.g., monthly).
2. **Data Retention:** Delete or archive read notifications older than 30 days.
3. **Caching:** Store `unread_count` in Redis. Increment on new notification, decrement when read. Avoids hitting the DB for badge counts.

## Queries

**1. Fetch Notifications**
```sql
SELECT id, type, title, body, action_url, is_read, created_at
FROM notifications
WHERE user_id = 'user_uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**2. Get Unread Count**
```sql
SELECT COUNT(*) 
FROM notifications 
WHERE user_id = 'user_uuid' AND is_read = false;
```

**3. Mark as Read**
```sql
UPDATE notifications 
SET is_read = true 
WHERE id = 'notification_uuid' AND user_id = 'user_uuid';
```

**4. Mark All as Read**
```sql
UPDATE notifications 
SET is_read = true 
WHERE user_id = 'user_uuid' AND is_read = false;
```
