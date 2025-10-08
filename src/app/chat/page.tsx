
"use client"

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Search,
  Pencil,
  MessageSquare,
  Settings,
  Paperclip,
  Globe,
  Send,
  Menu,
  Bot,
  Code,
  Heart,
  BrainCircuit,
  Box,
  User,
  MoreHorizontal,
  Trash2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { ModelSelect, type ModelOption } from '@/components/chat/model-select';
import './chat.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { getApiKey, getUserData } from '@/lib/api';
import { ChatHistoryAPI, ChatSession as ApiChatSession, ChatMessage as ApiChatMessage, handleApiError } from '@/lib/chat-history';
import { Copy, Share2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { usePrivy } from '@privy-io/react-auth';
import { streamChatResponse } from '@/lib/streaming';
import { ReasoningDisplay } from '@/components/chat/reasoning-display';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    image?: string; // Base64 image data
    isStreaming?: boolean; // Track if message is currently streaming
};

type ChatSession = {
    id: string;
    title: string;
    startTime: Date;
    messages: Message[];
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
    apiSessionId?: number; // Link to API session ID
};

// Mock data for chat sessions
const mockChatSessions: ChatSession[] = [

    {
        id: "chat-2",
        title: "Authentication in React",
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        userId: "user-1",
        messages: [
            {
                role: "user",
                content: "How do I implement authentication in React?"
            },
            {
                role: "assistant",
                content: "For React authentication, you can use several approaches:\n\n1. **JWT with localStorage** - Simple but less secure\n2. **OAuth providers** (Google, GitHub) - More secure\n3. **Auth0 or Firebase Auth** - Managed solutions\n4. **Custom backend with sessions** - Most control\n\nWould you like me to show you an example implementation?"
            },
            {
                role: "user",
                content: "Show me JWT implementation"
            },
            {
                role: "assistant",
                content: "Here's a basic JWT implementation:\n\n```javascript\n// Login function\nconst login = async (email, password) => {\n  const response = await fetch('/api/auth/login', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ email, password })\n  });\n  \n  const { token } = await response.json();\n  localStorage.setItem('token', token);\n};\n\n// Protected route component\nconst ProtectedRoute = ({ children }) => {\n  const token = localStorage.getItem('token');\n  return token ? children : <Navigate to='/login' />;\n};\n```"
            }
        ]
    },
    {
        id: "chat-3",
        title: "API Design Best Practices",
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        userId: "user-1",
        messages: [
            {
                role: "user",
                content: "What are the best practices for REST API design?"
            },
            {
                role: "assistant",
                content: "Here are key REST API design best practices:\n\n**1. Use HTTP methods correctly:**\n- GET: Retrieve data\n- POST: Create new resources\n- PUT: Update entire resource\n- PATCH: Partial updates\n- DELETE: Remove resources\n\n**2. Consistent URL structure:**\n- Use nouns, not verbs: `/users` not `/getUsers`\n- Use plural nouns: `/users` not `/user`\n- Hierarchical: `/users/123/posts`\n\n**3. Status codes:**\n- 200: Success\n- 201: Created\n- 400: Bad Request\n- 401: Unauthorized\n- 404: Not Found\n- 500: Server Error\n\n**4. Response format:**\n```json\n{\n  \"data\": [...],\n  \"meta\": {\n    \"total\": 100,\n    \"page\": 1,\n    \"limit\": 10\n  }\n}\n```"
            }
        ]
    },
    {
        id: "chat-4",
        title: "Database Optimization",
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        userId: "user-1",
        messages: [
            {
                role: "user",
                content: "How can I optimize my database queries?"
            },
            {
                role: "assistant",
                content: "Database optimization strategies:\n\n**1. Indexing:**\n- Add indexes on frequently queried columns\n- Use composite indexes for multi-column queries\n- Avoid over-indexing (slows writes)\n\n**2. Query optimization:**\n- Use EXPLAIN to analyze query plans\n- Avoid SELECT * (fetch only needed columns)\n- Use LIMIT for pagination\n- Optimize JOIN operations\n\n**3. Connection pooling:**\n- Reuse database connections\n- Set appropriate pool sizes\n- Monitor connection usage\n\n**4. Caching:**\n- Redis for frequently accessed data\n- Application-level caching\n- CDN for static content\n\n**5. Database design:**\n- Normalize appropriately (not over-normalize)\n- Use appropriate data types\n- Consider partitioning for large tables"
            }
        ]
    }
];

