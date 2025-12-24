import React, { useState } from 'react';
import { Bot, Send, Lightbulb, Code, HelpCircle, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function AgentView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m Pinnacle Agent, your AI coding assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const quickActions = [
    { icon: Code, label: 'Generate Code', prompt: 'Generate a React component' },
    { icon: HelpCircle, label: 'Explain Code', prompt: 'Explain this code to me' },
    { icon: Zap, label: 'Fix Bugs', prompt: 'Help me fix bugs in my code' },
    { icon: Lightbulb, label: 'Optimize', prompt: 'Optimize my code performance' },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    const agentResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      content: `I understand you want help with: "${input}". I'm here to assist you with code generation, debugging, and optimization. What specific task would you like me to help with?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, agentResponse]);
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <Bot size={16} className="text-primary" />
        <span>Pinnacle Agent</span>
      </div>

      <div className="px-4 py-2">
        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex flex-col items-center gap-1 p-2 rounded hover:bg-pinnacle-hover text-xs"
            >
              <action.icon size={16} className="text-primary" />
              <span className="text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pinnacle-scrollbar">
        <div className="space-y-4 py-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-pinnacle-hover text-foreground'
                }`}
              >
                {message.type === 'agent' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={14} className="text-primary" />
                    <span className="text-xs font-medium">Pinnacle Agent</span>
                  </div>
                )}
                <div>{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pinnacle Agent anything..."
            className="flex-1 bg-pinnacle-editor border-border"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="sm" className="px-3">
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}