import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/context/EditorContext';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const { openTabs, activeTabId } = useEditor();

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Connect to WebSocket terminal
    const websocket = new WebSocket('ws://localhost:3002');
    
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
        setOutput(prev => [...prev, 'Terminal ready. Type commands below.\n']);
      }
    };
    
    websocket.onclose = () => {
      console.log('Terminal WebSocket disconnected');
      setIsConnected(false);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  const sendCommand = (command: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: 'input', data: command + '\n' }));
      setOutput(prev => [...prev, `> ${command}\n`]);
      setInput('');
    }
  };

  const runCurrentFile = async () => {
    if (!activeTab) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeTab.content,
          language: activeTab.language,
          filename: activeTab.fileName
        })
      });
      
      const result = await response.json();
      setOutput(prev => [
        ...prev,
        `\n--- Running ${activeTab.fileName} ---\n`,
        result.output,
        `--- Exit code: ${result.exitCode} ---\n\n`
      ]);
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error.message}\n`]);
    }
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  return (
    <div className="flex flex-col h-full bg-pinnacle-editor">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-primary" />
          <span className="text-sm font-medium">Terminal</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="flex items-center gap-2">
          {activeTab && (
            <Button
              onClick={runCurrentFile}
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
            >
              <Play size={12} className="mr-1" />
              Run {activeTab.fileName}
            </Button>
          )}
          <Button
            onClick={clearTerminal}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
          >
            <Square size={12} className="mr-1" />
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <div ref={terminalRef} className="whitespace-pre-wrap">
          {output.map((line, index) => (
            <div key={index} className="text-foreground">
              {line}
            </div>
          ))}
        </div>
        
        <div className="flex items-center mt-2">
          <span className="text-primary mr-2">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendCommand(input);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-foreground"
            placeholder="Type command..."
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}