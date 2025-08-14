
"use client"

import { useState, useRef, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Paperclip, 
  Settings,
  Send,
  Bot,
  User,
  Box,
  Globe,
  Plus
} from 'lucide-react';
import { chat } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const ChatMessage = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
             {!isUser && <Avatar className="w-8 h-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>}
            <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                     {!isUser && <p className="text-xs font-semibold mb-1">GPT-4o-mini (2024-07-18)</p>}
                    <p className="text-sm">{message.content}</p>
                </div>
            </div>
             {isUser && <Avatar className="w-8 h-8"><AvatarFallback>J</AvatarFallback></Avatar>}
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

export default function Home() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'Hello! How can I assist you today?' }
    ]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const chatContainerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim()) {
            toast({
                title: "Cannot send message",
                description: "Please enter a message.",
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
                modelName: 'GPT-4o-mini',
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
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14))] justify-center items-center p-4">
        <div ref={chatContainerRef} className="flex-grow w-full max-w-4xl flex flex-col gap-6 overflow-y-auto pr-4 justify-end">
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
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
    </div>
  );
}
