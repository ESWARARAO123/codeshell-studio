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
  const { openTabs, activeTabId } = useEditor();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your AI coding assistant. Select an agent and I\'ll help you with your code.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('review');

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  const agents = [
    { id: 'review', name: 'Code Review Agent', icon: Search, description: 'Analyze code for issues and improvements' },
    { id: 'suggestion', name: 'Code Suggestion Agent', icon: Lightbulb, description: 'Get intelligent code suggestions' },
    { id: 'generation', name: 'Code Generation Agent', icon: Code, description: 'Generate code from descriptions' },
  ];

  const quickActions = [
    { icon: Search, label: 'Review Code', prompt: 'Review my current code for issues', agent: 'review' },
    { icon: Lightbulb, label: 'Suggest Improvements', prompt: 'Suggest improvements for this code', agent: 'suggestion' },
    { icon: Code, label: 'Generate Code', prompt: 'Generate a new function', agent: 'generation' },
    { icon: Zap, label: 'Optimize', prompt: 'Optimize this code for performance', agent: 'suggestion' },
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
          agentType: selectedAgent,
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
        content: `❌ **Connection Error**: ${error.message}\n\n💡 **Please check:**\n- Backend server is running on port 3001\n- Ollama service is running\n- CodeLlama model is available`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleQuickAction = (prompt: string, agentType: string) => {
    setSelectedAgent(agentType);
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <Bot size={16} className="text-primary" />
        <span>Pinnacle Agent</span>
      </div>

      <div className="px-4 py-2 border-b border-border">
        <div className="text-xs text-muted-foreground mb-2">Select Agent</div>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-full bg-pinnacle-editor border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-pinnacle-sidebar border-border">
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="text-foreground hover:bg-pinnacle-hover">
                <div className="flex items-center gap-2">
                  <agent.icon size={14} />
                  <span>{agent.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeTab && (
          <div className="text-xs text-muted-foreground mt-2">
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
              onClick={() => handleQuickAction(action.prompt, action.agent)}
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
                    <span className="text-xs font-medium">
                      {agents.find(a => a.id === selectedAgent)?.name || 'Pinnacle Agent'}
                    </span>
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
            placeholder={`Ask ${agents.find(a => a.id === selectedAgent)?.name || 'agent'}...`}
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