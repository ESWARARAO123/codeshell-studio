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
      content: 'Hello! I\'m the Verilog Code Generator. I can create Verilog modules for digital components like full adders, multiplexers, counters, and more using Ollama.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const quickActions = [
    { icon: Code, label: 'Full Adder', prompt: 'Generate a full adder' },
    { icon: HelpCircle, label: 'Half Adder', prompt: 'Generate a half adder' },
    { icon: Zap, label: 'Multiplexer', prompt: 'Generate a 4-to-1 multiplexer' },
    { icon: Lightbulb, label: 'Counter', prompt: 'Generate an 8-bit counter' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:3001/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {}
        })
      });

      const data = await response.json();
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: '❌ **Connection Error**: Failed to connect to backend\n\n💡 **Please check:**\n- Backend server is running on port 3001\n- Ollama is running with qwen2.5-coder:3b model\n- Network connection is available',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <Bot size={16} className="text-primary" />
        <span>Verilog Generator</span>
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
                {message.content.includes('module') && message.content.includes('endmodule') ? (
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {message.content}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-mono text-sm">{message.content}</div>
                )}
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