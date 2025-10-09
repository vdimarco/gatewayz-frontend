# Backend Fixes Needed

## Issue: Activity Log Not Being Saved to Database

### Problem
The `activity` table in the database is empty because the backend is not logging user activity.

### Root Cause
The frontend only **reads** activity logs - it never creates them. Activity logging is expected to happen automatically on the backend when users make API requests.

### What Needs to be Fixed (Backend)

#### 1. Add Activity Logging to `/v1/chat/completions` Endpoint
When a user sends a chat message via `/v1/chat/completions`:
- Extract `privy_user_id` from query parameters
- Extract `api_key` from Authorization header
- Log to `activity` table with:
  - `user_id`: Looked up from `privy_user_id`
  - `action`: "chat_completion"
  - `details`: JSON with model, tokens used, session_id, etc.
  - `created_at`: Current timestamp

#### 2. Add Activity Logging to Chat Session Endpoints
- `/v1/chat/sessions` (POST): Log "session_created"
- `/v1/chat/sessions/{id}` (PUT): Log "session_updated"
- `/v1/chat/sessions/{id}` (DELETE): Log "session_deleted"
- `/v1/chat/sessions/{id}/messages` (POST): Log "message_sent"

#### 3. Add Activity Logging to Authentication Endpoint
When user logs in via `/auth` endpoint:
- Log "user_login" activity

### Database Schema Reference
```sql
CREATE TABLE activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Example Activity Log Entry
```json
{
  "user_id": 21,
  "action": "chat_completion",
  "details": {
    "model": "openai/gpt-4",
    "tokens_used": 150,
    "session_id": 42,
    "privy_user_id": "did:privy:cmgg27la00077ie0cyazmvlsa"
  },
  "created_at": "2025-01-09T12:34:56Z"
}
```

### Testing
After implementing the fix:
1. Send a chat message from the frontend
2. Check the `activity` table in the database
3. Verify the entry was created with correct `user_id`, `action`, and `details`
4. Check the Settings > Activity page in the frontend to see the logged activity

### Frontend Endpoints That Read Activity
- `GET /api/user/activity/log` - Fetches activity log entries
- `GET /api/user/activity/stats` - Fetches activity statistics

Both endpoints proxy to the backend:
- `${API_BASE_URL}/user/activity/log`
- `${API_BASE_URL}/user/activity/stats`
