# Gatewayz Chat & Chat History API Integration Guide

## Overview

This guide provides comprehensive instructions for integrating chat functionality and chat history into your frontend application using the Gatewayz API.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Frontend Integration Examples](#frontend-integration-examples)
5. [Environment Configuration](#environment-configuration)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Authentication

All API endpoints require API key authentication. Include the API key in the `Authorization` header:

```javascript
const headers = {
  'Authorization': `Bearer ${your_api_key}`,
  'Content-Type': 'application/json'
};
```

## API Endpoints

### Chat Completions API

**Base URL:** `https://api.gatewayz.ai`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/chat/completions` | Send chat messages and get AI responses |

### Chat History API

**Base URL:** `https://api.gatewayz.ai` (or `http://localhost:8000` for local development)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/chat/sessions` | Create a new chat session |
| `GET` | `/v1/chat/sessions` | List all chat sessions |
| `GET` | `/v1/chat/sessions/{id}` | Get specific session with messages |
| `PUT` | `/v1/chat/sessions/{id}` | Update session details |
| `DELETE` | `/v1/chat/sessions/{id}` | Delete a session |
| `GET` | `/v1/chat/stats` | Get session statistics |
| `POST` | `/v1/chat/search` | Search sessions |
| `POST` | `/v1/chat/sessions/{id}/messages` | Save message to session |

## Data Models

### Chat Message
```typescript
interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  tokens?: number;
  created_at: string; // ISO 8601 format
}
```

### Chat Session
```typescript
interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  model: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  is_active: boolean;
  messages?: ChatMessage[]; // Only included when fetching specific session
}
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number; // For list responses
}

interface ErrorResponse {
  detail: string;
  status_code: number;
}
```

### Chat Stats
```typescript
interface ChatStats {
  total_sessions: number;
  total_messages: number;
  active_sessions: number;
  total_tokens: number;
  average_messages_per_session: number;
}
```

## Frontend Integration Examples

### 1. Chat Completions

```javascript
/**
 * Send a chat message and get AI response
 * @param {string} message - User message
 * @param {string} model - AI model to use
 * @param {string} apiKey - User's API key
 * @returns {Promise<string>} AI response
 */
async function sendChatMessage(message, model, apiKey) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        message: message,
        apiKey: apiKey
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Usage
const response = await sendChatMessage('Hello, how are you?', 'openai/gpt-4', 'your-api-key');
console.log('AI Response:', response);
```

### 2. Create a New Chat Session

```javascript
/**
 * Creates a new chat session
 * @param {string} title - Session title (optional)
 * @param {string} model - AI model to use (optional)
 * @returns {Promise<ChatSession>} Created session object
 */
async function createChatSession(title, model = 'openai/gpt-3.5-turbo') {
  try {
    const response = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title || `Chat ${new Date().toLocaleString()}`,
        model: model
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create session');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

// Usage
const newSession = await createChatSession('My AI Chat', 'openai/gpt-4');
console.log('Created session:', newSession.id);
```

### 3. List All Chat Sessions

```javascript
/**
 * Retrieves all chat sessions for the authenticated user
 * @param {number} limit - Maximum number of sessions to return (default: 50)
 * @param {number} offset - Number of sessions to skip (default: 0)
 * @returns {Promise<ChatSession[]>} Array of session objects
 */
async function getChatSessions(limit = 50, offset = 0) {
  try {
    const response = await fetch(`/api/chat/sessions?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch sessions');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
}

// Usage
const sessions = await getChatSessions(20, 0);
console.log(`Found ${sessions.length} sessions`);
```

### 4. Get Specific Session with Messages

```javascript
/**
 * Retrieves a specific chat session with all its messages
 * @param {number} sessionId - ID of the session to retrieve
 * @returns {Promise<ChatSession>} Session object with messages array
 */
async function getChatSession(sessionId) {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Session not found');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch session');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching chat session:', error);
    throw error;
  }
}

// Usage
const session = await getChatSession(123);
console.log(`Session "${session.title}" has ${session.messages.length} messages`);
```

### 5. Save Message to Session

```javascript
/**
 * Saves a message to a chat session
 * @param {number} sessionId - ID of the session
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 * @param {string} model - Model used (optional)
 * @param {number} tokens - Token count (optional)
 * @returns {Promise<ChatMessage>} Saved message object
 */
