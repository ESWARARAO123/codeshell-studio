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
  const [ragStatus, setRagStatus] = useState<{agent_ready: boolean, rag_ready: boolean} | null>(null);

  // Check RAG status on component mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:3010/api/agent/status');
        const status = await response.json();
        setRagStatus(status);
      } catch (error) {
        console.log('Could not check RAG status');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);



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
      const response = await fetch('http://localhost:3010/api/agent/chat', {
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
        content: '❌ **Connection Error**: Failed to connect to backend\n\n💡 **Please check:**\n- Backend server is running on port 3010\n- Ollama is running with qwen2.5-coder:3b model\n- Network connection is available',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <Bot size={16} className="text-primary" />
        <span>Verilog Generator</span>
        {ragStatus && (
          <div className="ml-auto flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              ragStatus.rag_ready ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-xs">
              {ragStatus.rag_ready ? 'RAG Ready' : 'Basic Mode'}
            </span>
          </div>
        )}
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
                {message.type === 'agent' ? (
                  <div className="space-y-2">
                    {(() => {
                      const content = message.content;
                      const parts = [];
                      let currentIndex = 0;
                      
                      // Find all code blocks (module...endmodule)
                      const moduleRegex = /module[\s\S]*?endmodule/gi;
                      let match;
                      
                      while ((match = moduleRegex.exec(content)) !== null) {
                        // Add text before code block
                        if (match.index > currentIndex) {
                          const preText = content.substring(currentIndex, match.index).trim();
                          if (preText) {
                            parts.push(
                              <div key={`pre-${match.index}`} className="whitespace-pre-wrap text-sm">
                                {preText}
                              </div>
                            );
                          }
                        }
                        
                        // Add code block
                        parts.push(
                          <div key={`code-${match.index}`} className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                            {match[0]}
                          </div>
                        );
                        
                        currentIndex = match.index + match[0].length;
                      }
                      
                      // Add remaining text after last code block
                      if (currentIndex < content.length) {
                        const postText = content.substring(currentIndex).trim();
                        if (postText) {
                          parts.push(
                            <div key={`post-${currentIndex}`} className="whitespace-pre-wrap text-sm">
                              {postText}
                            </div>
                          );
                        }
                      }
                      
                      // If no code blocks found, display as normal text
                      if (parts.length === 0) {
                        parts.push(
                          <div key="normal" className="whitespace-pre-wrap text-sm">
                            {content}
                          </div>
                        );
                      }
                      
                      return parts;
                    })()
                    }
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