import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, FileOutput, AlertCircle, X, ChevronUp, ChevronDown, Plus, Trash2, Play } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function TerminalTab() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [output, setOutput] = useState<string[]>(['Terminal ready. Type commands below.\n']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openTabs, activeTabId } = useEditor();

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Connect to WebSocket terminal
    const websocket = new WebSocket('ws://localhost:3001');
    
    websocket.onopen = () => {
      console.log('Terminal WebSocket connected');
      setIsConnected(true);
      websocket.send(JSON.stringify({ type: 'start' }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'output') {
        setOutput(prev => [...prev, data.data]);
      } else if (data.type === 'ready') {
        setOutput(prev => [...prev, 'Terminal ready.\n']);
      }
    };
    
    websocket.onclose = () => {
      console.log('Terminal WebSocket disconnected');
      setIsConnected(false);
    };
    
    websocket.onerror = () => {
      setIsConnected(false);
      setOutput(prev => [...prev, 'WebSocket connection failed. Using fallback terminal.\n']);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const sendCommand = (command: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: 'input', data: command + '\n' }));
      setOutput(prev => [...prev, `> ${command}\n`]);
    } else {
      // Fallback terminal for basic commands
      setOutput(prev => [...prev, `> ${command}\n`]);
      
      if (command === 'clear') {
        setOutput(['Terminal ready.\n']);
      } else if (command === 'ls' || command === 'dir') {
        setOutput(prev => [...prev, 'src/  public/  package.json  README.md  vite.config.ts\n']);
      } else if (command.startsWith('echo ')) {
        setOutput(prev => [...prev, command.slice(5) + '\n']);
      } else if (command === 'pwd') {
        setOutput(prev => [...prev, '/workspace/codeshell-studio\n']);
      } else if (command === 'node -v') {
        setOutput(prev => [...prev, 'v20.10.0\n']);
      } else if (command === 'npm -v') {
        setOutput(prev => [...prev, '10.2.3\n']);
      } else {
        setOutput(prev => [...prev, `Command not found: ${command.split(' ')[0]}\n`]);
      }
    }
    setInput('');
  };

  const runCurrentFile = async () => {
    if (!activeTab) return;
    
    try {
      // First detect language from filename
      const detectResponse = await fetch(`http://localhost:3001/api/detect-language?filename=${encodeURIComponent(activeTab.fileName)}`);
      const detection = await detectResponse.json();
      
      if (!detection.canExecute) {
        setOutput(prev => [
          ...prev,
          `\n--- Cannot execute ${activeTab.fileName} ---\n`,
          detection.reason + '\n\n'
        ]);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeTab.content,
          language: detection.language,
          filename: activeTab.fileName
        })
      });
      
      const result = await response.json();
      setOutput(prev => [
        ...prev,
        `\n--- Running ${activeTab.fileName} (${detection.language}) ---\n`,
        result.output + '\n',
        `--- Exit code: ${result.exitCode} ---\n\n`
      ]);
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error.message}\n`]);
    }
  };

  const clearTerminal = () => {
    setOutput(['Terminal ready.\n']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCommand(input);
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-pinnacle-terminal" onClick={handleClick}>
      <div className="flex items-center justify-between px-2 py-1 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Fallback Mode'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activeTab && (
            <Button
              onClick={runCurrentFile}
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
            >
              <Play size={10} className="mr-1" />
              Run {activeTab.fileName}
            </Button>
          )}
          <Button
            onClick={clearTerminal}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1 p-2 font-mono text-sm pinnacle-scrollbar">
        <div className="whitespace-pre-wrap">
          {output.map((line, index) => (
            <div key={index} className="text-foreground">
              {line}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="text-primary">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground"
            placeholder="Type command..."
            autoFocus
          />
          <span className="w-2 h-4 bg-foreground animate-cursor-blink" />
        </form>
      </ScrollArea>
    </div>
  );
}

function OutputTab() {
  return (
    <div className="flex-1 p-2 bg-pinnacle-terminal font-mono text-sm">
      <div className="text-muted-foreground">
        [2024-01-15 10:30:45] Server started on port 5174
      </div>
      <div className="text-muted-foreground">
        [2024-01-15 10:30:46] Watching for file changes...
      </div>
      <div className="text-syntax-number">
        [2024-01-15 10:31:02] Build completed in 342ms
      </div>
    </div>
  );
}

function ProblemsTab() {
  return (
    <div className="flex-1 bg-pinnacle-terminal">
      <div className="p-4 text-center text-muted-foreground">
        No problems detected
      </div>
    </div>
  );
}

export function BottomPanel() {
  const { bottomPanelTab, setBottomPanelTab, isBottomPanelOpen, toggleBottomPanel } = useEditor();

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: TerminalIcon },
    { id: 'output' as const, label: 'Output', icon: FileOutput },
    { id: 'problems' as const, label: 'Problems', icon: AlertCircle },
  ];

  if (!isBottomPanelOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full border-t border-border">
      <div className="flex items-center justify-between bg-pinnacle-sidebar px-2">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBottomPanelTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wide transition-colors',
                bottomPanelTab === tab.id
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-pinnacle-hover rounded">
            <Plus size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-pinnacle-hover rounded">
            <Trash2 size={14} className="text-muted-foreground" />
          </button>
          <button onClick={toggleBottomPanel} className="p-1 hover:bg-pinnacle-hover rounded">
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          <button onClick={toggleBottomPanel} className="p-1 hover:bg-pinnacle-hover rounded">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanelTab === 'terminal' && <TerminalTab />}
        {bottomPanelTab === 'output' && <OutputTab />}
        {bottomPanelTab === 'problems' && <ProblemsTab />}
      </div>
    </div>
  );
}
