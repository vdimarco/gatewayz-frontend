
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Box
} from 'lucide-react';
import { ModelSelect } from '@/components/chat/model-select';
import './chat.css';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <aside className="chat-sidebar flex flex-col gap-4 bg-muted/20 p-4">
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

export default function ChatPage() {
    const [message, setMessage] = useState('');

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
                <h1 className="text-xl font-semibold">OpenRouter</h1>
            </div>
            <div className="flex items-center gap-2">
                 <ModelSelect />
                 <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Model</Button>
            </div>
        </header>

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

        <div className="w-full max-w-4xl">
            <Card className="p-4">
                <div className="relative">
                <Textarea 
                    placeholder="Start a new message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="pr-16"
                    rows={1}
                />
                 <Button size="icon" className="absolute right-2 bottom-2">
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
