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
