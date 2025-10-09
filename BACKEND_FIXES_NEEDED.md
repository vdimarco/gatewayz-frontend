# Backend Fixes Needed

## Issue 1: Models API Endpoint Missing

### Problem
The `/models?gateway=X` endpoint returns 404 Not Found. This breaks:
- Model dropdown in chat interface
- Individual model detail pages at `/models/[name]`
- Model browser functionality

### Root Cause
Backend does not implement the `/models` endpoint with gateway parameter support.

### What Needs to be Fixed (Backend)

#### Implement GET /models Endpoint
- Accept `gateway` query parameter: `openrouter`, `portkey`, or `featherless`
- Return models from the specified gateway
- Response format:
```json
{
  "data": [
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "description": "Most capable GPT-4 model",
      "context_length": 128000,
      "pricing": {
        "prompt": "0.03",
        "completion": "0.06"
      },
      "architecture": {
        "input_modalities": ["text", "image"]
      },
      "supported_parameters": ["temperature", "top_p", "tools"],
      "provider_slug": "openai"
    }
  ]
}
```

### Current Workaround
Created `/api/models` proxy endpoint that will call backend once it's implemented.

### Testing
After implementing the backend endpoint:
```bash
curl "https://api.gatewayz.ai/models?gateway=openrouter"
curl "https://api.gatewayz.ai/models?gateway=portkey"
curl "https://api.gatewayz.ai/models?gateway=featherless"
```

---

## Issue 2: Activity Log Not Being Saved to Database

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