async function saveMessage(sessionId, role, content, model = null, tokens = 0) {
  try {
    const params = new URLSearchParams({
      role: role,
      content: content,
      model: model || '',
      tokens: tokens.toString()
    });

    const response = await fetch(`/api/chat/sessions/${sessionId}/messages?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save message');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

// Usage
const message = await saveMessage(123, 'user', 'Hello, how are you?', 'openai/gpt-4', 10);
console.log('Message saved:', message.id);
```

### 6. Update Session

```javascript
/**
 * Updates a chat session's title or model
 * @param {number} sessionId - ID of the session to update
 * @param {string} title - New title (optional)
 * @param {string} model - New model (optional)
 * @returns {Promise<ChatSession>} Updated session object
 */
async function updateChatSession(sessionId, title, model) {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        model: model
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update session');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

// Usage
const updatedSession = await updateChatSession(123, 'Updated Chat Title', 'openai/gpt-4');
console.log('Session updated:', updatedSession.title);
```

### 7. Delete Session

```javascript
/**
 * Deletes a chat session and all its messages
 * @param {number} sessionId - ID of the session to delete
 * @returns {Promise<boolean>} True if successful
 */
async function deleteChatSession(sessionId) {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete session');
    }

    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// Usage
await deleteChatSession(123);
console.log('Session deleted successfully');
```

### 8. Search Sessions

```javascript
/**
 * Searches chat sessions by title or message content
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Promise<ChatSession[]>} Array of matching sessions
 */
async function searchChatSessions(query, limit = 20) {
  try {
    const response = await fetch('/api/chat/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        limit: limit
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to search sessions');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error searching chat sessions:', error);
    throw error;
  }
}

// Usage
const searchResults = await searchChatSessions('AI conversation', 10);
console.log(`Found ${searchResults.length} matching sessions`);
```

### 9. Get Session Statistics

```javascript
/**
 * Retrieves statistics about the user's chat sessions
 * @returns {Promise<Object>} Statistics object
 */
async function getChatStats() {
  try {
    const response = await fetch('/api/chat/stats', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch stats');
    }

    const result = await response.json();
    return result.stats;
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    throw error;
  }
}

// Usage
const stats = await getChatStats();
console.log('Total sessions:', stats.total_sessions);
console.log('Total messages:', stats.total_messages);
```

## Environment Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Backend API URL (without trailing slash)
NEXT_PUBLIC_API_BASE_URL=https://api.gatewayz.ai

# Chat History API URL (for local development)
NEXT_PUBLIC_CHAT_HISTORY_API_URL=http://localhost:8000
```

### API URL Configuration

- **Production**: `https://api.gatewayz.ai`
- **Local Development**: `http://localhost:8000`
- **Custom**: Set `NEXT_PUBLIC_CHAT_HISTORY_API_URL` environment variable

## Complete Integration Class

Here's a complete JavaScript class that encapsulates all chat and chat history functionality:

```javascript
class GatewayzChatAPI {
  constructor(apiKey, chatHistoryBaseUrl = '/api/chat') {
    this.apiKey = apiKey;
    this.chatHistoryBaseUrl = chatHistoryBaseUrl;
  }

  /**
   * Makes an authenticated API request
   * @private
   */
  async makeRequest<T>(
    method: string,
    endpoint: string,
    body: any = null
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.chatHistoryBaseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Chat Completions
  async sendMessage(message, model) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, message, apiKey: this.apiKey })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.response;
  }

  // Session Management
  async createSession(title, model) {
    const result = await this.makeRequest<ChatSession>('POST', '/sessions', { 
      title: title || `Chat ${new Date().toLocaleString()}`,
      model: model || 'openai/gpt-3.5-turbo'
    });
    return result.data!;
  }

  async getSessions(limit = 50, offset = 0) {
    const result = await this.makeRequest<ChatSession[]>('GET', `/sessions?limit=${limit}&offset=${offset}`);
    return result.data || [];
  }

  async getSession(sessionId) {
    const result = await this.makeRequest<ChatSession>('GET', `/sessions/${sessionId}`);
    return result.data!;
  }

  async updateSession(sessionId, title, model) {
    const result = await this.makeRequest<ChatSession>('PUT', `/sessions/${sessionId}`, { 
      title, 
      model 
    });
    return result.data!;
  }

  async deleteSession(sessionId) {
    await this.makeRequest('DELETE', `/sessions/${sessionId}`);
    return true;
  }

  // Message Management
  async saveMessage(sessionId, role, content, model, tokens) {
    const params = new URLSearchParams({
      role,
      content,
      model: model || '',
      tokens: (tokens || 0).toString()
    });
    
    const response = await fetch(`${this.chatHistoryBaseUrl}/sessions/${sessionId}/messages?${params}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save message');
    }

    const result = await response.json();
    return result.data;
  }

  // Search and Stats
  async searchSessions(query, limit = 20) {
    const result = await this.makeRequest<ChatSession[]>('POST', '/search', { 
      query, 
      limit 
    });
    return result.data || [];
  }

  async getStats() {
    const result = await this.makeRequest<ChatStats>('GET', '/stats');
    return result.data!;
  }
}

