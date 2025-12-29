import React, { useState } from 'react';
import { Bot, Send, Lightbulb, Code, HelpCircle, Zap, ArrowUp, Search, Wrench } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor } from '@/context/EditorContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export function AgentView() {
  const { openTabs, activeTabId, currentWorkspace } = useEditor();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your AI coding assistant with a three-agent system: Planner → Code Editor → Reviewer. I can safely analyze, edit, and validate your code.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  const quickActions = [
    { icon: Search, label: 'Plan & Edit', prompt: 'Analyze my code and suggest improvements with implementation' },
    { icon: Lightbulb, label: 'Fix Bug', prompt: 'Find and fix the bug in this code' },
    { icon: Code, label: 'Add Feature', prompt: 'Add a new feature to this code' },
    { icon: Wrench, label: 'Refactor', prompt: 'Refactor this code for better maintainability' },
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

    // Send to appropriate agent based on selection
    try {
      const response = await fetch('http://localhost:3001/api/agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          currentFile: activeTab ? {
            path: activeTab.filePath,
            content: activeTab.content,
            language: activeTab.language
          } : null
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: result.response || result.suggestion || 'I\'ve processed your request successfully.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Agent request failed:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `❌ **Connection Error**: ${error.message}\n\n💡 **Please check:**\n- Backend server is running on port 3001\n- Gemini API key is configured\n- Internet connection is available`,
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
        <span>Multi-Agent AI</span>
      </div>

      <div className="px-4 py-2 border-b border-border">
        {activeTab && (
          <div className="text-xs text-muted-foreground">
            Working on: {activeTab.fileName}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-b border-border">
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
                    <span className="text-xs font-medium">Multi-Agent AI</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap font-mono">{message.content}</div>
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
            placeholder="Ask the AI assistant..."
            className="flex-1 bg-pinnacle-editor border-border"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="sm" className="px-3">
            <ArrowUp size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}