// API helper functions for chat history integration
const apiHelpers = {
    // Load chat sessions from API
    loadChatSessions: async (userId: string): Promise<ChatSession[]> => {
        try {
            const apiKey = getApiKey();
            console.log('Chat sessions - API Key found:', !!apiKey);
            console.log('Chat sessions - API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
            
            if (!apiKey) {
                console.warn('No API key found, returning empty sessions');
                return [];
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            console.log('Chat sessions - Making API request to getSessions');
            const apiSessions = await chatAPI.getSessions(50, 0);
            
            // Load messages for each session
            const sessionsWithMessages = await Promise.all(
                apiSessions.map(async (apiSession) => {
                    try {
                        // Load the full session with messages
                        const fullSession = await chatAPI.getSession(apiSession.id);
                        return {
                            id: `api-${apiSession.id}`,
                            title: apiSession.title,
                            startTime: new Date(apiSession.created_at),
                            createdAt: new Date(apiSession.created_at),
                            updatedAt: new Date(apiSession.updated_at),
                            userId: userId,
                            apiSessionId: apiSession.id,
                            messages: fullSession.messages?.map(msg => ({
                                role: msg.role,
                                content: msg.content,
                                reasoning: undefined,
                                image: undefined
                            })) || []
                        };
                    } catch (error) {
                        console.error(`Failed to load messages for session ${apiSession.id}:`, error);
                        // Return session without messages if loading fails
                        return {
                            id: `api-${apiSession.id}`,
                            title: apiSession.title,
                            startTime: new Date(apiSession.created_at),
                            createdAt: new Date(apiSession.created_at),
                            updatedAt: new Date(apiSession.updated_at),
                            userId: userId,
                            apiSessionId: apiSession.id,
                            messages: []
                        };
                    }
                })
            );
            
            return sessionsWithMessages;
        } catch (error) {
            console.error('Failed to load chat sessions from API:', error);
            // Return empty array instead of throwing error
            return [];
        }
    },

    // Save chat session to API
    saveChatSession: async (session: ChatSession): Promise<ChatSession> => {
        try {
            const apiKey = getApiKey();
            if (!apiKey || !session.apiSessionId) {
                return session;
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            await chatAPI.updateSession(session.apiSessionId, session.title);
            return session;
        } catch (error) {
            console.error('Failed to save chat session to API:', error);
            return session;
        }
    },

    // Create new chat session in API
    createChatSession: async (title: string, model?: string): Promise<ChatSession> => {
        try {
            const apiKey = getApiKey();
            console.log('Create session - API Key found:', !!apiKey);
            console.log('Create session - API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
            
            if (!apiKey) {
                console.warn('No API key found, creating local session');
                // Fallback to local session
                const now = new Date();
                return {
                    id: `local-${Date.now()}`,
                    title,
                    startTime: now,
                    createdAt: now,
                    updatedAt: now,
                    userId: 'user-1',
                    messages: []
                };
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            console.log('Create session - Making API request to createSession');
            const apiSession = await chatAPI.createSession(title, model);
            
            return {
                id: `api-${apiSession.id}`,
                title: apiSession.title,
                startTime: new Date(apiSession.created_at),
                createdAt: new Date(apiSession.created_at),
                updatedAt: new Date(apiSession.updated_at),
                userId: 'user-1',
                apiSessionId: apiSession.id,
                messages: []
            };
        } catch (error) {
            console.error('Failed to create chat session in API:', error);
            // Fallback to local session
            const now = new Date();
            return {
                id: `local-${Date.now()}`,
                title,
                startTime: now,
                createdAt: now,
                updatedAt: now,
                userId: 'user-1',
                messages: []
            };
        }
    },

    // Update chat session in API
    updateChatSession: async (sessionId: string, updates: Partial<ChatSession>, currentSessions: ChatSession[]): Promise<ChatSession> => {
        try {
            const apiKey = getApiKey();
            const session = currentSessions.find(s => s.id === sessionId);
            if (!apiKey || !session?.apiSessionId) {
                return { ...session!, ...updates };
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            await chatAPI.updateSession(session.apiSessionId, updates.title);
            return { ...session, ...updates };
        } catch (error) {
            console.error('Failed to update chat session in API:', error);
            const session = currentSessions.find(s => s.id === sessionId);
            return { ...session!, ...updates };
        }
    },

    // Delete chat session from API
    deleteChatSession: async (sessionId: string, currentSessions: ChatSession[]): Promise<void> => {
        try {
            const apiKey = getApiKey();
            const session = currentSessions.find(s => s.id === sessionId);
            if (!apiKey || !session?.apiSessionId) {
                return;
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            await chatAPI.deleteSession(session.apiSessionId);
        } catch (error) {
            console.error('Failed to delete chat session from API:', error);
        }
    },

    // Save message to API session
    saveMessage: async (sessionId: string, role: 'user' | 'assistant', content: string, model?: string, tokens?: number, currentSessions?: ChatSession[]): Promise<{ apiSessionId?: number } | null> => {
        try {
            const apiKey = getApiKey();
            const session = currentSessions?.find(s => s.id === sessionId);
            
            console.log(`SaveMessage - Session ID: ${sessionId}`);
            console.log(`SaveMessage - Session found:`, session);
            console.log(`SaveMessage - API Key:`, apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
            console.log(`SaveMessage - Role: ${role}, Content: ${content.substring(0, 50)}...`);
            
            if (!apiKey || !session) {
                console.warn('SaveMessage - Missing API key or session');
                return null;
            }

            const chatAPI = new ChatHistoryAPI(apiKey);
            
            // If no API session exists, try to create one
            if (!session.apiSessionId) {
                console.log('SaveMessage - No API session ID, creating new session');
                try {
                    const apiSession = await chatAPI.createSession(session.title, model || 'openai/gpt-3.5-turbo');
                    console.log('SaveMessage - Created new API session:', apiSession.id);
                    // Save the message to the new API session
                    await chatAPI.saveMessage(apiSession.id, role, content, model, tokens);
                    console.log('SaveMessage - Message saved to new API session');
                    return { apiSessionId: apiSession.id };
                } catch (createError) {
                    console.error('Failed to create API session for message saving:', createError);
                    return null;
                }
            } else {
                console.log(`SaveMessage - Using existing API session: ${session.apiSessionId}`);
                // Save message to existing API session
                await chatAPI.saveMessage(session.apiSessionId, role, content, model, tokens);
                console.log('SaveMessage - Message saved to existing API session');
                return { apiSessionId: session.apiSessionId };
            }
        } catch (error) {
            console.error('Failed to save message to API:', error);
            return null;
        }
    }
};

const ModelSuggestionCard = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
    <Card className="hover:border-primary cursor-pointer">
        <CardContent className="p-4">
            <h3 className="text-sm font-semibold">{title}</h3>
            <div className="flex justify-end mt-4">
                <div className="flex -space-x-2">
                     <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const ExamplePrompt = ({ title, subtitle, onClick }: { title: string, subtitle: string, onClick?: () => void }) => (
    <Card
        className="hover:border-primary cursor-pointer p-4 text-left bg-card transition-colors rounded-xl border-border"
        onClick={onClick}
    >
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </Card>
)

const ChatSidebar = ({ sessions, activeSessionId, setActiveSessionId, createNewChat, onDeleteSession, onRenameSession }: { 
    sessions: ChatSession[], 
    activeSessionId: string | null, 
    setActiveSessionId: (id: string) => void, 
    createNewChat: () => void,
    onDeleteSession: (sessionId: string) => void,
    onRenameSession: (sessionId: string, newTitle: string) => void
}) => {
    
    const groupChatsByDate = (chatSessions: ChatSession[]) => {
        // Filter out untitled chats that haven't been started yet
        const startedChats = chatSessions.filter(session => 
            session.messages.length > 0 || session.title !== 'Untitled Chat'
        );
        
        return startedChats.reduce((groups, session) => {
            const date = session.startTime;
            let groupName = format(date, 'MMMM d, yyyy');
            if (isToday(date)) groupName = 'Today';
            else if (isYesterday(date)) groupName = 'Yesterday';

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(session);
            return groups;

        }, {} as Record<string, ChatSession[]>);
    };

    const groupedSessions = groupChatsByDate(sessions);

    return (
    <aside className="flex flex-col gap-6 p-6 h-full">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold">Chat</h2>
        </div>
        
        <Button 
            onClick={createNewChat}
            className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 font-medium flex justify-between items-center gap-2 text-left"
        >
            <span>New Chat</span>
            <img src="/uil_plus.svg" alt="Plus" width={24} height={24} />
        </Button>
        
        <div className="relative">
            <Input placeholder="Search Chats" className="pl-3 rounded-lg" />
            <img src="/material-symbols_search.svg" alt="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ width: "24px", height: "24px" }} />

        </div>
        
        <ScrollArea className="flex-grow">
            {Object.keys(groupedSessions).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
                </div>
            ) : (
                Object.entries(groupedSessions).map(([groupName, chatSessions]) => (
                    <div key={groupName}>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase my-2 px-3">{groupName}</h3>
                        <ul>
                            {chatSessions.map(session => (
                                <li key={session.id} className="group relative">
                                    <Button
                                        variant={activeSessionId === session.id ? "secondary" : "ghost"}
                                        className="w-full justify-start items-start text-left flex flex-col h-auto py-2 rounded-lg pr-16"
                                        onClick={() => setActiveSessionId(session.id)}
                                    >
                                        <span className="font-medium truncate w-full">
                                            {session.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(session.startTime, { addSuffix: true })}
                                        </span>
                                    </Button>

                                    {/* Three dots menu - only visible on hover */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 hover:bg-muted/50"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newTitle = prompt('Rename chat:', session.title);
                                                        if (newTitle && newTitle.trim() && newTitle !== session.title) {
                                                            onRenameSession(session.id, newTitle.trim());
                                                        }
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this chat?')) {
                                                            onDeleteSession(session.id);
                                                        }
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </ScrollArea>
    </aside>
    )
}

const ChatMessage = ({ message, modelName }: { message: Message, modelName: string | undefined}) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
             {/* {!isUser && <Avatar className="w-8 h-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>} */}
            <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                {!isUser && message.reasoning && (
                    <ReasoningDisplay reasoning={message.reasoning} className="w-full" />
                )}
                <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'} ${message.isStreaming ? 'streaming-message' : ''}`}>
                     {!isUser && <p className="text-xs font-semibold mb-1">{modelName}</p>}
                    <div className={`text-sm prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'dark:prose-invert'}`}>
                        {isUser ? (
                            <div className="whitespace-pre-wrap text-white">{message.content}</div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code: ({ node, inline, className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline ? (
                                            <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        ) : (
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                    {!isUser && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Box className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
             {/* {isUser && <Avatar className="w-8 h-8"><AvatarFallback><User/></AvatarFallback></Avatar>} */}
        </div>
    )
}

const ChatSkeleton = () => (
  <div className="flex items-start gap-3">
    <Avatar className="w-8 h-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>
    <div className="flex flex-col gap-2 w-full max-w-md">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

function ChatPageContent() {
    const searchParams = useSearchParams();
    const { login } = usePrivy();
    const [message, setMessage] = useState('');
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [selectedModel, setSelectedModel] = useState<ModelOption | null>({
        value: 'switchpoint/router',
        label: 'Switchpoint Router',
        category: 'Free'
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { toast } = useToast();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track if we should auto-send the message from URL
    const [shouldAutoSend, setShouldAutoSend] = useState(false);

    // Handle model and message from URL parameters
    useEffect(() => {
        const modelParam = searchParams.get('model');
        const messageParam = searchParams.get('message');

        if (modelParam) {
            // Fetch the model details from API to get the label
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai'}/models?gateway=all`)
                .then(res => res.json())
                .then(data => {
                    const foundModel = data.data?.find((m: any) => m.id === modelParam);
                    if (foundModel) {
                        setSelectedModel({
                            value: foundModel.id,
                            label: foundModel.name,
                            category: foundModel.pricing?.prompt ? 'Paid' : 'Free'
                        });
                    }
                })
                .catch(err => console.log('Failed to fetch model:', err));
        }

        // Set the message from URL parameter and flag for auto-send
        if (messageParam) {
            setMessage(decodeURIComponent(messageParam));
            setShouldAutoSend(true);
        }
    }, [searchParams]);

     const activeSession = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || null;
    }, [sessions, activeSessionId]);

    const messages = activeSession?.messages || [];

    // Load messages for active session when it changes
    useEffect(() => {
        const loadSessionMessages = async (retryCount = 0) => {
            if (activeSessionId && activeSession?.apiSessionId) {
                try {
                    const apiKey = getApiKey();
                    if (!apiKey) return;

                    // Add a small delay to ensure the session is fully created on the backend
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const chatAPI = new ChatHistoryAPI(apiKey);
                    const fullSession = await chatAPI.getSession(activeSession.apiSessionId);
                    
                    // Update the session with loaded messages
                    setSessions(prev => prev.map(session => 
                        session.id === activeSessionId 
                            ? {
                                ...session,
                                messages: fullSession.messages?.map(msg => ({
                                    role: msg.role,
                                    content: msg.content,
                                    reasoning: undefined,
                                    image: undefined
                                })) || []
                            }
                            : session
                    ));
                } catch (error: unknown) {
                    // Only log 404 errors as warnings, not errors, since new sessions might not be immediately available
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    if (errorMessage.includes('404')) {
                        console.warn(`Session not yet available on backend (attempt ${retryCount + 1}), will retry later:`, errorMessage);
                        
                        // Retry up to 2 times with increasing delay
                        if (retryCount < 2) {
                            setTimeout(() => {
                                loadSessionMessages(retryCount + 1);
                            }, 1000 * (retryCount + 1)); // 1s, 2s delays
                        }
                    } else {
                        console.error('Failed to load session messages:', error);
                    }
                }
            }
        };

        loadSessionMessages();
    }, [activeSessionId, activeSession?.apiSessionId]);

    // Auto-send message from URL parameter when session is ready
    useEffect(() => {
        if (shouldAutoSend && activeSessionId && message.trim() && selectedModel && !loading) {
            setShouldAutoSend(false); // Reset flag to prevent re-sending
            handleSendMessage();
        }
    }, [shouldAutoSend, activeSessionId, message, selectedModel, loading]);

    useEffect(() => {
        // Load sessions from API
        const loadSessions = async () => {
            try {
                const sessionsData = await apiHelpers.loadChatSessions('user-1');
                
                setSessions(sessionsData);
                
                // Check if there's already a new/empty chat, if not create one
                const hasNewChat = sessionsData.some(session => 
                    session.messages.length === 0 && 
                    session.title === 'Untitled Chat'
                );
                
                if (!hasNewChat) {
                    createNewChat();
                } else {
                    // Set the first new chat as active
                    const firstNewChat = sessionsData.find(session => 
                        session.messages.length === 0 && 
                        session.title === 'Untitled Chat'
                    );
                    if (firstNewChat) {
                        setActiveSessionId(firstNewChat.id);
                    }
                }
            } catch (error) {
                console.log('Failed to load chat sessions:', error);
                // Fallback to creating a new chat
                createNewChat();
            }
        };
        
        loadSessions();
    }, []);

    // Note: In a real app, you would save sessions to backend API here
    // useEffect(() => {
    //     // Save sessions to backend API whenever they change
    //     if(sessions.length > 0) {
    //         saveSessionsToAPI(sessions);
    //     }
    // }, [sessions]);

     useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const createNewChat = async () => {
        // Check if there's already a new/empty chat session
        const existingNewChat = sessions.find(session => 
            session.messages.length === 0 && 
            session.title === 'Untitled Chat'
        );

        if (existingNewChat) {
            // If there's already a new chat, just switch to it
            setActiveSessionId(existingNewChat.id);
            return;
        }

        try {
            // Create new session using API helper
            const newSession = await apiHelpers.createChatSession('Untitled Chat', selectedModel?.value);
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
        } catch (error) {
            console.error('Failed to create new chat session:', error);
            toast({
                title: "Error",
                description: `Failed to create new chat session: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive'
            });
        }
    }

    const handleExamplePromptClick = (promptText: string) => {
        // Set the message input to the clicked prompt
        setMessage(promptText);
        // Focus on the input
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    }

    const handleDeleteSession = async (sessionId: string) => {
        try {
            // Delete from API
            await apiHelpers.deleteChatSession(sessionId, sessions);
            
            setSessions(prev => {
                const updatedSessions = prev.filter(session => session.id !== sessionId);
                // If the deleted session was active, switch to the first available session or create a new one
                if (activeSessionId === sessionId) {
                    if (updatedSessions.length > 0) {
                        setActiveSessionId(updatedSessions[0].id);
                    } else {
                        createNewChat();
                    }
                }
                return updatedSessions;
            });
        } catch (error) {
            console.error('Failed to delete chat session:', error);
            toast({
                title: "Error",
                description: "Failed to delete chat session. Please try again.",
                variant: 'destructive'
            });
        }
    }

    const handleRenameSession = async (sessionId: string, newTitle: string) => {
        try {
            // Update in API
            await apiHelpers.updateChatSession(sessionId, { title: newTitle }, sessions);
            
            setSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? { ...session, title: newTitle, updatedAt: new Date() }
                    : session
            ));
        } catch (error) {
            console.error('Failed to rename chat session:', error);
            toast({
                title: "Error",
                description: "Failed to rename chat session. Please try again.",
                variant: 'destructive'
            });
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file.",
                variant: 'destructive'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB.",
                variant: 'destructive'
            });
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setSelectedImage(base64);
        };
        reader.onerror = () => {
            toast({
                title: "Error reading file",
                description: "Failed to read the image file.",
                variant: 'destructive'
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRegenerate = async () => {
        if (!activeSessionId || messages.length === 0) return;
        
        // Get the last user message
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        if (!lastUserMessage) return;
        
        // Remove the last assistant message
        const updatedMessages = messages.slice(0, -1);
        const updatedSessions = sessions.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    messages: updatedMessages,
                    updatedAt: new Date()
                };
            }
            return session;
        });
        setSessions(updatedSessions);
        
        // Set the message to the last user message and send it again
        setMessage(lastUserMessage.content);
        setLoading(true);
        
        // Trigger the send message after a short delay
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedModel || !activeSessionId) {
            toast({
                title: "Cannot send message",
                description: !selectedModel ? "Please select a model first." : !activeSessionId ? "No active chat." : "Please enter a message.",
                variant: 'destructive'
            });
            return;
        }

        const isFirstMessage = messages.length === 0;
        const userMessage = message;
        const userImage = selectedImage;

        const updatedMessages: Message[] = [...messages, {
            role: 'user' as const,
            content: userMessage,
            image: userImage || undefined
        }];

        const updatedSessions = sessions.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    title: isFirstMessage ? userMessage : session.title,
                    messages: updatedMessages,
                    updatedAt: new Date()
                };
            }
            return session;
        });
        setSessions(updatedSessions);

        setMessage('');
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setLoading(true);

        try {
            const apiKey = getApiKey();
            const userData = getUserData();

            if (!apiKey || !userData?.privy_user_id) {
                toast({
                    title: "Authentication required",
                    description: "Please log in to use the chat feature.",
                    variant: 'destructive',
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => login()}
                            className="bg-white hover:bg-gray-100 text-destructive border-destructive/20"
                        >
                            Log In
                        </Button>
                    ),
                });
                setLoading(false);
                return;
            }

            // Call backend API directly with privy_user_id query parameter
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';
            const url = `${apiBaseUrl}/v1/chat/completions?privy_user_id=${encodeURIComponent(userData.privy_user_id)}`;

            console.log('Sending chat request to:', url);
            console.log('API Key:', apiKey.substring(0, 10) + '...');
            console.log('Model:', selectedModel.value);

            // Prepare message content with image if present
            let messageContent: any = userMessage;
            if (userImage) {
                messageContent = [
                    { type: 'text', text: userMessage },
                    { type: 'image_url', image_url: { url: userImage } }
                ];
            }

            // Initialize assistant message with streaming flag
            const assistantMessage: Message = {
                role: 'assistant',
                content: '',
                reasoning: '',
                isStreaming: true
            };

            // Add streaming message to UI
            const streamingSessions = sessions.map(session => {
                if (session.id === activeSessionId) {
                    return {
                        ...session,
                        messages: [...updatedMessages, assistantMessage],
                        updatedAt: new Date()
                    };
                }
                return session;
            });
            setSessions(streamingSessions);
            setLoading(false); // Stop loading spinner, but message is still streaming

            try {
                // Use streaming API
                const modelValue = selectedModel.value === 'gpt-4o mini' ? 'deepseek/deepseek-chat' : selectedModel.value;

                // Accumulate content locally to avoid state closure issues
                let accumulatedContent = '';
                let accumulatedReasoning = '';

                for await (const chunk of streamChatResponse(
                    url,
                    apiKey,
                    modelValue,
                    [{ role: 'user', content: messageContent }]
                )) {
                    // Accumulate content locally
                    accumulatedContent += chunk.content || '';
                    accumulatedReasoning += chunk.reasoning || '';

                    // Update the assistant message with streamed content
                    setSessions(prev => prev.map(session => {
                        if (session.id === activeSessionId) {
                            const messages = [...session.messages];
                            const lastMessage = messages[messages.length - 1];

                            if (lastMessage.role === 'assistant') {
                                lastMessage.content = accumulatedContent;
                                lastMessage.reasoning = accumulatedReasoning;
                                lastMessage.isStreaming = !chunk.done;
                            }

                            return {
                                ...session,
                                messages,
                                updatedAt: new Date()
                            };
                        }
                        return session;
                    }));
                }

                // Use the accumulated content instead of reading from stale state
                const finalContent = accumulatedContent;

                // Save messages to API
                try {
                    if (activeSessionId) {
                        // Get the current session from the React state
                        const currentSession = sessions.find(s => s.id === activeSessionId);

                        // Save user message - this may create a new API session
                        const userResult = await apiHelpers.saveMessage(
                            activeSessionId,
                            'user',
                            userMessage,
                            selectedModel?.value,
                            undefined,
                            sessions
                        );

                        // Create updated sessions with the API session ID if one was created
                        let updatedSessions = sessions;
                        if (userResult?.apiSessionId && userResult.apiSessionId !== currentSession?.apiSessionId) {
                            console.log(`Updating session ${activeSessionId} with API session ID: ${userResult.apiSessionId}`);
                            // Use functional setState to avoid overwriting streamed content
                            setSessions(prev => {
                                updatedSessions = prev.map(session =>
                                    session.id === activeSessionId
                                        ? { ...session, apiSessionId: userResult.apiSessionId }
                                        : session
                                );
                                return updatedSessions;
                            });
                        }

                        // Save assistant message - use the updated sessions that include the API session ID
                        const assistantResult = await apiHelpers.saveMessage(
                            activeSessionId,
                            'assistant',
                            finalContent,
                            selectedModel?.value,
                            undefined,
                            updatedSessions
                        );

                        // Update session title in API if this is the first message
                        const sessionForTitle = updatedSessions.find(s => s.id === activeSessionId);
                        if (isFirstMessage && sessionForTitle?.apiSessionId) {
                            try {
                                const apiKey = getApiKey();
                                if (apiKey) {
                                    const chatAPI = new ChatHistoryAPI(apiKey);
                                    await chatAPI.updateSession(sessionForTitle.apiSessionId, userMessage);
                                }
                            } catch (error) {
                                console.error('Failed to update session title in API:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to save messages to API:', error);
                }

            } catch (streamError) {
                console.error('Streaming error:', streamError);

                // Remove streaming message and show error
                setSessions(prev => prev.map(session => {
                    if (session.id === activeSessionId) {
                        return {
                            ...session,
                            messages: [...updatedMessages, {
                                role: 'assistant' as const,
                                content: 'Sorry, there was an error processing your request. Please try again.',
                            }],
                            updatedAt: new Date()
                        };
                    }
                    return session;
                }));

                // Determine error type and provide helpful message
                const errorMessage = streamError instanceof Error ? streamError.message : 'Failed to get response';
                let toastTitle = "Error";
                let toastDescription = errorMessage;

                // Handle API key validation errors (403)
                if (errorMessage.includes('API key') || errorMessage.includes('403')) {
                    toastTitle = "Session Expired";
                    toastDescription = "Your session has expired. Please refresh the page and log in again.";
                }
                // Handle rate limit errors (429)
                else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
                    toastTitle = "Rate Limit Reached";
                    toastDescription = "You've exceeded the limit of 100 requests per minute (burst of 20). Please wait a moment before trying again.";
                }

                toast({
                    title: toastTitle,
                    description: toastDescription,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Send message error:', error);

            toast({
                title: "Error",
                description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive'
            });

            // Revert message update on error
            setSessions(prev => prev.map(session => {
                if (session.id === activeSessionId) {
                    return { ...session, messages };
                }
                return session;
            }));
            setLoading(false);
        }
    };
    
  return (
    <div className="flex h-[calc(100svh-130px)] bg-background">
      {/* Left Sidebar */}
        <div className="hidden lg:flex w-56 xl:w-72 bg-muted/20 border-r justify-end">
          <ChatSidebar 
            sessions={sessions} 
            activeSessionId={activeSessionId} 
            setActiveSessionId={setActiveSessionId} 
            createNewChat={createNewChat}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
      <img
        src="/logo_transparent.svg"
        alt="Stats"
        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[75vh] h-[75vh] pointer-events-none opacity-50 hidden lg:block dark:hidden"
      />
      <img
        src="/logo_black.svg"
        alt="Stats"
        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[75vh] h-[75vh] pointer-events-none opacity-50 hidden dark:lg:block"
      />

       
        
        {/* Header with title and model selector */}
        <header className="relative z-10 w-full flex items-center justify-between gap-2 lg:gap-4 p-4 lg:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="lg:hidden flex-shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu/></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <ChatSidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    setActiveSessionId={setActiveSessionId}
                    createNewChat={createNewChat}
                    onDeleteSession={handleDeleteSession}
                    onRenameSession={handleRenameSession}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isEditingTitle ? (
                <Input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={() => {
                    if (editedTitle.trim() && editedTitle !== activeSession?.title && activeSessionId) {
                      handleRenameSession(activeSessionId, editedTitle.trim());
                    }
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editedTitle.trim() && editedTitle !== activeSession?.title && activeSessionId) {
                        handleRenameSession(activeSessionId, editedTitle.trim());
                      }
                      setIsEditingTitle(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-lg lg:text-2xl font-semibold h-auto px-2 py-1"
                />
              ) : (
                <>
                  <h1 className="text-lg lg:text-2xl font-semibold truncate">{activeSession?.title || 'Untitled Chat'}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 hidden sm:flex"
                    onClick={() => {
                      setEditedTitle(activeSession?.title || '');
                      setIsEditingTitle(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card flex-shrink-0">
            <ModelSelect selectedModel={selectedModel} onSelectModel={setSelectedModel} />
          </div>
        </header>

        {/* Main content area */}
        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
          {/* Chat messages area */}
          {messages.length > 0 && (
            <div ref={chatContainerRef} className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-y-auto p-4 lg:p-6 bg-card max-w-4xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="rounded-lg p-3 bg-primary text-primary-foreground">
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded image"
                            className="max-w-[200px] lg:max-w-xs rounded-lg mb-2"
                          />
                        )}
                        <div className="text-sm whitespace-pre-wrap text-white">{msg.content}</div>
                      </div>
                    ) : (
                      <div className="rounded-lg p-3 bg-card border border-border">
                        <div className="flex items-center justify-between mb-2">
                          {selectedModel?.label && <p className="text-xs font-semibold">{selectedModel.label}</p>}
                        </div>
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        {/* Action Buttons - always visible in bottom right */}
                        <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-border">
                          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(msg.content)} className="h-8 w-8 p-0 hover:bg-muted" title="Copy response">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigator.share({ text: msg.content })} className="h-8 w-8 p-0 hover:bg-muted" title="Share response">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          {handleRegenerate && (
                            <Button variant="ghost" size="sm" onClick={handleRegenerate} className="h-8 w-8 p-0 hover:bg-muted" title="Regenerate response">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <ChatSkeleton />}
            </div>
          )}

          {/* Welcome screen when no messages */}
          {messages.length === 0 && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 lg:p-6 w-full">
              <h1 className="text-2xl lg:text-4xl font-bold mb-6 lg:mb-8">What's On Your Mind?</h1>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
                <ExamplePrompt 
                  title="What model is better for coding?" 
                  subtitle="Compare different AI models for programming tasks"
                  onClick={() => handleExamplePromptClick("What model is better for coding?")}
                />
                <ExamplePrompt 
                  title="How long would it take to walk to the moon?" 
                  subtitle="Calculate travel time and distance to the moon"
                  onClick={() => handleExamplePromptClick("How long would it take to walk to the moon?")}
                />
                <ExamplePrompt 
                  title="When did England last win the world cup?" 
                  subtitle="Get the latest football world cup information"
                  onClick={() => handleExamplePromptClick("When did England last win the world cup?")}
                />
                <ExamplePrompt 
                  title="Which athlete has won the most gold medals?" 
                  subtitle="Find Olympic and sports statistics"
                  onClick={() => handleExamplePromptClick("Which athlete has won the most gold medals?")}
                />
              </div>
            </div>
          )}

          {/* Message input area - fixed at bottom */}
          <div className="w-full p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="w-full">
              <div className="relative">
                {/* Image preview */}
                {selectedImage && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={selectedImage}
                      alt="Selected image"
                      className="max-w-[200px] lg:max-w-xs max-h-24 lg:max-h-32 rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1 px-2 py-2 bg-card rounded-xl border border-border">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Input
                    ref={messageInputRef}
                    placeholder="Start A Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="border-0 bg-transparent focus-visible:ring-0 text-base flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                    className="h-8 w-8"
                  >
                     <img src="/Frame 13.svg" alt="Send" width={34} height={34} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100svh-130px)] items-center justify-center">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