// Usage Example
const chatAPI = new GatewayzChatAPI('your-api-key');

// Send a message
const response = await chatAPI.sendMessage('Hello!', 'openai/gpt-4');

// Create and use a session
const session = await chatAPI.createSession('My Chat', 'openai/gpt-4');
await chatAPI.saveMessage(session.id, 'user', 'Hello!', 'openai/gpt-4', 5);
await chatAPI.saveMessage(session.id, 'assistant', 'Hi there!', 'openai/gpt-4', 8);

// Retrieve the session with messages
const fullSession = await chatAPI.getSession(session.id);
console.log('Messages:', fullSession.messages);
```

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue processing |
| 201 | Created | Session/message created successfully |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Check API key |
| 404 | Not Found | Session doesn't exist or API unavailable |
| 500 | Server Error | Retry request or contact support |

### Error Response Format

```javascript
{
  "detail": "Error message description",
  "status_code": 400
}
```

### Error Handling Best Practices

```javascript
async function handleApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.message.includes('401')) {
      // Handle authentication error
      console.error('Authentication failed. Please check your API key.');
      // Redirect to login or show auth error
    } else if (error.message.includes('404')) {
      // Handle not found error
      console.error('Session not found or API unavailable.');
      // Show user-friendly message or fallback to local storage
    } else if (error.message.includes('500')) {
      // Handle server error
      console.error('Server error. Please try again later.');
      // Show retry option
    } else {
      // Handle other errors
      console.error('An error occurred:', error.message);
    }
    throw error;
  }
}
```

## Best Practices

### 1. Session Management
- Always create a session before starting a conversation
- Use descriptive titles for easy identification
- Implement pagination for large session lists
- Cache session data when appropriate

### 2. Message Handling
- Save both user and assistant messages
- Include token counts for usage tracking
- Handle message ordering correctly
- Implement optimistic updates for better UX

### 3. Performance
- Use pagination for large datasets
- Implement proper loading states
- Cache frequently accessed data
- Debounce search queries

### 4. User Experience
- Show loading indicators during API calls
- Implement proper error messages
- Provide offline capabilities where possible
- Use optimistic updates for better responsiveness

### 5. Fallback Strategy
- Implement local storage fallback when API is unavailable
- Graceful degradation of features
- Clear error messaging to users

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Verify API key is correct
   - Check Authorization header format
   - Ensure API key has proper permissions

2. **404 Not Found**
   - Verify session ID exists
   - Check if session belongs to authenticated user
   - Ensure proper URL formatting
   - Check if chat history API is running

3. **500 Server Error**
   - Check server logs
   - Verify request format
   - Retry request after delay

4. **CORS Issues**
   - Ensure proper CORS headers
   - Check if API supports your domain
   - Use proper request headers

5. **API Unavailable**
   - Check if chat history API server is running
   - Verify environment variables
   - Implement fallback to local storage

### Debug Tips

```javascript
// Enable detailed logging
const DEBUG = true;

function logApiCall(method, url, data) {
  if (DEBUG) {
    console.log(`API Call: ${method} ${url}`, data);
  }
}

// Add request/response logging
async function makeRequest(method, url, data) {
  logApiCall(method, url, data);
  
  const response = await fetch(url, {
    method,
    headers: { /* ... */ },
    body: data ? JSON.stringify(data) : undefined
  });
  
  if (DEBUG) {
    console.log(`Response: ${response.status}`, await response.clone().json());
  }
  
  return response;
}
```

### Environment Setup Checklist

- [ ] API key is valid and has proper permissions
- [ ] Environment variables are set correctly
- [ ] Chat history API server is running (if using local development)
- [ ] CORS is configured properly
- [ ] Network connectivity is working

## Support

For additional support or questions about the Chat and Chat History API:

- Check the API documentation at `/docs` endpoint
- Review server logs for detailed error information
- Contact support with specific error messages and request details

---

*This guide covers the complete integration of both Chat and Chat History APIs. For additional features or advanced usage, refer to the full API documentation.*