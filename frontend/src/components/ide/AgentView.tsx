import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Plus, ChevronDown, X, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor } from '@/context/EditorContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  fileAction?: any;
  integrateAction?: {
    code: string;
    targetFile: string;
  };
}

// Global chat sessions storage
let globalChatSessions: ChatSession[] = [
  {
    id: '1',
    title: 'New Chat',
    createdAt: new Date(),
    messages: [
      {
        id: '1',
        type: 'agent',
        content: 'Hello! I\'m the Verilog Code Generator. I can create Verilog modules for digital components like full adders, multiplexers, counters, and more using Ollama.',
        timestamp: new Date()
      }
    ]
  }
];
let currentSessionId = '1';

export function AgentView() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(globalChatSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(currentSessionId);
  const [input, setInput] = useState('');
  const [ragStatus, setRagStatus] = useState<{agent_ready: boolean, rag_ready: boolean} | null>(null);
  const [showFileSuggestions, setShowFileSuggestions] = useState(false);
  const [fileSuggestions, setFileSuggestions] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { openTabs, activeTabId, updateTabContent, openFile, saveFile } = useEditor();

  const activeSession = chatSessions.find(session => session.id === activeSessionId);
  const messages = activeSession?.messages || [];
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  // Sync with global sessions
  useEffect(() => {
    setChatSessions([...globalChatSessions]);
    setActiveSessionId(currentSessionId);
  }, []);

  // Update global sessions when local sessions change
  useEffect(() => {
    globalChatSessions = [...chatSessions];
    currentSessionId = activeSessionId;
  }, [chatSessions, activeSessionId]);

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



  const getOpenFilesContext = () => {
    return openTabs.map(tab => ({
      filename: tab.fileName,
      filepath: tab.filePath,
      content: tab.content,
      language: tab.language,
      isModified: tab.isModified
    }));
  };

  const getActiveFileContext = () => {
    if (!activeTab) return null;
    return {
      filename: activeTab.fileName,
      filepath: activeTab.filePath,
      content: activeTab.content,
      language: activeTab.language,
      isModified: activeTab.isModified
    };
  };

  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      createdAt: new Date(),
      messages: [
        {
          id: '1',
          type: 'agent',
          content: 'Hello! I\'m the Verilog Code Generator. I can create Verilog modules for digital components like full adders, multiplexers, counters, and more using Ollama.',
          timestamp: new Date()
        }
      ]
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatSessions.length === 1) return; // Keep at least one session
    
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
      setActiveSessionId(remainingSessions[0]?.id || '');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title: title.slice(0, 50) + (title.length > 50 ? '...' : '') }
        : session
    ));
  };

  const handleApplyChanges = (messageId: string, fileAction: any) => {
    if (activeTab && fileAction.content) {
      updateTabContent(activeTab.id, fileAction.content);
      
      // Update the message to show changes applied
      setChatSessions(prev => prev.map(session => 
        session.id === activeSessionId 
          ? { 
              ...session, 
              messages: session.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: `✅ Changes applied to ${fileAction.filename}`, fileAction: undefined }
                  : msg
              )
            }
          : session
      ));
    }
  };

  const handleRejectChanges = (messageId: string) => {
    // Update the message to show changes rejected
    setChatSessions(prev => prev.map(session => 
      session.id === activeSessionId 
        ? { 
            ...session, 
            messages: session.messages.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: `❌ Changes cancelled. The file was not modified.`, fileAction: undefined }
                : msg
            )
          }
        : session
    ));
  };

  const handleIntegrateCode = async (messageId: string, integrateAction: any) => {
    try {
      const response = await fetch('http://localhost:3010/api/file', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const { content } = await response.json();
        const updatedContent = content + '\n\n' + integrateAction.code;
        
        await fetch('http://localhost:3010/api/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: integrateAction.targetFile,
            content: updatedContent
          })
        });
        
        // Update message to show integration success
        setChatSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { 
                ...session, 
                messages: session.messages.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: `✅ Code integrated into ${integrateAction.targetFile}`, integrateAction: undefined }
                    : msg
                )
              }
            : session
        ));
        
        // Open the file if not already open
        if (!openTabs.find(tab => tab.filePath === integrateAction.targetFile)) {
          openFile(integrateAction.targetFile);
        }
      }
    } catch (error) {
      console.error('Integration failed:', error);
    }
  };

  const fetchFileSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:3010/api/files?path=' + encodeURIComponent(process.cwd()));
      const files = await response.json();
      setFileSuggestions(files.filter((f: any) => !f.isDirectory));
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.endsWith('@')) {
      setShowFileSuggestions(true);
      fetchFileSuggestions();
    } else {
      setShowFileSuggestions(false);
    }
  };

  const handleFileSelect = (file: any) => {
    setSelectedFile(file.path);
    setInput(input.slice(0, -1) + `@${file.name} `);
    setShowFileSuggestions(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    // Update session title with first user message
    if (activeSession.title === 'New Chat' && activeSession.messages.length === 1) {
      updateSessionTitle(activeSessionId, input);
    }

    // Add user message to active session
    setChatSessions(prev => prev.map(session => 
      session.id === activeSessionId 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));
    
    setInput('');

    try {
      const response = await fetch('http://localhost:3010/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {
            openFiles: getOpenFilesContext(),
            activeFile: getActiveFileContext(),
            selectedFile: selectedFile
          }
        })
      });

      const data = await response.json();
      
      // Try to parse JSON response if it looks like JSON
      let parsedAction = null;
      if (data.response && data.response.trim().startsWith('{')) {
        try {
          // Decode HTML entities before parsing
          const decodedResponse = data.response
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
          parsedAction = JSON.parse(decodedResponse);
        } catch (e) {
          // If parsing fails, treat as regular response
        }
      }
      
      // Check if agent wants to modify the active file (from parsed JSON)
      if (parsedAction && parsedAction.action === 'modify_active_file') {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: `I want to modify ${parsedAction.filename}:\n\n${parsedAction.message}`,
          timestamp: new Date(),
          fileAction: parsedAction
        };
        
        setChatSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, agentResponse] }
            : session
        ));
        
        return;
      }
      
      // Check if agent response contains code for integration
      if (data.integrateAction) {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: data.response,
          timestamp: new Date(),
          integrateAction: data.integrateAction
        };
        
        setChatSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, agentResponse] }
            : session
        ));
        
        return;
      }
      
      // Check if agent wants to modify the active file (from backend response)
      if (data.fileAction) {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: `I want to modify ${data.fileAction.filename || 'the active file'}:\n\n${data.fileAction.message || 'Apply changes?'}`,
          timestamp: new Date(),
          fileAction: data.fileAction
        };
        
        setChatSessions(prev => prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, messages: [...session.messages, agentResponse] }
            : session
        ));
        
        return;
      }
      
      // Regular agent response
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response,
        timestamp: new Date()
      };

      // Add agent response to active session
      setChatSessions(prev => prev.map(session => 
        session.id === activeSessionId 
          ? { ...session, messages: [...session.messages, agentResponse] }
          : session
      ));
      
      // If a file was created, refresh the file explorer
      if (data.filePath) {
        console.log('File created/modified:', data.filePath);
      }
      
      // If the response contains file modifications for open tabs
      if (data.fileModifications) {
        data.fileModifications.forEach((mod: any) => {
          const tab = openTabs.find(t => t.filePath === mod.filepath);
          if (tab) {
            updateTabContent(tab.id, mod.content);
          }
        });
      }
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: '❌ **Connection Error**: Failed to connect to backend\n\n💡 **Please check:**\n- Backend server is running on port 3010\n- Ollama is running with qwen2.5-coder:3b model\n- Network connection is available',
        timestamp: new Date()
      };
      
      setChatSessions(prev => prev.map(session => 
        session.id === activeSessionId 
          ? { ...session, messages: [...session.messages, errorResponse] }
          : session
      ));
    }
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <Bot size={16} className="text-primary" />
        <span>Verilog Generator</span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleNewChat}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs hover:bg-pinnacle-hover"
          >
            <Plus size={12} className="mr-1" />
            New Chat
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs hover:bg-pinnacle-hover"
              >
                <ChevronDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-pinnacle-sidebar border-border max-h-60 overflow-y-auto">
              {chatSessions.map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`text-foreground hover:bg-pinnacle-hover cursor-pointer flex items-center justify-between group ${
                    session.id === activeSessionId ? 'bg-pinnacle-hover' : ''
                  }`}
                >
                  <span className="flex-1 truncate pr-2">{session.title}</span>
                  {chatSessions.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                    >
                      <X size={10} className="text-red-400" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                {message.type === 'agent' ? (
                  <div className="space-y-2">
                    {message.fileAction ? (
                      <div className="space-y-3">
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApplyChanges(message.id, message.fileAction)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Apply Changes
                          </Button>
                          <Button
                            onClick={() => handleRejectChanges(message.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      (() => {
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
                          
                          // Add code block with apply button
                          const codeContent = match[0];
                          parts.push(
                            <div key={`code-${match.index}`} className="relative">
                              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {codeContent}
                              </div>
                              <Button
                                onClick={async () => {
                                  if (activeTab) {
                                    console.log('Applying code to file:', activeTab.fileName);
                                    console.log('Code content:', codeContent);
                                    updateTabContent(activeTab.id, codeContent);
                                    await saveFile(activeTab.id);
                                    console.log('File saved to disk');
                                  } else {
                                    alert('No file is currently open. Please open a file first.');
                                  }
                                }}
                                size="sm"
                                className="absolute top-1 right-1 bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-0.5 h-5"
                              >
                                Apply
                              </Button>
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
                    )}
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
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Pinnacle Agent anything... (type @ to select files)"
                className="flex-1 bg-pinnacle-editor border-border"
                onKeyDown={(e) => e.key === 'Enter' && !showFileSuggestions && handleSend()}
              />
              {showFileSuggestions && fileSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-pinnacle-sidebar border border-border rounded-md mt-1 max-h-40 overflow-y-auto z-50">
                  {fileSuggestions.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => handleFileSelect(file)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-pinnacle-hover cursor-pointer text-sm"
                    >
                      <FileText size={14} className="text-primary" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSend} size="sm" className="px-3">
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}