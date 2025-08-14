
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  User
} from 'lucide-react';
import { ModelSelect, type ModelOption, allModels } from '@/components/chat/model-select';
import './chat.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chat } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Message = {
    role: 'user' | 'assistant';
    content: string;
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

const ExamplePrompt = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <Card className="hover:border-primary cursor-pointer p-3 text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Card>
)

const ChatSidebar = () => (
    <aside className="chat-sidebar flex flex-col gap-4 bg-[#f7f8fa] dark:bg-muted/20 p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Chats</h2>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>New Chat</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." className="pl-9" />
        </div>
        <div className="flex-grow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase my-2">Today</h3>
            <ul>
                <li>
                    <Button variant="ghost" className="w-full justify-start">
                        Untitled Chat
                    </Button>
                </li>
            </ul>
        </div>
    </aside>
)

const ChatMessage = ({ message, modelName }: { message: Message, modelName: string | undefined}) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
             {!isUser && <Avatar className="w-8 h-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>}
            <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                     {!isUser && <p className="text-xs font-semibold mb-1">{modelName}</p>}
                    <p className="text-sm">{message.content}</p>
                </div>
            </div>
             {isUser && <Avatar className="w-8 h-8"><AvatarFallback><User/></AvatarFallback></Avatar>}
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

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelOption | null>(
        allModels.find(m => m.value === 'gpt-4o mini') || null
    );
    const { toast } = useToast();
    const chatContainerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedModel) {
            toast({
                title: "Cannot send message",
                description: !selectedModel ? "Please select a model first." : "Please enter a message.",
                variant: 'destructive'
            });
            return;
        }

        const newMessages: Message[] = [...messages, { role: 'user', content: message }];
        setMessages(newMessages);
        setMessage('');
        setLoading(true);

        try {
            const response = await chat({
                modelName: selectedModel.value,
                prompt: message,
            });
            setMessages([...newMessages, { role: 'assistant', content: response }]);
        } catch (error) {
            toast({
                title: "Error",
                description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive'
            });
             setMessages(newMessages); // Revert to previous state if API fails
        } finally {
            setLoading(false);
        }
    };
    
  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))]">
        <div className="hidden lg:flex">
            <ChatSidebar />
        </div>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 items-center bg-background">
        <header className="w-full max-w-4xl flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                 <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><Menu/></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] p-0">
                            <ChatSidebar />
                        </SheetContent>
                    </Sheet>
                 </div>
                <h1 className="text-xl font-semibold">{selectedModel ? selectedModel.label : 'Select a Model'}</h1>
            </div>
            <div className="flex items-center gap-2">
                 <ModelSelect selectedModel={selectedModel} onSelectModel={setSelectedModel} />
            </div>
        </header>

        <div ref={chatContainerRef} className="flex-grow w-full max-w-4xl flex flex-col gap-6 overflow-y-auto pr-4">
             {messages.length === 0 && !loading && (
                <div className="flex-grow w-full max-w-4xl flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <ModelSuggestionCard title="Flagship models" icon={Bot}/>
                        <ModelSuggestionCard title="Best roleplay models" icon={Heart}/>
                        <ModelSuggestionCard title="Best coding models" icon={Code}/>
                        <ModelSuggestionCard title="Reasoning models" icon={BrainCircuit}/>
                    </div>
                     <ScrollArea className="w-full pb-4" orientation="horizontal">
                        <div className="flex gap-4">
                            <ExamplePrompt title="Nutritional Advanc..." subtitle="higher education."/>
                            <ExamplePrompt title="9.9 vs 9.11" subtitle="Which one is larger?"/>
                            <ExamplePrompt title="Strawberry Test" subtitle="How many r's are in the word"/>
                            <ExamplePrompt title="Poem Riddle" subtitle="Compose a 12-line poem"/>
                            <ExamplePrompt title="Personal Financ..." subtitle="Draft up a portfolio"/>
                        </div>
                     </ScrollArea>
                </div>
            )}
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} modelName={selectedModel?.label} />
            ))}
            {loading && <ChatSkeleton />}
        </div>

        <div className="w-full max-w-4xl mt-auto pt-4">
            <Card className="p-4">
                <div className="relative">
                <Textarea 
                    placeholder="Start a new message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    className="pr-16"
                    rows={1}
                />
                 <Button size="icon" className="absolute right-2 bottom-2" onClick={handleSendMessage} disabled={loading || !message.trim()}>
                     <Send className="h-4 w-4"/>
                 </Button>
                </div>
                 <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" size="icon"><Settings className="h-4 w-4"/></Button></TooltipTrigger>
                                <TooltipContent><p>Settings</p></TooltipContent>
                            </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" size="icon"><Paperclip className="h-4 w-4"/></Button></TooltipTrigger>
                                <TooltipContent><p>Attach file</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                         <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="web-search">Web search</Label>
                            <Switch id="web-search" />
                         </div>
                    </div>
                     <Button variant="ghost" className="flex items-center gap-2">
                        <Box className="h-4 w-4"/>
                        App
                     </Button>
                 </div>
            </Card>
        </div>
      </main>
    </div>
  );
}
